-- 修复项 D - 检查orphan订单并尝试自动匹配

-- 1. 列出orphan订单
SELECT 
  o.id AS order_uuid, 
  o.external_id, 
  o.metadata->>'request_id' AS req_id, 
  o.metadata->>'customer_email' AS customer_email,
  o.amount,
  o.bonus,
  o.created_at,
  u.id AS user_uuid
FROM orders o
LEFT JOIN users u ON u.id::text = o.metadata->>'request_id'
WHERE o.user_id IS NULL
ORDER BY o.created_at DESC
LIMIT 500;

-- 2. 查找可以自动关联到user的记录
SELECT 
  o.id AS order_uuid, 
  o.external_id, 
  o.metadata->>'request_id' AS req_id, 
  u.id AS user_uuid,
  u.email AS user_email
FROM orders o
JOIN users u ON u.id::text = o.metadata->>'request_id'
WHERE o.user_id IS NULL
LIMIT 500;
