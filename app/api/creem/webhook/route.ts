import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('creem-signature');
    
    console.log('Creem webhook received:', { signature, bodyLength: body.length });

    // 验证 webhook 签名（临时禁用用于测试）
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.log('Webhook signature verification skipped (testing mode)');
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
    const { order, customer, product, metadata } = data;
    
    console.log('Checkout completed:', { 
      orderId: order?.id, 
      customerEmail: customer?.email,
      productId: product?.id,
      amount: order?.amount,
      currency: order?.currency,
      metadata
    });

    // 通过客户邮箱查找用户
    if (customer?.email) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', customer.email)
        .single();
      
      if (user) {
        // 根据产品ID确定积分数量
        const credits = getCreditsByProductId(product?.id);
        
        if (credits > 0) {
          // 充值积分
          const { data: result, error: rechargeError } = await supabase.rpc('recharge_credits', {
            p_user_id: user.id,
            p_amount: credits
          });
          
          if (rechargeError) {
            console.error('Recharge credits error:', rechargeError);
          } else {
            console.log('Credits recharged successfully:', result);
          }
        }
        
        // 检查订单是否已存在（防重复处理）
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('external_id', order?.id)
          .single();
        
        if (existingOrder) {
          console.log('Order already exists, skipping:', order?.id);
          return;
        }
        
        // 记录订单
        const { error: orderError } = await supabase.from('orders').insert({
          user_id: user.id,
          amount: order?.amount || 0,
          bonus: credits,
          status: 'completed',
          provider: 'creem',
          external_id: order?.id,
          metadata: {
            product_id: product?.id,
            credits,
            customer_email: customer.email,
            order_data: order,
            product_data: product,
            customer_data: customer
          }
        });
        
        if (orderError) {
          console.error('Insert order error:', orderError);
        } else {
          console.log('Order recorded successfully');
        }
      } else {
        console.log('User not found for email:', customer.email);
      }
    } else {
      console.log('No customer email provided');
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
    
    // 根据你的实际套餐配置
    // 小包: $4.99 - 300积分
    // 中包: $9.99 - 700积分  
    // 大包: $19.99 - 1600积分
    // 超大包: $49.99 - 4500积分
    // 超级包: $99.99 - 10000积分
  };
  
  console.log('Product ID mapping:', { productId, credits: productCreditsMap[productId] });
  return productCreditsMap[productId] || 0;
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
