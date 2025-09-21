-- 验证修复项A的执行状态
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

-- ========================================
-- 3. 检查唯一索引是否存在
-- ========================================
SELECT '=== 唯一索引检查 ===' as section;

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders' AND indexname = 'idx_orders_external_id_unique';

-- ========================================
-- 4. 测试UPSERT功能（如果索引存在）
-- ========================================
SELECT '=== UPSERT测试 ===' as section;

-- 测试插入新订单（使用有效UUID格式）
INSERT INTO orders (user_id, amount, bonus, status, provider, external_id, metadata)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 499, 300, 'completed', 'creem', 'test-upsert-' || extract(epoch from now()), '{"test": true}')
ON CONFLICT (external_id) DO UPDATE SET
  metadata = EXCLUDED.metadata,
  updated_at = now()
RETURNING id, external_id, metadata;

-- ========================================
-- 5. 清理测试数据
-- ========================================
SELECT '=== 清理测试数据 ===' as section;

DELETE FROM orders 
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000' 
  AND external_id LIKE 'test-upsert-%';

SELECT '测试完成，数据已清理' as result;
