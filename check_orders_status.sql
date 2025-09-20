-- 检查orders表当前结构和数据状态

-- 1. 检查表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 检查现有索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders';

-- 3. 检查重复的external_id
SELECT external_id, COUNT(*) as count
FROM orders
WHERE external_id IS NOT NULL
GROUP BY external_id
HAVING COUNT(*) > 1;

-- 4. 检查orphan订单数量
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphan_orders,
  COUNT(CASE WHEN external_id IS NULL THEN 1 END) as no_external_id
FROM orders;
