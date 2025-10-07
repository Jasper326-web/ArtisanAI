-- Users table removed - using Supabase Auth users table instead

-- Credits table
create table if not exists public.credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 120,
  updated_at timestamp with time zone default now()
);

-- Orders table (for Cream payments)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  amount integer not null,
  bonus integer not null default 0,
  status text not null default 'pending',
  provider text default 'cream',
  external_id text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  content text not null,
  meta jsonb,
  created_at timestamp with time zone default now()
);

-- Initial credits upsert helper - removed (using Supabase Auth)

-- Recharge credits and return new balance
create or replace function public.recharge_credits(p_user_id uuid, p_amount int)
returns table(balance int) language plpgsql as $$
begin
  -- 确保用户有积分记录，新用户初始120积分
  insert into public.credits (user_id, balance, updated_at)
  values (p_user_id, 120, now())
  on conflict (user_id) do nothing;
  
  -- 更新积分：现有余额 + 充值金额
  update public.credits 
  set balance = balance + p_amount, updated_at = now()
  where user_id = p_user_id;

  -- 返回新的积分余额
  return query select balance from public.credits where user_id = p_user_id;
end;
$$;

-- Deduct credits atomically and return new balance
create or replace function public.deduct_credits(p_user_id uuid, p_amount int)
returns table(balance int) language plpgsql as $$
declare
  current_balance int;
begin
  select balance into current_balance from public.credits where user_id = p_user_id for update;

  if current_balance is null then
    -- initialize if missing
    insert into public.credits(user_id, balance) values (p_user_id, 120)
    on conflict (user_id) do nothing;
    select balance into current_balance from public.credits where user_id = p_user_id for update;
  end if;

  if current_balance < p_amount then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  update public.credits set balance = balance - p_amount, updated_at = now() where user_id = p_user_id;
  return query select balance from public.credits where user_id = p_user_id;
end;
$$;


