import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Referral {
  id: string;
  referral_code: string;
  referred_email: string | null;
  status: string;
  has_published_site: boolean;
  has_pro_subscription: boolean;
  credits_awarded: number;
  created_at: string;
  qualified_at: string | null;
  rewarded_at: string | null;
}

interface UseReferralReturn {
  referralCode: string | null;
  referrals: Referral[];
  loading: boolean;
  totalCreditsEarned: number;
  pendingReferrals: number;
  qualifiedReferrals: number;
  generateReferralLink: () => string;
  refreshReferrals: () => Promise<void>;
}

export const useReferral = (): UseReferralReturn => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferralData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get or create referral code
      const { data: codeData, error: codeError } = await supabase
        .rpc('get_or_create_referral_code', { user_uuid: user.id });

      if (codeError) {
        console.error('Error getting referral code:', codeError);
      } else {
        // If no code returned, we need to create the first referral entry
        if (!codeData) {
          const newCode = user.id.substring(0, 8).toUpperCase() + 
                         Math.random().toString(36).substring(2, 6).toUpperCase();
          
          const { error: insertError } = await supabase
            .from('referrals')
            .insert({
              referrer_id: user.id,
              referral_code: newCode,
              status: 'pending'
            });

          if (!insertError) {
            setReferralCode(newCode);
          }
        } else {
          setReferralCode(codeData);
        }
      }

      // Fetch existing referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      } else {
        setReferrals(referralsData || []);
        
        // Get the referral code from the first entry if not already set
        if (!referralCode && referralsData && referralsData.length > 0) {
          setReferralCode(referralsData[0].referral_code);
        }
      }
    } catch (error) {
      console.error('Error in fetchReferralData:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const generateReferralLink = useCallback(() => {
    if (!referralCode) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth?ref=${referralCode}`;
  }, [referralCode]);

  const totalCreditsEarned = referrals.reduce((sum, r) => sum + r.credits_awarded, 0);
  const pendingReferrals = referrals.filter(r => r.status === 'signed_up' || r.status === 'pending').length;
  const qualifiedReferrals = referrals.filter(r => r.status === 'rewarded').length;

  return {
    referralCode,
    referrals,
    loading,
    totalCreditsEarned,
    pendingReferrals,
    qualifiedReferrals,
    generateReferralLink,
    refreshReferrals: fetchReferralData
  };
};
