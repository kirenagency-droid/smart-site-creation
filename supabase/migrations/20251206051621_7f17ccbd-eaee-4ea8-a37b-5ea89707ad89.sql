-- Table for tracking deployments
CREATE TABLE public.deployments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deployed', 'failed', 'offline')),
  deployment_type TEXT NOT NULL DEFAULT 'subdomain' CHECK (deployment_type IN ('subdomain', 'custom_domain')),
  subdomain TEXT,
  custom_domain TEXT,
  deployment_url TEXT,
  external_deployment_id TEXT,
  hosting_provider TEXT DEFAULT 'vercel',
  ssl_status TEXT DEFAULT 'none' CHECK (ssl_status IN ('none', 'pending', 'active', 'failed')),
  last_deployed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subdomain),
  UNIQUE(custom_domain)
);

-- Table for custom domain verification and management
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verification_token TEXT,
  dns_configured BOOLEAN DEFAULT false,
  ssl_provisioned BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  deactivation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for deployment logs
CREATE TABLE public.deployment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id UUID NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warning', 'error', 'success')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for subscription management (prepared for Stripe integration)
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deployments
CREATE POLICY "Users can view own deployments" ON public.deployments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deployments" ON public.deployments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deployments" ON public.deployments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deployments" ON public.deployments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for custom_domains
CREATE POLICY "Users can view own custom domains" ON public.custom_domains
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom domains" ON public.custom_domains
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom domains" ON public.custom_domains
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom domains" ON public.custom_domains
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for deployment_logs
CREATE POLICY "Users can view logs of own deployments" ON public.deployment_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.deployments
      WHERE deployments.id = deployment_logs.deployment_id
      AND deployments.user_id = auth.uid()
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_deployments_updated_at
  BEFORE UPDATE ON public.deployments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user can use custom domains (Pro plan required)
CREATE OR REPLACE FUNCTION public.can_use_custom_domain(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan TEXT;
  sub_status TEXT;
BEGIN
  SELECT plan, status INTO user_plan, sub_status
  FROM public.subscriptions
  WHERE user_id = user_uuid;
  
  -- If no subscription record, check profiles table
  IF user_plan IS NULL THEN
    SELECT plan INTO user_plan FROM public.profiles WHERE id = user_uuid;
  END IF;
  
  RETURN (user_plan IN ('pro', 'agency')) AND (sub_status IS NULL OR sub_status = 'active');
END;
$$;

-- Function to generate unique subdomain
CREATE OR REPLACE FUNCTION public.generate_subdomain(project_name TEXT, project_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_subdomain TEXT;
  final_subdomain TEXT;
  counter INTEGER := 0;
BEGIN
  -- Sanitize project name for subdomain use
  base_subdomain := lower(regexp_replace(project_name, '[^a-zA-Z0-9]', '-', 'g'));
  base_subdomain := regexp_replace(base_subdomain, '-+', '-', 'g');
  base_subdomain := trim(both '-' from base_subdomain);
  
  -- Limit length
  IF length(base_subdomain) > 30 THEN
    base_subdomain := substring(base_subdomain from 1 for 30);
  END IF;
  
  -- If empty, use project id prefix
  IF base_subdomain = '' OR base_subdomain IS NULL THEN
    base_subdomain := 'site-' || substring(project_id::text from 1 for 8);
  END IF;
  
  final_subdomain := base_subdomain;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.deployments WHERE subdomain = final_subdomain) LOOP
    counter := counter + 1;
    final_subdomain := base_subdomain || '-' || counter;
  END LOOP;
  
  RETURN final_subdomain;
END;
$$;

-- Function to auto-create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create subscription when profile is created
CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- Function to deactivate custom domains when subscription expires
CREATE OR REPLACE FUNCTION public.deactivate_expired_domains()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark custom domains as inactive for users with expired/canceled subscriptions
  UPDATE public.custom_domains cd
  SET 
    is_active = false,
    deactivation_reason = 'subscription_expired',
    updated_at = now()
  FROM public.subscriptions s
  WHERE cd.user_id = s.user_id
    AND s.status IN ('expired', 'canceled')
    AND cd.is_active = true;
  
  -- Update deployments to offline for inactive custom domains
  UPDATE public.deployments d
  SET 
    status = 'offline',
    updated_at = now()
  FROM public.custom_domains cd
  WHERE d.id = cd.deployment_id
    AND cd.is_active = false
    AND d.deployment_type = 'custom_domain'
    AND d.status = 'deployed';
END;
$$;