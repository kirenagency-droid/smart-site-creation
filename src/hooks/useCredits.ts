import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PlanLimits {
  plan: string;
  name: string;
  monthly_credits: number;
  daily_credits: number;
  max_credit_pool: number;
  max_projects: number;
  custom_domain_allowed: boolean;
  badge_removable: boolean;
  priority_level: number;
}

export interface CreditBalance {
  current_credits: number;
  last_daily_refill: string | null;
  last_monthly_reset: string | null;
}

export interface CreditLog {
  id: string;
  amount: number;
  balance_after: number;
  action_type: string;
  description: string;
  created_at: string;
}

interface UseCreditsReturn {
  credits: number;
  planLimits: PlanLimits | null;
  creditLogs: CreditLog[];
  loading: boolean;
  canUseFeature: (feature: 'custom_domain' | 'remove_badge' | 'create_project') => boolean;
  refreshCredits: () => Promise<void>;
  consumeCredits: (tokensUsed: number, description?: string) => Promise<{ success: boolean; creditsConsumed: number; remaining: number; error?: string }>;
}

export const useCredits = (): UseCreditsReturn => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [creditLogs, setCreditLogs] = useState<CreditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(0);
      setPlanLimits(null);
      setCreditLogs([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch credit balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('credit_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') {
        console.error('Error fetching credit balance:', balanceError);
      }

      if (balanceData) {
        setCredits(balanceData.current_credits);
      } else {
        // Create default balance if not exists
        const { data: newBalance } = await supabase
          .from('credit_balances')
          .insert({ user_id: user.id, current_credits: 5 })
          .select()
          .single();
        
        if (newBalance) {
          setCredits(newBalance.current_credits);
        }
      }

      // Fetch plan limits using RPC
      const { data: limitsData, error: limitsError } = await supabase
        .rpc('get_user_plan_limits', { user_uuid: user.id });

      if (limitsError) {
        console.error('Error fetching plan limits:', limitsError);
      }

      if (limitsData && limitsData.length > 0) {
        setPlanLimits(limitsData[0] as PlanLimits);
      }

      // Fetch recent credit logs
      const { data: logsData, error: logsError } = await supabase
        .from('credit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (logsError) {
        console.error('Error fetching credit logs:', logsError);
      }

      if (logsData) {
        setCreditLogs(logsData as CreditLog[]);
      }

      // Try daily refill
      await supabase.rpc('daily_credit_refill', { user_uuid: user.id });

    } catch (err) {
      console.error('Credits fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const canUseFeature = useCallback((feature: 'custom_domain' | 'remove_badge' | 'create_project'): boolean => {
    if (!planLimits) return false;

    switch (feature) {
      case 'custom_domain':
        return planLimits.custom_domain_allowed;
      case 'remove_badge':
        return planLimits.badge_removable;
      case 'create_project':
        return planLimits.max_projects === -1 || planLimits.max_projects > 0;
      default:
        return false;
    }
  }, [planLimits]);

  const consumeCredits = useCallback(async (
    tokensUsed: number, 
    description: string = 'AI generation'
  ): Promise<{ success: boolean; creditsConsumed: number; remaining: number; error?: string }> => {
    if (!user) {
      return { success: false, creditsConsumed: 0, remaining: 0, error: 'Non connecté' };
    }

    try {
      const { data, error } = await supabase
        .rpc('consume_credits', {
          user_uuid: user.id,
          tokens_used: tokensUsed,
          action_description: description
        });

      if (error) {
        console.error('Error consuming credits:', error);
        return { success: false, creditsConsumed: 0, remaining: credits, error: error.message };
      }

      if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          setCredits(result.remaining_credits);
          await fetchCredits(); // Refresh logs
        }
        return {
          success: result.success,
          creditsConsumed: result.credits_consumed,
          remaining: result.remaining_credits,
          error: result.error_message || undefined
        };
      }

      return { success: false, creditsConsumed: 0, remaining: credits, error: 'Erreur inconnue' };
    } catch (err) {
      console.error('Consume credits error:', err);
      return { success: false, creditsConsumed: 0, remaining: credits, error: 'Erreur de connexion' };
    }
  }, [user, credits, fetchCredits]);

  return {
    credits,
    planLimits,
    creditLogs,
    loading,
    canUseFeature,
    refreshCredits: fetchCredits,
    consumeCredits
  };
};
