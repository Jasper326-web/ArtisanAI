-- 修复 recharge_credits 函数
-- 请在 Supabase 控制台的 SQL 编辑器中执行此脚本

-- 删除旧的函数
DROP FUNCTION IF EXISTS public.recharge_credits(uuid, int);

-- 创建修复后的函数
CREATE OR REPLACE FUNCTION public.recharge_credits(p_user_id uuid, p_amount int)
RETURNS TABLE(balance int) LANGUAGE plpgsql AS $$
BEGIN
  -- 确保用户存在
  INSERT INTO public.users (id, created_at)
  VALUES (p_user_id, now())
  ON CONFLICT (id) DO NOTHING;
  
  -- 确保用户有积分记录，新用户初始120积分
  INSERT INTO public.credits (user_id, balance, updated_at)
  VALUES (p_user_id, 120, now())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- 更新积分：现有余额 + 充值金额
  UPDATE public.credits 
  SET balance = balance + p_amount, updated_at = now()
  WHERE user_id = p_user_id;

  -- 返回新的积分余额
  RETURN QUERY SELECT balance FROM public.credits WHERE user_id = p_user_id;
END;
$$;

-- 测试函数是否正常工作
-- 你可以用你的用户ID测试：
-- SELECT * FROM public.recharge_credits('6b4c389b-bb9b-4fec-ae66-3d6e1adc578b', 0);
