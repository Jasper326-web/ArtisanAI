-- 健壮交易系统数据库结构
-- 请在 Supabase 控制台的 SQL 编辑器中执行此脚本

-- 1. 创建交易跟踪表
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id),
  transaction_id text NOT NULL UNIQUE, -- 客户端生成的唯一交易ID
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  amount integer NOT NULL, -- 扣减的积分数量
  operation_type text NOT NULL DEFAULT 'generation' CHECK (operation_type IN ('generation', 'refund', 'bonus')),
  api_provider text, -- 'gemini', 'vertex-ai', 'openrouter'
  model_used text, -- 'gemini-2.5-flash-image-preview'
  prompt_hash text, -- 提示词的哈希值，用于去重检测
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 2,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. 创建交易ID索引
CREATE UNIQUE INDEX IF NOT EXISTS transactions_transaction_id_unique 
ON public.transactions (transaction_id);

-- 3. 创建用户交易索引
CREATE INDEX IF NOT EXISTS transactions_user_id_idx 
ON public.transactions (user_id, created_at DESC);

-- 4. 创建状态索引
CREATE INDEX IF NOT EXISTS transactions_status_idx 
ON public.transactions (status, created_at);

-- 5. 创建原子性积分扣减函数（带交易跟踪）
CREATE OR REPLACE FUNCTION public.deduct_credits_with_transaction(
  p_user_id uuid,
  p_amount integer,
  p_transaction_id text,
  p_operation_type text DEFAULT 'generation',
  p_api_provider text DEFAULT NULL,
  p_model_used text DEFAULT NULL,
  p_prompt_hash text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS TABLE(new_balance integer, transaction_record jsonb) 
LANGUAGE plpgsql AS $$
DECLARE
  current_balance integer;
  transaction_record jsonb;
BEGIN
  -- 开始事务
  BEGIN
    -- 检查交易ID是否已存在
    IF EXISTS (SELECT 1 FROM public.transactions WHERE transaction_id = p_transaction_id) THEN
      RAISE EXCEPTION 'DUPLICATE_TRANSACTION_ID: %', p_transaction_id;
    END IF;

    -- 获取当前积分余额（加锁）
    SELECT balance INTO current_balance 
    FROM public.credits 
    WHERE user_id = p_user_id 
    FOR UPDATE;

    -- 如果用户没有积分记录，初始化
    IF current_balance IS NULL THEN
      INSERT INTO public.credits (user_id, balance) 
      VALUES (p_user_id, 220)
      ON CONFLICT (user_id) DO NOTHING;
      
      SELECT balance INTO current_balance 
      FROM public.credits 
      WHERE user_id = p_user_id 
      FOR UPDATE;
    END IF;

    -- 检查积分是否足够
    IF current_balance < p_amount THEN
      RAISE EXCEPTION 'INSUFFICIENT_CREDITS: current=% required=%', current_balance, p_amount;
    END IF;

    -- 扣减积分
    UPDATE public.credits 
    SET balance = balance - p_amount, updated_at = now() 
    WHERE user_id = p_user_id;

    -- 创建交易记录
    INSERT INTO public.transactions (
      user_id, transaction_id, status, amount, operation_type,
      api_provider, model_used, prompt_hash, metadata
    ) VALUES (
      p_user_id, p_transaction_id, 'processing', p_amount, p_operation_type,
      p_api_provider, p_model_used, p_prompt_hash, p_metadata
    ) RETURNING to_jsonb(transactions.*) INTO transaction_record;

    -- 获取新的余额
    SELECT balance INTO current_balance 
    FROM public.credits 
    WHERE user_id = p_user_id;

    -- 返回结果
    RETURN QUERY SELECT current_balance, transaction_record;

  EXCEPTION WHEN OTHERS THEN
    -- 回滚事务
    RAISE;
  END;
END;
$$;

-- 6. 创建交易完成函数
CREATE OR REPLACE FUNCTION public.complete_transaction(
  p_transaction_id text,
  p_status text DEFAULT 'completed',
  p_error_message text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS TABLE(success boolean, transaction_record jsonb)
LANGUAGE plpgsql AS $$
DECLARE
  transaction_record jsonb;
BEGIN
  -- 更新交易状态
  UPDATE public.transactions 
  SET 
    status = p_status,
    error_message = p_error_message,
    metadata = metadata || p_metadata,
    updated_at = now()
  WHERE transaction_id = p_transaction_id
  RETURNING to_jsonb(transactions.*) INTO transaction_record;

  IF transaction_record IS NULL THEN
    RETURN QUERY SELECT false, '{}'::jsonb;
  ELSE
    RETURN QUERY SELECT true, transaction_record;
  END IF;
END;
$$;

-- 7. 创建交易退款函数
CREATE OR REPLACE FUNCTION public.refund_transaction(
  p_transaction_id text,
  p_reason text DEFAULT 'generation_failed'
)
RETURNS TABLE(success boolean, new_balance integer, transaction_record jsonb)
LANGUAGE plpgsql AS $$
DECLARE
  transaction_record jsonb;
  user_id_val uuid;
  amount_val integer;
  current_balance integer;
BEGIN
  -- 获取交易信息
  SELECT t.user_id, t.amount, to_jsonb(t.*)
  INTO user_id_val, amount_val, transaction_record
  FROM public.transactions t
  WHERE t.transaction_id = p_transaction_id;

  IF user_id_val IS NULL THEN
    RETURN QUERY SELECT false, 0, '{}'::jsonb;
    RETURN;
  END IF;

  -- 检查交易状态
  IF (transaction_record->>'status') IN ('refunded', 'completed') THEN
    RETURN QUERY SELECT false, 0, transaction_record;
    RETURN;
  END IF;

  -- 开始事务
  BEGIN
    -- 退款积分
    UPDATE public.credits 
    SET balance = balance + amount_val, updated_at = now() 
    WHERE user_id = user_id_val;

    -- 更新交易状态
    UPDATE public.transactions 
    SET 
      status = 'refunded',
      error_message = p_reason,
      metadata = metadata || jsonb_build_object('refund_reason', p_reason, 'refunded_at', now()),
      updated_at = now()
    WHERE transaction_id = p_transaction_id
    RETURNING to_jsonb(transactions.*) INTO transaction_record;

    -- 获取新余额
    SELECT balance INTO current_balance 
    FROM public.credits 
    WHERE user_id = user_id_val;

    RETURN QUERY SELECT true, current_balance, transaction_record;

  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, 0, '{}'::jsonb;
  END;
END;
$$;

-- 8. 创建重试交易函数
CREATE OR REPLACE FUNCTION public.retry_transaction(
  p_transaction_id text,
  p_increment_retry boolean DEFAULT true
)
RETURNS TABLE(can_retry boolean, retry_count integer, transaction_record jsonb)
LANGUAGE plpgsql AS $$
DECLARE
  transaction_record jsonb;
  current_retry_count integer;
  max_retries_val integer;
BEGIN
  -- 获取交易信息
  SELECT t.retry_count, t.max_retries, to_jsonb(t.*)
  INTO current_retry_count, max_retries_val, transaction_record
  FROM public.transactions t
  WHERE t.transaction_id = p_transaction_id;

  IF transaction_record IS NULL THEN
    RETURN QUERY SELECT false, 0, '{}'::jsonb;
    RETURN;
  END IF;

  -- 检查是否可以重试
  IF current_retry_count >= max_retries_val THEN
    RETURN QUERY SELECT false, current_retry_count, transaction_record;
    RETURN;
  END IF;

  -- 增加重试次数
  IF p_increment_retry THEN
    UPDATE public.transactions 
    SET 
      retry_count = retry_count + 1,
      status = 'processing',
      updated_at = now()
    WHERE transaction_id = p_transaction_id
    RETURNING to_jsonb(transactions.*) INTO transaction_record;
    
    current_retry_count := current_retry_count + 1;
  END IF;

  RETURN QUERY SELECT true, current_retry_count, transaction_record;
END;
$$;

-- 9. 创建获取用户交易历史函数
CREATE OR REPLACE FUNCTION public.get_user_transactions(
  p_user_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  transaction_id text,
  status text,
  amount integer,
  operation_type text,
  api_provider text,
  model_used text,
  retry_count integer,
  error_message text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  metadata jsonb
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.transaction_id,
    t.status,
    t.amount,
    t.operation_type,
    t.api_provider,
    t.model_used,
    t.retry_count,
    t.error_message,
    t.created_at,
    t.updated_at,
    t.metadata
  FROM public.transactions t
  WHERE t.user_id = p_user_id
  ORDER BY t.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 10. 创建清理过期交易函数（可选）
CREATE OR REPLACE FUNCTION public.cleanup_old_transactions(
  p_days_old integer DEFAULT 30
)
RETURNS TABLE(deleted_count integer)
LANGUAGE plpgsql AS $$
DECLARE
  deleted_count_val integer;
BEGIN
  -- 删除超过指定天数的已完成或失败的交易
  DELETE FROM public.transactions 
  WHERE created_at < now() - (p_days_old || ' days')::interval
    AND status IN ('completed', 'failed', 'refunded');
  
  GET DIAGNOSTICS deleted_count_val = ROW_COUNT;
  
  RETURN QUERY SELECT deleted_count_val;
END;
$$;
