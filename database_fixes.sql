-- Creem Webhook 数据库修复脚本
-- 请在 Supabase 控制台的 SQL 编辑器中执行此脚本

-- 1. 为 orders.external_id 创建唯一索引（忽略 NULL）
CREATE UNIQUE INDEX IF NOT EXISTS orders_external_id_unique
ON orders (external_id)
WHERE external_id IS NOT NULL;

-- 2. 为 credits 表添加 order_id 字段
ALTER TABLE credits ADD COLUMN IF NOT EXISTS order_id text;

-- 3. 为 credits.order_id 创建唯一索引（忽略 NULL）
CREATE UNIQUE INDEX IF NOT EXISTS credits_order_id_unique
ON credits (order_id)
WHERE order_id IS NOT NULL;

-- 4. 检查重复的 external_id
SELECT 
  'Duplicate external_id in orders' as issue_type,
  external_id, 
  COUNT(*) AS count, 
  json_agg(id) AS order_ids
FROM orders
WHERE external_id IS NOT NULL
GROUP BY external_id
HAVING COUNT(*) > 1
LIMIT 100;

-- 5. 检查重复的 order_id 在 credits 表中
SELECT 
  'Duplicate order_id in credits' as issue_type,
  order_id, 
  COUNT(*) AS count, 
  json_agg(id) AS credit_ids
FROM credits
WHERE order_id IS NOT NULL
GROUP BY order_id
HAVING COUNT(*) > 1
LIMIT 100;

-- 6. 检查 orphan 订单
SELECT 
  'Orphan orders' as issue_type,
  COUNT(*) AS count
FROM orders
WHERE user_id IS NULL;

-- 7. 显示最近的订单记录
SELECT 
  'Recent orders' as info_type,
  id,
  external_id,
  user_id,
  amount,
  bonus,
  status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;
