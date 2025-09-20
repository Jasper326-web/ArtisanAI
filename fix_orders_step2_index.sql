-- 修复项 A - 步骤 2: 创建唯一索引
-- 在 Supabase 控制台的 SQL 编辑器中单独执行此脚本

-- ========================================
-- 创建唯一索引（单独执行，避免事务冲突）
-- ========================================

-- 为external_id创建唯一索引（忽略NULL值）
CREATE UNIQUE INDEX idx_orders_external_id_unique 
ON orders (external_id) 
WHERE external_id IS NOT NULL;

-- 验证索引创建
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders' AND indexname = 'idx_orders_external_id_unique';

-- 测试唯一约束
-- 注意：这只是一个测试，实际执行会失败
/*
INSERT INTO orders (user_id, amount, bonus, status, provider, external_id, metadata)
VALUES ('test-user', 499, 300, 'completed', 'creem', 'test-duplicate-id', '{"test": true}');

INSERT INTO orders (user_id, amount, bonus, status, provider, external_id, metadata)
VALUES ('test-user-2', 499, 300, 'completed', 'creem', 'test-duplicate-id', '{"test": true}');
*/

-- 显示最终状态
SELECT
  'Index created successfully' as status,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphan_orders,
  COUNT(CASE WHEN external_id IS NOT NULL THEN 1 END) as orders_with_external_id
FROM orders;
