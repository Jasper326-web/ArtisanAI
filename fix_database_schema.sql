-- 修复数据库表结构问题的SQL脚本
-- 请在Supabase Dashboard的SQL Editor中执行此脚本

-- 删除旧的外键约束
ALTER TABLE public.credits DROP CONSTRAINT IF EXISTS credits_user_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;

-- 重新创建正确的外键约束
ALTER TABLE public.credits ADD CONSTRAINT credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 确保RLS策略正确
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Users can view own credits" ON public.credits;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Service role can manage credits" ON public.credits;
DROP POLICY IF EXISTS "Service role can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Service role can manage feedback" ON public.feedback;

-- 创建RLS策略（允许用户访问自己的数据）
CREATE POLICY "Users can view own credits" ON public.credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);

-- 允许服务角色绕过RLS（用于API操作）
CREATE POLICY "Service role can manage credits" ON public.credits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage orders" ON public.orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage feedback" ON public.feedback FOR ALL USING (auth.role() = 'service_role');
