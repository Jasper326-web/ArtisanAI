-- 修复项 C - 给 credits 表加基于 order_id 的唯一约束

-- 1. 确认 credits 表是否有 order_id 字段；若没有则添加
ALTER TABLE credits ADD COLUMN IF NOT EXISTS order_id text;

-- 2. 添加唯一索引（忽略 NULL）
CREATE UNIQUE INDEX IF NOT EXISTS credits_order_id_unique
ON credits (order_id)
WHERE order_id IS NOT NULL;
