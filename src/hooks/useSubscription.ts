import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Plan = 'free' | 'pro' | 'agency';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'expired';

interface Subscription {
  id: string;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  isPro: boolean;
  isAgency: boolean;
  canUseCustomDomain: boolean;
  refreshSubscription: () => Promise<void>;
}

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
        setSubscription({
          id: data.id,
          plan: data.plan as Plan,
          status: data.status as SubscriptionStatus,
          currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
          cancelAtPeriodEnd: data.cancel_at_period_end || false
        });
      } else {
        // Create default free subscription if none exists
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: 'free',
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
            cancelAtPeriodEnd: false
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

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active';
  const isAgency = subscription?.plan === 'agency' && subscription?.status === 'active';
  const canUseCustomDomain = (isPro || isAgency) && subscription?.status === 'active';

  return {
    subscription,
    loading,
    isPro,
    isAgency,
    canUseCustomDomain,
    refreshSubscription: fetchSubscription
  };
};
