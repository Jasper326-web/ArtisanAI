// 测试 recharge_credits 函数是否正常工作
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jraglvblkwibaehpihqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYWdsdmJsa3dpYmFlaHBpaHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTE0MjQsImV4cCI6MjA3MjM4NzQyNH0.AJKwI1TI4vEskxsAygzes95oh-KWXFXusG7Y66ZhP_o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRechargeFunction() {
  const testUserId = 'test-user-' + Date.now(); // 使用临时测试用户ID
  
  console.log('开始测试 recharge_credits 函数...');
  console.log('测试用户ID:', testUserId);
  
  try {
    // 1. 测试新用户充值
    console.log('\n1. 测试新用户充值300积分...');
    const { data: result1, error: error1 } = await supabase.rpc('recharge_credits', {
      p_user_id: testUserId,
      p_amount: 300
    });
    
    if (error1) {
      console.error('❌ 新用户充值失败:', error1);
    } else {
      console.log('✅ 新用户充值成功:', result1);
      console.log('预期余额: 420 (120初始 + 300充值)');
    }
    
    // 2. 验证积分记录
    console.log('\n2. 验证积分记录...');
    const { data: credits } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    console.log('积分记录:', credits);
    
    // 3. 测试再次充值
    console.log('\n3. 测试再次充值200积分...');
    const { data: result2, error: error2 } = await supabase.rpc('recharge_credits', {
      p_user_id: testUserId,
      p_amount: 200
    });
    
    if (error2) {
      console.error('❌ 再次充值失败:', error2);
    } else {
      console.log('✅ 再次充值成功:', result2);
      console.log('预期余额: 620 (420 + 200)');
    }
    
    // 4. 最终验证
    console.log('\n4. 最终验证...');
    const { data: finalCredits } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    console.log('最终积分记录:', finalCredits);
    
    // 5. 清理测试数据
    console.log('\n5. 清理测试数据...');
    await supabase.from('credits').delete().eq('user_id', testUserId);
    await supabase.from('users').delete().eq('id', testUserId);
    console.log('✅ 测试数据已清理');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

testRechargeFunction();
