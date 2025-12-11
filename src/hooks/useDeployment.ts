import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type DeploymentStatus = 'pending' | 'building' | 'deployed' | 'failed' | 'offline';
export type DeploymentType = 'subdomain' | 'custom_domain';
export type SslStatus = 'none' | 'pending' | 'active' | 'failed';

interface Deployment {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  deploymentType: DeploymentType;
  subdomain: string | null;
  customDomain: string | null;
  deploymentUrl: string | null;
  sslStatus: SslStatus;
  lastDeployedAt: Date | null;
  errorMessage: string | null;
}

interface DeploymentLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  createdAt: Date;
}

interface CustomDomainInfo {
  domain: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  dnsConfigured: boolean;
  sslProvisioned: boolean;
  isActive: boolean;
  deactivationReason: string | null;
}

interface UseDeploymentReturn {
  deployment: Deployment | null;
  customDomain: CustomDomainInfo | null;
  logs: DeploymentLog[];
  loading: boolean;
  publishing: boolean;
  publishToSubdomain: () => Promise<void>;
  publishToCustomDomain: (domain: string) => Promise<void>;
  setupCustomDomain: (domain: string) => Promise<{ dnsInstructions: any } | null>;
  verifyDns: () => Promise<boolean>;
  disconnectDomain: () => Promise<void>;
  refreshDeployment: () => Promise<void>;
}

export const useDeployment = (projectId: string | null): UseDeploymentReturn => {
  const { user, session } = useAuth();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [customDomain, setCustomDomain] = useState<CustomDomainInfo | null>(null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Helper to refresh session before API calls
  const ensureValidSession = async () => {
    const { data: { session: currentSession }, error } = await supabase.auth.getSession();
    if (error || !currentSession) {
      // Try to refresh
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData.session) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        window.location.href = '/auth';
        return false;
      }
    }
    return true;
  };

  const fetchDeployment = useCallback(async () => {
    if (!projectId || !user) {
      setDeployment(null);
      setCustomDomain(null);
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      await ensureValidSession();
      // Fetch deployment
      const { data: deploymentData, error: deploymentError } = await supabase
        .from('deployments')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (deploymentError && deploymentError.code !== 'PGRST116') {
        console.error('Error fetching deployment:', deploymentError);
      }

      if (deploymentData) {
        setDeployment({
          id: deploymentData.id,
          projectId: deploymentData.project_id,
          status: deploymentData.status as DeploymentStatus,
          deploymentType: deploymentData.deployment_type as DeploymentType,
          subdomain: deploymentData.subdomain,
          customDomain: deploymentData.custom_domain,
          deploymentUrl: deploymentData.deployment_url,
          sslStatus: deploymentData.ssl_status as SslStatus,
          lastDeployedAt: deploymentData.last_deployed_at ? new Date(deploymentData.last_deployed_at) : null,
          errorMessage: deploymentData.error_message
        });

        // Fetch custom domain if exists
        const { data: domainData } = await supabase
          .from('custom_domains')
          .select('*')
          .eq('deployment_id', deploymentData.id)
          .single();

        if (domainData) {
          setCustomDomain({
            domain: domainData.domain,
            verificationStatus: domainData.verification_status as any,
            dnsConfigured: domainData.dns_configured,
            sslProvisioned: domainData.ssl_provisioned,
            isActive: domainData.is_active,
            deactivationReason: domainData.deactivation_reason
          });
        }

        // Fetch logs
        const { data: logsData } = await supabase
          .from('deployment_logs')
          .select('*')
          .eq('deployment_id', deploymentData.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (logsData) {
          setLogs(logsData.map(log => ({
            id: log.id,
            level: log.level as any,
            message: log.message,
            createdAt: new Date(log.created_at)
          })));
        }
      } else {
        setDeployment(null);
        setCustomDomain(null);
        setLogs([]);
      }
    } catch (err) {
      console.error('Deployment fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    fetchDeployment();
  }, [fetchDeployment]);

  const publishToSubdomain = async () => {
    if (!projectId || !session) return;

    setPublishing(true);
    try {
      // Ensure valid session before API call
      const isValid = await ensureValidSession();
      if (!isValid) return;

      const { data, error } = await supabase.functions.invoke('publish-site', {
        body: {
          projectId,
          deploymentType: 'subdomain'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        await fetchDeployment();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Publish error:', err);
      toast.error(err.message || 'Publication failed');
    } finally {
      setPublishing(false);
    }
  };

  const publishToCustomDomain = async (domain: string) => {
    if (!projectId || !session) return;

    setPublishing(true);
    try {
      const isValid = await ensureValidSession();
      if (!isValid) return;

      const { data, error } = await supabase.functions.invoke('publish-site', {
        body: {
          projectId,
          deploymentType: 'custom_domain',
          customDomain: domain
        }
      });

      if (error) throw error;

      if (data.requiresUpgrade) {
        toast.error('Les domaines personnalisés nécessitent un abonnement Pro');
        return;
      }

      if (data.success) {
        toast.success(data.message);
        await fetchDeployment();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Publish error:', err);
      toast.error(err.message || 'Publication failed');
    } finally {
      setPublishing(false);
    }
  };

  const setupCustomDomain = async (domain: string): Promise<{ dnsInstructions: any } | null> => {
    if (!deployment || !session) return null;

    try {
      const isValid = await ensureValidSession();
      if (!isValid) return null;

      const { data, error } = await supabase.functions.invoke('verify-domain', {
        body: {
          deploymentId: deployment.id,
          domain
        }
      });

      if (error) throw error;

      if (data.requiresUpgrade) {
        toast.error('Les domaines personnalisés nécessitent un abonnement Pro');
        return null;
      }

      if (data.success) {
        await fetchDeployment();
        return { dnsInstructions: data.dnsInstructions };
      }

      throw new Error(data.error);
    } catch (err: any) {
      console.error('Domain setup error:', err);
      toast.error(err.message || 'Domain setup failed');
      return null;
    }
  };

  const verifyDns = async (): Promise<boolean> => {
    if (!deployment || !session) return false;

    try {
      const isValid = await ensureValidSession();
      if (!isValid) return false;

      const { data, error } = await supabase.functions.invoke('check-dns', {
        body: { deploymentId: deployment.id }
      });

      if (error) throw error;

      await fetchDeployment();

      if (data.verified) {
        toast.success('Domaine vérifié avec succès !');
        return true;
      } else {
        toast.info('DNS non encore configuré. Veuillez patienter.');
        return false;
      }
    } catch (err: any) {
      console.error('DNS check error:', err);
      toast.error(err.message || 'DNS verification failed');
      return false;
    }
  };

  const disconnectDomain = async () => {
    if (!deployment) return;

    try {
      // Delete custom domain record
      await supabase
        .from('custom_domains')
        .delete()
        .eq('deployment_id', deployment.id);

      // Update deployment to subdomain type
      await supabase
        .from('deployments')
        .update({
          deployment_type: 'subdomain',
          custom_domain: null,
          deployment_url: deployment.subdomain ? `https://${deployment.subdomain}.penflow.site` : null
        })
        .eq('id', deployment.id);

      toast.success('Domaine personnalisé déconnecté');
      await fetchDeployment();
    } catch (err: any) {
      console.error('Disconnect domain error:', err);
      toast.error(err.message || 'Failed to disconnect domain');
    }
  };

  return {
    deployment,
    customDomain,
    logs,
    loading,
    publishing,
    publishToSubdomain,
    publishToCustomDomain,
    setupCustomDomain,
    verifyDns,
    disconnectDomain,
    refreshDeployment: fetchDeployment
  };
};
