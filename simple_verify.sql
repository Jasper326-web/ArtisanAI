-- 简化验证脚本 - 修复项A状态检查
-- 在Supabase控制台的SQL编辑器中执行

-- ========================================
-- 1. 检查orders表当前状态
-- ========================================
SELECT '=== Orders表状态检查 ===' as section;

SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphan_orders,
  COUNT(CASE WHEN external_id IS NULL THEN 1 END) as no_external_id,
  COUNT(CASE WHEN user_id IS NOT NULL AND external_id IS NOT NULL THEN 1 END) as valid_orders
FROM orders;

-- ========================================
-- 2. 检查重复的external_id
-- ========================================
SELECT '=== 重复external_id检查 ===' as section;

SELECT external_id, COUNT(*) as count
FROM orders
WHERE external_id IS NOT NULL
GROUP BY external_id
HAVING COUNT(*) > 1;

-- 如果没有重复，显示成功消息
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ 没有发现重复的external_id'
    ELSE '⚠️ 发现 ' || COUNT(*) || ' 个重复的external_id'
  END as result
FROM (
  SELECT external_id, COUNT(*) as count
  FROM orders
  WHERE external_id IS NOT NULL
  GROUP BY external_id
  HAVING COUNT(*) > 1
) duplicates;

-- ========================================
-- 3. 检查唯一索引是否存在
-- ========================================
SELECT '=== 唯一索引检查 ===' as section;

SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ 唯一索引已创建'
    ELSE '❌ 唯一索引未创建，需要执行 fix_orders_step2_index.sql'
  END as index_status
FROM pg_indexes
WHERE tablename = 'orders' 
  AND indexname = 'idx_orders_external_id_unique';

-- 显示索引详情（如果存在）
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders' 
  AND indexname = 'idx_orders_external_id_unique';

-- ========================================
-- 4. 显示最新订单（如果有）
-- ========================================
SELECT '=== 最新订单检查 ===' as section;

SELECT 
  id,
  user_id,
  external_id,
  status,
  amount,
  bonus,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 5. 总结
-- ========================================
SELECT '=== 修复状态总结 ===' as section;

SELECT 
  '修复项A检查完成' as status,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'orders' AND indexname = 'idx_orders_external_id_unique') > 0
    THEN '✅ 唯一索引已创建'
    ELSE '❌ 需要执行 fix_orders_step2_index.sql'
  END as index_status,
  CASE 
    WHEN (SELECT COUNT(*) FROM (
      SELECT external_id FROM orders WHERE external_id IS NOT NULL GROUP BY external_id HAVING COUNT(*) > 1
    ) duplicates) = 0
    THEN '✅ 没有重复数据'
    ELSE '⚠️ 需要执行 fix_orders_step1_cleanup.sql'
  END as data_status;
