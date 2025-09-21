import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('creem-signature');
    
    console.log('=== Creem Webhook Environment Check ===');
    console.log('Webhook secret configured:', process.env.CREEM_WEBHOOK_SECRET ? 'Yes' : 'No');
    console.log('Signature present:', signature ? 'Yes' : 'No');
    console.log('Body length:', body.length);
    console.log('User-Agent:', req.headers.get('user-agent'));
    
    console.log('Creem webhook received:', { signature: signature ? 'Present' : 'Missing', bodyLength: body.length });

    // 验证 webhook 签名 - 使用官方示例
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret);
      
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('Webhook signature verified successfully');
    } else {
      console.log('Webhook signature verification skipped (no secret or signature)');
    }

    const data = JSON.parse(body);
    const { eventType, object } = data;

    console.log('Processing webhook event:', eventType);

    switch (eventType) {
      case 'checkout.completed':
        await handleCheckoutCompleted(object);
        break;
      
      case 'subscription.paid':
        await handleSubscriptionPaid(object);
        break;
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(object);
        break;
      
      case 'refund.created':
        await handleRefundCreated(object);
        break;
      
      case 'dispute.created':
        await handleDisputeCreated(object);
        break;
      
      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(data: any) {
  try {
    const { order, customer, product, metadata, request_id } = data;
    
    console.log('=== Webhook Data Analysis ===');
    console.log('Raw webhook data structure:', {
      hasOrder: !!order,
      hasCustomer: !!customer,
      hasProduct: !!product,
      hasMetadata: !!metadata,
      hasRequestId: !!request_id,
      orderKeys: order ? Object.keys(order) : [],
      customerKeys: customer ? Object.keys(customer) : [],
      productKeys: product ? Object.keys(product) : [],
      metadataKeys: metadata ? Object.keys(metadata) : []
    });
    
    // 提取关键字段 - 健壮的external_id提取
    const externalId = order?.id || data?.id || data?.order?.id;
    console.log('Extracted external_id:', externalId);
    
    if (!externalId) {
      console.error('❌ No external_id found in webhook payload');
      return;
    }

    // 幂等性检查 - 如果订单已存在，直接返回
    const { data: existingOrder, error: existingOrderError } = await supabase
      .from('orders')
      .select('id, user_id, status, amount, bonus')
      .eq('external_id', externalId)
      .single();
    
    if (existingOrder) {
      console.log('✅ Order already processed (idempotent):', {
        orderId: existingOrder.id,
        userId: existingOrder.user_id,
        status: existingOrder.status,
        externalId: externalId,
        amount: existingOrder.amount,
        bonus: existingOrder.bonus
      });
      return; // 幂等返回，不重复处理
    }
    
    if (existingOrderError && existingOrderError.code !== 'PGRST116') {
      console.error('Error checking existing order:', existingOrderError);
    }

    // 健壮的request_id提取逻辑 - 兼容多种可能的payload结构
    let userId = request_id || 
                 metadata?.request_id || 
                 metadata?.user_id || 
                 order?.request_id || 
                 order?.metadata?.request_id || 
                 order?.metadata?.user_id;
    
    console.log('User ID extraction result:', {
      primary_request_id: request_id,
      metadata_request_id: metadata?.request_id,
      metadata_user_id: metadata?.user_id,
      order_request_id: order?.request_id,
      order_metadata_request_id: order?.metadata?.request_id,
      order_metadata_user_id: order?.metadata?.user_id,
      final_user_id: userId
    });

    // 计算积分
    let credits = metadata?.credits || getCreditsByProductId(product?.id);
    console.log('Credits calculation:', {
      metadataCredits: metadata?.credits,
      productCredits: getCreditsByProductId(product?.id),
      finalCredits: credits
    });
    
    // 准备订单数据
    const orderData = {
      external_id: externalId,
      amount: order?.amount || 0,
      bonus: credits,
      status: 'completed',
      provider: 'creem',
      metadata: {
        product_id: product?.id,
        credits,
        customer_email: customer?.email,
        request_id,
        order_data: order,
        product_data: product,
        customer_data: customer,
        raw_payload: data // 保存原始payload用于调试
      }
    };

    if (userId) {
      console.log('Processing payment for user ID:', userId);
      
      // 验证用户是否存在，不存在则创建
      const { data: userExists, error: userCheckError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', userId)
        .single();
      
      if (userCheckError) {
        console.log('User not found, creating user record...');
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: customer?.email || null,
            created_at: new Date().toISOString()
          });
        
        if (createUserError) {
          console.error('Failed to create user record:', createUserError);
        } else {
          console.log('✅ User record created successfully');
        }
      } else {
        console.log('✅ User exists:', userExists);
      }
      
      // 使用原子操作插入订单和更新积分
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          user_id: userId
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('❌ Insert order error:', orderError);
        return;
      }
      
      console.log('✅ Order recorded successfully:', insertedOrder);
      
      // 使用修复后的recharge_credits函数更新积分
      if (credits > 0) {
        console.log('Attempting to recharge credits:', { userId, credits, orderId: insertedOrder.id });
        
        const { data: result, error: rechargeError } = await supabase.rpc('recharge_credits', {
          p_user_id: userId,
          p_amount: credits
        });
        
        if (rechargeError) {
          console.error('❌ Recharge credits error:', rechargeError);
          console.error('Error details:', {
            code: rechargeError.code,
            message: rechargeError.message,
            details: rechargeError.details,
            hint: rechargeError.hint
          });
        } else {
          console.log('✅ Credits recharged successfully:', result);
          console.log('New balance:', result?.[0]?.new_balance);
        }
      }
    } else {
      console.log('⚠️ No user_id found - creating orphan order');
      
      // 创建orphan订单，不更新积分
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          user_id: null,
          status: 'orphan' // 标记为orphan状态
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('❌ Insert orphan order error:', orderError);
        return;
      }
      
      console.log('⚠️ Orphan order created:', insertedOrder);
      console.log('📧 Customer email for manual matching:', customer?.email);
    }

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

// 根据产品ID获取积分数量
function getCreditsByProductId(productId: string): number {
  const productCreditsMap: { [key: string]: number } = {
    // 测试环境产品ID映射
    'prod_hjE2miByilwiAMNFFfRm7': 300, // 小包 - 300积分
    'prod_j8RS5IyEKO0MiYG2Bdusi': 300, // 小包 - 300积分 (文档中的ID)
    
    // 生产环境产品ID映射
    'prod_3MFSvuWDwkK316p64whLf6': 300, // 小包 - 300积分
    
    // 根据你的实际套餐配置 - 需要根据实际产品ID更新
    // 小包: $4.99 - 300积分
    // 中包: $9.99 - 700积分  
    // 大包: $19.99 - 1600积分
    // 超大包: $49.99 - 4500积分
    // 超级包: $99.99 - 10000积分
    
    // 临时：所有产品都返回300积分，直到你创建不同的产品
    // 你可以通过metadata中的credits字段获取准确的积分数量
  };
  
  console.log('Product ID mapping:', { productId, credits: productCreditsMap[productId] });
  return productCreditsMap[productId] || 300; // 默认返回300积分
}

async function handleSubscriptionPaid(data: any) {
  try {
    const { customer, product, metadata } = data;
    
    console.log('Subscription paid:', { 
      customerEmail: customer?.email,
      productName: product?.name,
      amount: product?.price
    });

    // 处理订阅支付成功
    if (customer?.email) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', customer.email)
        .single();
      
      if (user) {
        // 记录订阅支付
        await supabase.from('orders').insert({
          user_id: user.id,
          amount: product?.price || 0,
          status: 'completed',
          provider: 'creem',
          external_id: data.id,
          metadata: {
            type: 'subscription',
            subscription_id: data.id,
            customer_email: customer.email,
            subscription_data: data
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error handling subscription paid:', error);
  }
}

async function handleSubscriptionCanceled(data: any) {
  try {
    const { customer, product } = data;
    
    console.log('Subscription canceled:', { 
      customerEmail: customer?.email,
      productName: product?.name
    });

    // 处理订阅取消
    if (customer?.email) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', customer.email)
        .single();
      
      if (user) {
        // 记录订阅取消
        await supabase.from('orders').insert({
          user_id: user.id,
          amount: 0,
          status: 'canceled',
          provider: 'creem',
          external_id: data.id,
          metadata: {
            type: 'subscription_canceled',
            subscription_id: data.id,
            customer_email: customer.email,
            subscription_data: data
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error handling subscription canceled:', error);
  }
}

async function handleRefundCreated(data: any) {
  try {
    const { customer, refund_amount, order } = data;
    
    console.log('Refund created:', { 
      customerEmail: customer?.email,
      refundAmount: refund_amount,
      orderId: order?.id
    });

    // 处理退款
    if (customer?.email && order?.id) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', customer.email)
        .single();
      
      if (user) {
        // 更新订单状态为退款
        await supabase
          .from('orders')
          .update({ 
            status: 'refunded',
            metadata: {
              refund_amount,
              refund_id: data.id,
              refund_data: data
            }
          })
          .eq('external_id', order.id);
      }
    }
    
  } catch (error) {
    console.error('Error handling refund created:', error);
  }
}

async function handleDisputeCreated(data: any) {
  try {
    const { customer, amount, order } = data;
    
    console.log('Dispute created:', { 
      customerEmail: customer?.email,
      disputeAmount: amount,
      orderId: order?.id
    });

    // 处理争议
    if (customer?.email && order?.id) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', customer.email)
        .single();
      
      if (user) {
        // 更新订单状态为争议
        await supabase
          .from('orders')
          .update({ 
            status: 'disputed',
            metadata: {
              dispute_amount: amount,
              dispute_id: data.id,
              dispute_data: data
            }
          })
          .eq('external_id', order.id);
      }
    }
    
  } catch (error) {
    console.error('Error handling dispute created:', error);
  }
}

// 验证 webhook 签名的函数
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return computedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}
