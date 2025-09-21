-- 数据库完整性验证脚本
-- 请在 Supabase 控制台的 SQL 编辑器中执行此脚本

-- 1. 检查是否有重复的 external_id
SELECT 
  '🔍 检查重复 external_id' as check_type,
  COUNT(*) as duplicate_count
FROM (
  SELECT external_id, COUNT(*) as cnt
  FROM orders
  WHERE external_id IS NOT NULL
  GROUP BY external_id
  HAVING COUNT(*) > 1
) duplicates;

-- 2. 检查是否有重复的 order_id 在 credits 表中
SELECT 
  '🔍 检查重复 order_id 在 credits 表' as check_type,
  COUNT(*) as duplicate_count
FROM (
  SELECT order_id, COUNT(*) as cnt
  FROM credits
  WHERE order_id IS NOT NULL
  GROUP BY order_id
  HAVING COUNT(*) > 1
) duplicates;

-- 3. 统计订单和积分记录
SELECT 
  '📊 订单统计' as info_type,
  COUNT(*) as total_orders,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as orders_with_user,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as orphan_orders,
  COUNT(CASE WHEN status = 'orphan' THEN 1 END) as marked_orphan
FROM orders;

-- 4. 统计积分记录
SELECT 
  '💰 积分统计' as info_type,
  COUNT(*) as total_credit_records,
  COUNT(CASE WHEN order_id IS NOT NULL THEN 1 END) as credits_with_order_id,
  COUNT(CASE WHEN order_id IS NULL THEN 1 END) as credits_without_order_id
FROM credits;

-- 5. 检查最近的测试订单
SELECT 
  '🧪 最近的测试订单' as info_type,
  id,
  external_id,
  user_id,
  amount,
  bonus,
  status,
  provider,
  created_at
FROM orders
WHERE external_id LIKE 'ord_%test%' OR external_id LIKE 'ord_normal%' OR external_id LIKE 'ord_orphan%'
ORDER BY created_at DESC
LIMIT 20;

-- 6. 检查积分和订单的关联性
SELECT 
  '🔗 积分订单关联检查' as info_type,
  o.external_id,
  o.user_id,
  o.amount,
  o.bonus,
  c.balance,
  c.order_id,
  CASE 
    WHEN o.external_id = c.order_id THEN '✅ 正确关联'
    WHEN c.order_id IS NULL THEN '⚠️ 积分无订单关联'
    ELSE '❌ 关联不匹配'
  END as relationship_status
FROM orders o
LEFT JOIN credits c ON o.user_id = c.user_id
WHERE o.created_at > NOW() - INTERVAL '1 hour'
ORDER BY o.created_at DESC
LIMIT 10;

-- 7. 检查用户积分总和是否合理
SELECT 
  '👥 用户积分汇总' as info_type,
  u.id as user_id,
  u.email,
  c.balance as current_balance,
  COUNT(o.id) as total_orders,
  SUM(o.bonus) as total_bonus_earned,
  SUM(o.amount) as total_amount_paid
FROM users u
LEFT JOIN credits c ON u.id = c.user_id
LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'orphan'
WHERE o.created_at > NOW() - INTERVAL '1 hour' OR c.balance IS NOT NULL
GROUP BY u.id, u.email, c.balance
ORDER BY total_bonus_earned DESC
LIMIT 10;
