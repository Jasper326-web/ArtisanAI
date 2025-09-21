// 简化的幂等性测试脚本
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jraglvblkwibaehpihqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYWdsdmJsa3dpYmFlaHBpaHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTE0MjQsImV4cCI6MjA3MjM4NzQyNH0.AJKwI1TI4vEskxsAygzes95oh-KWXFXusG7Y66ZhP_o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleTest() {
  console.log('🧪 开始简化测试...\n');
  
  // 1. 检查orders表状态
  console.log('📊 检查orders表状态...');
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, user_id, external_id, status, created_at');
  
  if (ordersError) {
    console.error('❌ 查询orders表失败:', ordersError);
    return;
  }
  
  const stats = {
    total: orders.length,
    orphan: orders.filter(o => o.user_id === null).length,
    withExternalId: orders.filter(o => o.external_id !== null).length
  };
  
  console.log(`✅ Orders表统计:
  - 总订单数: ${stats.total}
  - Orphan订单: ${stats.orphan}
  - 有external_id的订单: ${stats.withExternalId}
`);
  
  // 2. 检查重复的external_id
  console.log('🔍 检查重复的external_id...');
  const externalIdCounts = {};
  orders.forEach(order => {
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
  
  // 3. 检查索引是否存在
  console.log('\n🔍 检查唯一索引...');
  const { data: indexes, error: indexError } = await supabase
    .rpc('get_indexes', { table_name: 'orders' })
    .then(result => result)
    .catch(() => {
      // 如果RPC不存在，使用SQL查询
      return supabase
        .from('pg_indexes')
        .select('indexname, indexdef')
        .eq('tablename', 'orders')
        .eq('indexname', 'idx_orders_external_id_unique');
    });
  
  if (indexError) {
    console.log('⚠️  无法检查索引状态（需要手动验证）');
  } else {
    const uniqueIndex = indexes?.find(idx => idx.indexname === 'idx_orders_external_id_unique');
    if (uniqueIndex) {
      console.log('✅ 唯一索引已创建:', uniqueIndex.indexname);
    } else {
      console.log('❌ 唯一索引未找到，需要执行 fix_orders_step2_index.sql');
    }
  }
  
  // 4. 测试基本插入功能
  console.log('\n🧪 测试基本插入功能...');
  const testOrder = {
    user_id: '123e4567-e89b-12d3-a456-426614174000', // 使用有效的UUID格式
    amount: 499,
    bonus: 300,
    status: 'completed',
    provider: 'creem',
    external_id: 'test-' + Date.now(),
    metadata: { test: true }
  };
  
  const { data: insertResult, error: insertError } = await supabase
    .from('orders')
    .insert(testOrder)
    .select();
  
  if (insertError) {
    console.error('❌ 插入测试失败:', insertError);
  } else {
    console.log('✅ 插入测试成功:', insertResult[0]?.id);
    
    // 清理测试数据
    await supabase
      .from('orders')
      .delete()
      .eq('id', insertResult[0].id);
    console.log('🧹 测试数据已清理');
  }
  
  console.log('\n📋 下一步操作:');
  console.log('1. 如果发现重复external_id，执行 fix_orders_step1_cleanup.sql');
  console.log('2. 如果唯一索引不存在，执行 fix_orders_step2_index.sql');
  console.log('3. 执行完成后重新运行此测试验证');
}

simpleTest().catch(console.error);
