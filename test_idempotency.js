// 测试幂等性修复效果
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jraglvblkwibaehpihqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYWdsdmJsa3dpYmFlaHBpaHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTE0MjQsImV4cCI6MjA3MjM4NzQyNH0.AJKwI1TI4vEskxsAygzes95oh-KWXFXusG7Y66ZhP_o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testIdempotency() {
  console.log('🧪 开始测试幂等性修复...\n');
  
  // 1. 检查当前orders表状态
  console.log('📊 检查当前orders表状态...');
  const { data: ordersStats, error: statsError } = await supabase
    .from('orders')
    .select('id, user_id, external_id, status, created_at');
  
  if (statsError) {
    console.error('❌ 查询orders表失败:', statsError);
    return;
  }
  
  const totalOrders = ordersStats.length;
  const orphanOrders = ordersStats.filter(o => o.user_id === null).length;
  const withExternalId = ordersStats.filter(o => o.external_id !== null).length;
  
  console.log(`✅ Orders表统计:
  - 总订单数: ${totalOrders}
  - Orphan订单: ${orphanOrders}
  - 有external_id的订单: ${withExternalId}
`);
  
  // 2. 检查重复的external_id
  console.log('🔍 检查重复的external_id...');
  const externalIdCounts = {};
  ordersStats.forEach(order => {
    if (order.external_id) {
      externalIdCounts[order.external_id] = (externalIdCounts[order.external_id] || 0) + 1;
    }
  });
  
  const duplicates = Object.entries(externalIdCounts).filter(([_, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log('⚠️  发现重复的external_id:');
    duplicates.forEach(([externalId, count]) => {
      console.log(`  - ${externalId}: ${count}次`);
    });
  } else {
    console.log('✅ 没有发现重复的external_id');
  }
  
  // 3. 测试UPSERT功能
  console.log('\n🧪 测试UPSERT功能...');
  const testExternalId = 'test-idempotency-' + Date.now();
  const testUserId = 'test-user-' + Date.now();
  
  // 第一次插入
  console.log('第一次插入订单...');
  const { data: insert1, error: error1 } = await supabase
    .from('orders')
    .upsert({
      user_id: testUserId,
      amount: 499,
      bonus: 300,
      status: 'completed',
      provider: 'creem',
      external_id: testExternalId,
      metadata: { test: true, attempt: 1 }
    }, {
      onConflict: 'external_id',
      ignoreDuplicates: false
    })
    .select();
  
  if (error1) {
    console.error('❌ 第一次插入失败:', error1);
  } else {
    console.log('✅ 第一次插入成功:', insert1[0]?.id);
  }
  
  // 第二次插入（应该更新）
  console.log('第二次插入相同external_id（应该更新）...');
  const { data: insert2, error: error2 } = await supabase
    .from('orders')
    .upsert({
      user_id: testUserId,
      amount: 499,
      bonus: 300,
      status: 'completed',
      provider: 'creem',
      external_id: testExternalId,
      metadata: { test: true, attempt: 2 }
    }, {
      onConflict: 'external_id',
      ignoreDuplicates: false
    })
    .select();
  
  if (error2) {
    console.error('❌ 第二次插入失败:', error2);
  } else {
    console.log('✅ 第二次插入成功（更新）:', insert2[0]?.id);
    console.log('📝 元数据更新:', insert2[0]?.metadata);
  }
  
  // 验证只有一条记录
  const { data: verifyRecords, error: verifyError } = await supabase
    .from('orders')
    .select('*')
    .eq('external_id', testExternalId);
  
  if (verifyError) {
    console.error('❌ 验证失败:', verifyError);
  } else {
    console.log(`✅ 验证结果: 找到 ${verifyRecords.length} 条记录（应该是1条）`);
    if (verifyRecords.length === 1) {
      console.log('🎉 UPSERT幂等性测试通过！');
    } else {
      console.log('❌ UPSERT幂等性测试失败！');
    }
  }
  
  // 4. 清理测试数据
  console.log('\n🧹 清理测试数据...');
  const { error: deleteError } = await supabase
    .from('orders')
    .delete()
    .eq('external_id', testExternalId);
  
  if (deleteError) {
    console.error('❌ 清理失败:', deleteError);
  } else {
    console.log('✅ 测试数据已清理');
  }
  
  console.log('\n🎯 测试完成！');
}

testIdempotency().catch(console.error);
