import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { user_id, credits } = await req.json();
    
    console.log('🧪 测试积分更新:', { user_id, credits });
    
    if (!user_id || !credits) {
      return NextResponse.json({ error: 'Missing user_id or credits' }, { status: 400 });
    }
    
    // 使用recharge_credits函数更新积分
    const { data: result, error: rechargeError } = await supabase.rpc('recharge_credits', {
      p_user_id: user_id,
      p_amount: credits
    });
    
    if (rechargeError) {
      console.error('❌ 积分更新失败:', rechargeError);
      return NextResponse.json({ error: rechargeError.message }, { status: 500 });
    }
    
    console.log('✅ 积分更新成功:', result);
    
    return NextResponse.json({ 
      success: true, 
      new_balance: result?.[0]?.balance,
      credits_added: credits 
    });
    
  } catch (error: any) {
    console.error('❌ 测试积分更新错误:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
