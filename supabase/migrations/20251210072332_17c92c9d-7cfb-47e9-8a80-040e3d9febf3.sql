-- Create plan type enum
CREATE TYPE public.subscription_plan AS ENUM (
  'free', 'pro', 'pro_plus', 'pro_max', 'pro_ultra', 'pro_extreme'
);

-- Create plan_limits table with all plan configurations
CREATE TABLE public.plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan subscription_plan NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  monthly_credits INTEGER NOT NULL DEFAULT 5,
  daily_credits INTEGER NOT NULL DEFAULT 0,
  max_credit_pool INTEGER NOT NULL DEFAULT 5,
  max_projects INTEGER NOT NULL DEFAULT 1,
  custom_domain_allowed BOOLEAN NOT NULL DEFAULT false,
  badge_removable BOOLEAN NOT NULL DEFAULT false,
  priority_level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert plan configurations
INSERT INTO public.plan_limits (plan, name, price_monthly, monthly_credits, daily_credits, max_credit_pool, max_projects, custom_domain_allowed, badge_removable, priority_level) VALUES
('free', 'Free', 0, 5, 0, 5, 1, false, false, 0),
('pro', 'Pro', 25, 100, 5, 150, 10, true, true, 1),
('pro_plus', 'Pro+', 50, 200, 10, 300, 20, true, true, 2),
('pro_max', 'Pro Max', 100, 400, 20, 600, 50, true, true, 3),
('pro_ultra', 'Pro Ultra', 200, 800, 40, 1000, 200, true, true, 4),
('pro_extreme', 'Pro Extreme', 2250, 10000, 200, 15000, -1, true, true, 5);

-- Enable RLS on plan_limits
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Everyone can read plan limits
CREATE POLICY "Anyone can view plan limits"
ON public.plan_limits FOR SELECT
USING (true);

-- Create credit_balances table
CREATE TABLE public.credit_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_credits INTEGER NOT NULL DEFAULT 5,
  last_daily_refill TIMESTAMPTZ,
  last_monthly_reset TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on credit_balances
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit balance"
ON public.credit_balances FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credit balance"
ON public.credit_balances FOR UPDATE
USING (auth.uid() = user_id);

-- Create credit_logs table for tracking all credit changes
CREATE TABLE public.credit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on credit_logs
ALTER TABLE public.credit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit logs"
ON public.credit_logs FOR SELECT
USING (auth.uid() = user_id);

-- Update subscriptions table to use new plan type
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS subscription_plan subscription_plan DEFAULT 'free';

-- Migrate existing plans to new column
UPDATE public.subscriptions 
SET subscription_plan = 
  CASE 
    WHEN plan = 'free' THEN 'free'::subscription_plan
    WHEN plan = 'pro' THEN 'pro'::subscription_plan
    WHEN plan = 'agency' THEN 'pro_plus'::subscription_plan
    ELSE 'free'::subscription_plan
  END;

-- Function to get user's plan limits
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_uuid UUID)
RETURNS TABLE (
  plan subscription_plan,
  name TEXT,
  monthly_credits INTEGER,
  daily_credits INTEGER,
  max_credit_pool INTEGER,
  max_projects INTEGER,
  custom_domain_allowed BOOLEAN,
  badge_removable BOOLEAN,
  priority_level INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan subscription_plan;
BEGIN
  SELECT s.subscription_plan INTO user_plan
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid AND s.status = 'active';
  
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;
  
  RETURN QUERY
  SELECT pl.plan, pl.name, pl.monthly_credits, pl.daily_credits, 
         pl.max_credit_pool, pl.max_projects, pl.custom_domain_allowed, 
         pl.badge_removable, pl.priority_level
  FROM public.plan_limits pl
  WHERE pl.plan = user_plan;
END;
$$;

-- Function to consume credits based on token usage
CREATE OR REPLACE FUNCTION public.consume_credits(
  user_uuid UUID, 
  tokens_used INTEGER,
  action_description TEXT DEFAULT 'AI generation'
)
RETURNS TABLE (success BOOLEAN, credits_consumed INTEGER, remaining_credits INTEGER, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance INTEGER;
  credits_to_consume INTEGER;
  new_balance INTEGER;
BEGIN
  -- Calculate credits based on tokens (1 credit per 1000 tokens, min 1, max 4)
  credits_to_consume := GREATEST(1, LEAST(4, CEIL(tokens_used::DECIMAL / 1000)));
  
  -- Get current balance
  SELECT cb.current_credits INTO current_balance
  FROM public.credit_balances cb
  WHERE cb.user_id = user_uuid
  FOR UPDATE;
  
  -- If no balance record, create one
  IF current_balance IS NULL THEN
    INSERT INTO public.credit_balances (user_id, current_credits)
    VALUES (user_uuid, 5)
    ON CONFLICT (user_id) DO NOTHING;
    current_balance := 5;
  END IF;
  
  -- Check if enough credits
  IF current_balance < credits_to_consume THEN
    RETURN QUERY SELECT false, 0, current_balance, 'Crédits insuffisants. Veuillez passer à un plan supérieur.';
    RETURN;
  END IF;
  
  -- Deduct credits
  new_balance := current_balance - credits_to_consume;
  UPDATE public.credit_balances
  SET current_credits = new_balance, updated_at = now()
  WHERE user_id = user_uuid;
  
  -- Log the transaction
  INSERT INTO public.credit_logs (user_id, amount, balance_after, action_type, description, metadata)
  VALUES (user_uuid, -credits_to_consume, new_balance, 'consumption', action_description, 
          jsonb_build_object('tokens_used', tokens_used));
  
  RETURN QUERY SELECT true, credits_to_consume, new_balance, NULL::TEXT;
END;
$$;

-- Function for daily credit refill
CREATE OR REPLACE FUNCTION public.daily_credit_refill(user_uuid UUID)
RETURNS TABLE (credits_added INTEGER, new_balance INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan subscription_plan;
  daily_amount INTEGER;
  max_pool INTEGER;
  current_bal INTEGER;
  last_refill TIMESTAMPTZ;
  new_bal INTEGER;
BEGIN
  -- Get user's plan
  SELECT s.subscription_plan INTO user_plan
  FROM public.subscriptions s
  WHERE s.user_id = user_uuid AND s.status = 'active';
  
  IF user_plan IS NULL OR user_plan = 'free' THEN
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;
  
  -- Get plan limits
  SELECT pl.daily_credits, pl.max_credit_pool INTO daily_amount, max_pool
  FROM public.plan_limits pl
  WHERE pl.plan = user_plan;
  
  -- Get current balance and last refill
  SELECT cb.current_credits, cb.last_daily_refill INTO current_bal, last_refill
  FROM public.credit_balances cb
  WHERE cb.user_id = user_uuid;
  
  -- Check if already refilled today
  IF last_refill IS NOT NULL AND last_refill::DATE = CURRENT_DATE THEN
    RETURN QUERY SELECT 0, current_bal;
    RETURN;
  END IF;
  
  -- Calculate new balance (capped at max pool)
  new_bal := LEAST(current_bal + daily_amount, max_pool);
  
  -- Update balance
  UPDATE public.credit_balances
  SET current_credits = new_bal, 
      last_daily_refill = now(),
      updated_at = now()
  WHERE user_id = user_uuid;
  
  -- Log the refill
  IF new_bal > current_bal THEN
    INSERT INTO public.credit_logs (user_id, amount, balance_after, action_type, description)
    VALUES (user_uuid, new_bal - current_bal, new_bal, 'daily_refill', 'Recharge journalière');
  END IF;
  
  RETURN QUERY SELECT (new_bal - current_bal), new_bal;
END;
$$;

-- Function to handle subscription downgrade
CREATE OR REPLACE FUNCTION public.handle_subscription_downgrade(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  free_max_credits INTEGER := 5;
BEGIN
  -- Cap credits to free plan max
  UPDATE public.credit_balances
  SET current_credits = LEAST(current_credits, free_max_credits),
      updated_at = now()
  WHERE user_id = user_uuid;
  
  -- Deactivate all custom domains
  UPDATE public.custom_domains
  SET is_active = false,
      deactivation_reason = 'subscription_downgrade',
      updated_at = now()
  WHERE user_id = user_uuid AND is_active = true;
  
  -- Update deployments to offline for custom domains
  UPDATE public.deployments d
  SET status = 'offline',
      updated_at = now()
  FROM public.custom_domains cd
  WHERE d.id = cd.deployment_id
    AND cd.user_id = user_uuid
    AND d.deployment_type = 'custom_domain';
  
  -- Reset subscription to free
  UPDATE public.subscriptions
  SET subscription_plan = 'free',
      plan = 'free',
      status = 'active',
      updated_at = now()
  WHERE user_id = user_uuid;
  
  -- Log the downgrade
  INSERT INTO public.credit_logs (user_id, amount, balance_after, action_type, description)
  SELECT user_uuid, 0, cb.current_credits, 'downgrade', 'Rétrogradation vers le plan Free'
  FROM public.credit_balances cb WHERE cb.user_id = user_uuid;
END;
$$;

-- Function to initialize new user credits
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.credit_balances (user_id, current_credits)
  VALUES (NEW.id, 5)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create credit balance for new users
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Function to check project limit
CREATE OR REPLACE FUNCTION public.check_project_limit(user_uuid UUID)
RETURNS TABLE (can_create BOOLEAN, current_count INTEGER, max_allowed INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_count INTEGER;
  max_projects INTEGER;
BEGIN
  -- Get current project count
  SELECT COUNT(*) INTO project_count
  FROM public.projects
  WHERE user_id = user_uuid;
  
  -- Get max projects from plan
  SELECT pl.max_projects INTO max_projects
  FROM public.subscriptions s
  JOIN public.plan_limits pl ON pl.plan = s.subscription_plan
  WHERE s.user_id = user_uuid AND s.status = 'active';
  
  IF max_projects IS NULL THEN
    max_projects := 1; -- Free plan default
  END IF;
  
  -- -1 means unlimited
  IF max_projects = -1 THEN
    RETURN QUERY SELECT true, project_count, max_projects;
  ELSE
    RETURN QUERY SELECT (project_count < max_projects), project_count, max_projects;
  END IF;
END;
$$;