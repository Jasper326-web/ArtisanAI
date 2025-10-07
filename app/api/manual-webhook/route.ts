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

    // 1. 确保用户存在
    const { data: userExists, error: userCheckError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', user_id)
      .single();
    
    if (userCheckError) {
      console.log('User not found, creating user record...');
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: user_id,
          email: null, // 手动触发时没有邮箱信息
          created_at: new Date().toISOString()
        });
      
      if (createUserError) {
        console.error('Failed to create user record:', createUserError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      } else {
        console.log('✅ User record created successfully');
      }
    } else {
      console.log('✅ User exists:', userExists);
    }

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
