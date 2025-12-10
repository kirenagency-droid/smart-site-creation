-- Fix daily_credits to 5 for all plans
UPDATE public.plan_limits SET daily_credits = 5 WHERE plan IN ('free', 'pro', 'pro_plus', 'pro_max', 'pro_ultra', 'pro_extreme');