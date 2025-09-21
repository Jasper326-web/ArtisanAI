-- 检查重复的external_id
SELECT external_id, COUNT(*) AS cnt, json_agg(id) AS ids
FROM orders
WHERE external_id IS NOT NULL
GROUP BY external_id
HAVING COUNT(*) > 1
LIMIT 200;
