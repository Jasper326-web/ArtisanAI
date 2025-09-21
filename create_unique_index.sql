-- 为orders.external_id创建唯一索引（忽略NULL）
CREATE UNIQUE INDEX IF NOT EXISTS orders_external_id_unique
ON orders (external_id)
WHERE external_id IS NOT NULL;
