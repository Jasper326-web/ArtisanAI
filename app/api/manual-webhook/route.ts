import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, order_id, amount, credits } = body;

    if (!user_id || !order_id || !amount || !credits) {
      return NextResponse.json({ 
        error: 'Missing required fields: user_id, order_id, amount, credits' 
      }, { status: 400 });
    }

    console.log('=== Manual Webhook Processing ===');
    console.log('Processing payment for user:', user_id);
    console.log('Order ID:', order_id);
    console.log('Amount:', amount);
    console.log('Credits:', credits);

    // 用户通过Supabase Auth管理，不需要验证或创建用户记录
    console.log('Processing payment for user:', user_id);

    // 2. 创建订单记录
    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        external_id: order_id,
        user_id: user_id,
        amount: amount,
        bonus: credits,
        status: 'completed',
        provider: 'manual',
        metadata: {
          manual_trigger: true,
          credits: credits,
          created_at: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('❌ Insert order error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
    
    console.log('✅ Order recorded successfully:', insertedOrder);

    // 3. 更新积分
    const { data: result, error: rechargeError } = await supabase.rpc('recharge_credits', {
      p_user_id: user_id,
      p_amount: credits
    });
    
    if (rechargeError) {
      console.error('❌ Recharge credits error:', rechargeError);
      return NextResponse.json({ error: 'Failed to recharge credits' }, { status: 500 });
    } else {
      console.log('✅ Credits recharged successfully:', result);
      console.log('New balance:', result?.[0]?.balance);
    }

    return NextResponse.json({ 
      success: true, 
      order: insertedOrder,
      new_balance: result?.[0]?.balance,
      message: 'Payment processed successfully' 
    });

  } catch (error: any) {
    console.error('Manual webhook error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
