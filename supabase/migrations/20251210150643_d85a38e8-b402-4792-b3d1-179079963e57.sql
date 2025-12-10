-- Create referrals table to track affiliate/referral relationships
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_user_id UUID,
  referral_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, signed_up, qualified, rewarded
  has_published_site BOOLEAN DEFAULT false,
  has_pro_subscription BOOLEAN DEFAULT false,
  credits_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  qualified_at TIMESTAMP WITH TIME ZONE,
  rewarded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Referrers can view their own referrals
CREATE POLICY "Users can view own referrals"
ON public.referrals
FOR SELECT
USING (referrer_id = auth.uid());

-- Referrers can create referral entries
CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
WITH CHECK (referrer_id = auth.uid());

-- Create function to generate unique referral code for a user
CREATE OR REPLACE FUNCTION public.get_or_create_referral_code(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_code TEXT;
  new_code TEXT;
BEGIN
  -- Check if user already has a referral code
  SELECT referral_code INTO existing_code 
  FROM referrals 
  WHERE referrer_id = user_uuid 
  LIMIT 1;
  
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;
  
  -- Generate new unique code (first 8 chars of user_uuid + random suffix)
  new_code := UPPER(SUBSTRING(user_uuid::text, 1, 8) || SUBSTRING(md5(random()::text), 1, 4));
  
  RETURN new_code;
END;
$$;

-- Create function to check and reward referrals
CREATE OR REPLACE FUNCTION public.check_and_reward_referral(referred_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_record RECORD;
  has_published BOOLEAN;
  has_pro BOOLEAN;
BEGIN
  -- Find the referral record for this user
  SELECT * INTO referral_record
  FROM referrals
  WHERE referred_user_id = referred_uuid
  AND status != 'rewarded'
  LIMIT 1;
  
  IF referral_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has published a site
  SELECT EXISTS(
    SELECT 1 FROM deployments 
    WHERE user_id = referred_uuid 
    AND status = 'deployed'
  ) INTO has_published;
  
  -- Check if user has active Pro subscription
  SELECT EXISTS(
    SELECT 1 FROM subscriptions 
    WHERE user_id = referred_uuid 
    AND subscription_plan IN ('pro', 'pro_plus', 'pro_max', 'pro_ultra', 'pro_extreme')
    AND status = 'active'
  ) INTO has_pro;
  
  -- Update referral status
  UPDATE referrals
  SET 
    has_published_site = has_published,
    has_pro_subscription = has_pro,
    status = CASE 
      WHEN has_published AND has_pro THEN 'qualified'
      WHEN referred_user_id IS NOT NULL THEN 'signed_up'
      ELSE 'pending'
    END,
    qualified_at = CASE WHEN has_published AND has_pro THEN now() ELSE qualified_at END,
    updated_at = now()
  WHERE id = referral_record.id;
  
  -- If qualified, award credits to referrer
  IF has_published AND has_pro AND referral_record.status != 'rewarded' THEN
    -- Add 10 credits to referrer
    UPDATE credit_balances
    SET current_credits = current_credits + 10,
        updated_at = now()
    WHERE user_id = referral_record.referrer_id;
    
    -- Log the credit addition
    INSERT INTO credit_logs (user_id, action_type, amount, balance_after, description)
    SELECT 
      referral_record.referrer_id,
      'referral_bonus',
      10,
      cb.current_credits,
      'Bonus parrainage - ' || referred_uuid::text
    FROM credit_balances cb
    WHERE cb.user_id = referral_record.referrer_id;
    
    -- Mark as rewarded
    UPDATE referrals
    SET 
      status = 'rewarded',
      credits_awarded = 10,
      rewarded_at = now(),
      updated_at = now()
    WHERE id = referral_record.id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Create function to link a signup to a referral code
CREATE OR REPLACE FUNCTION public.link_referral(referral_code_param TEXT, new_user_uuid UUID, new_user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_uuid UUID;
BEGIN
  -- Find the referrer by code
  SELECT referrer_id INTO referrer_uuid
  FROM referrals
  WHERE referral_code = referral_code_param
  LIMIT 1;
  
  IF referrer_uuid IS NULL THEN
    -- Create a placeholder referral if code doesn't exist yet
    -- (the code belongs to a user but no referral record exists)
    RETURN FALSE;
  END IF;
  
  -- Don't allow self-referral
  IF referrer_uuid = new_user_uuid THEN
    RETURN FALSE;
  END IF;
  
  -- Update or create referral record
  INSERT INTO referrals (referrer_id, referral_code, referred_user_id, referred_email, status)
  VALUES (referrer_uuid, referral_code_param, new_user_uuid, new_user_email, 'signed_up')
  ON CONFLICT (referral_code) 
  DO UPDATE SET 
    referred_user_id = new_user_uuid,
    referred_email = new_user_email,
    status = 'signed_up',
    updated_at = now();
  
  RETURN TRUE;
END;
$$;