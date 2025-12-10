import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SubscriptionPlan = 'free' | 'pro' | 'pro_plus' | 'pro_max' | 'pro_ultra' | 'pro_extreme';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'expired';

interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  isPro: boolean;
  isProPlus: boolean;
  isProMax: boolean;
  isProUltra: boolean;
  isProExtreme: boolean;
  canUseCustomDomain: boolean;
  refreshSubscription: () => Promise<void>;
}

const paidPlans: SubscriptionPlan[] = ['pro', 'pro_plus', 'pro_max', 'pro_ultra', 'pro_extreme'];

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }

      if (data) {
        // Use the new subscription_plan column if available, fallback to plan
        const planValue = (data.subscription_plan || data.plan) as SubscriptionPlan;
        
        setSubscription({
          id: data.id,
          plan: planValue,
          status: data.status as SubscriptionStatus,
          currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
          cancelAtPeriodEnd: data.cancel_at_period_end || false,
          stripeCustomerId: data.stripe_customer_id,
          stripeSubscriptionId: data.stripe_subscription_id
        });
      } else {
        // Create default free subscription if none exists
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: 'free',
            subscription_plan: 'free',
            status: 'active'
          })
          .select()
          .single();

        if (!createError && newSub) {
          setSubscription({
            id: newSub.id,
            plan: 'free',
            status: 'active',
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            stripeCustomerId: null,
            stripeSubscriptionId: null
          });
        }
      }
    } catch (err) {
      console.error('Subscription fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const isActive = subscription?.status === 'active';
  const isPro = subscription?.plan === 'pro' && isActive;
  const isProPlus = subscription?.plan === 'pro_plus' && isActive;
  const isProMax = subscription?.plan === 'pro_max' && isActive;
  const isProUltra = subscription?.plan === 'pro_ultra' && isActive;
  const isProExtreme = subscription?.plan === 'pro_extreme' && isActive;
  const canUseCustomDomain = paidPlans.includes(subscription?.plan || 'free') && isActive;

  return {
    subscription,
    loading,
    isPro,
    isProPlus,
    isProMax,
    isProUltra,
    isProExtreme,
    canUseCustomDomain,
    refreshSubscription: fetchSubscription
  };
};
