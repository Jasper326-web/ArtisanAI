import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data } = body;

    console.log('Creem webhook received:', { event, data });

    // 验证 webhook 签名（生产环境建议添加）
    // const signature = req.headers.get('x-creem-signature');
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    switch (event) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(data);
        break;
      
      case 'payment.succeeded':
        await handlePaymentSucceeded(data);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(data);
        break;
      
      default:
        console.log('Unhandled webhook event:', event);
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
    const { metadata, amount, currency } = data;
    const { plan_id, credits } = metadata;

    // 这里需要根据实际的用户识别方式来处理
    // 由于 Creem 可能不直接提供用户ID，我们需要通过其他方式关联
    console.log('Checkout completed:', { plan_id, credits, amount, currency });

    // 示例：如果 Creem 提供了用户邮箱或其他标识
    // const userEmail = data.customer_email;
    // if (userEmail) {
    //   const { data: user } = await supabase
    //     .from('users')
    //     .select('id')
    //     .eq('email', userEmail)
    //     .single();
    //   
    //   if (user) {
    //     await supabase.rpc('recharge_credits', {
    //       p_user_id: user.id,
    //       p_amount: parseInt(credits)
    //     });
    //   }
    // }

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handlePaymentSucceeded(data: any) {
  try {
    console.log('Payment succeeded:', data);
    
    // 处理支付成功逻辑
    // 1. 验证支付金额
    // 2. 查找对应用户
    // 3. 充值积分
    // 4. 记录订单
    
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(data: any) {
  try {
    console.log('Payment failed:', data);
    
    // 处理支付失败逻辑
    // 1. 记录失败原因
    // 2. 通知用户
    // 3. 清理临时数据
    
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// 验证 webhook 签名的函数（生产环境使用）
function verifyWebhookSignature(payload: any, signature: string | null): boolean {
  // 实现 Creem webhook 签名验证
  // 参考 Creem 文档中的签名验证方法
  return true; // 测试环境暂时返回 true
}
