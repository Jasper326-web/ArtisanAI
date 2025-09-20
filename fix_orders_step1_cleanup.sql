-- 修复项 A - 步骤 1: 数据清理和检查
-- 在 Supabase 控制台的 SQL 编辑器中执行此脚本

-- ========================================
-- 步骤 1: 检查当前状态
-- ========================================

-- 检查表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 检查现有索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders';

-- 检查重复的external_id
SELECT external_id, COUNT(*) as count
FROM orders
WHERE external_id IS NOT NULL
GROUP BY external_id
HAVING COUNT(*) > 1;

-- 检查orphan订单统计
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphan_orders,
  COUNT(CASE WHEN external_id IS NULL THEN 1 END) as no_external_id,
  COUNT(CASE WHEN user_id IS NOT NULL AND external_id IS NOT NULL THEN 1 END) as valid_orders
FROM orders;

-- ========================================
-- 步骤 2: 清理重复数据（如果有）
-- ========================================

-- 如果有重复的external_id，保留最新的记录，删除旧的
-- 注意：执行前请先备份数据！
WITH duplicates AS (
  SELECT 
    id,
    external_id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY external_id ORDER BY created_at DESC) as rn
  FROM orders
  WHERE external_id IS NOT NULL
),
to_delete AS (
  SELECT id
  FROM duplicates
  WHERE rn > 1
)
DELETE FROM orders
WHERE id IN (SELECT id FROM to_delete);

-- 验证清理结果
SELECT external_id, COUNT(*) as count
FROM orders
WHERE external_id IS NOT NULL
GROUP BY external_id
HAVING COUNT(*) > 1;

-- 显示最终清理状态
SELECT
  'Data cleanup completed' as status,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphan_orders,
  COUNT(CASE WHEN external_id IS NOT NULL THEN 1 END) as orders_with_external_id
FROM orders;
