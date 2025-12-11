import { useState } from 'react';
import { Globe, ExternalLink, RefreshCw, Rocket, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeployment } from '@/hooks/useDeployment';
import { useSubscription } from '@/hooks/useSubscription';
import { DomainSetup } from './DomainSetup';
import { DeploymentLogs } from './DeploymentLogs';
import { UpgradePrompt } from './UpgradePrompt';

interface HostingPanelProps {
  projectId: string;
}

export const HostingPanel = ({ projectId }: HostingPanelProps) => {
  const { 
    deployment, 
    customDomain, 
    logs, 
    loading, 
    publishing,
    publishToSubdomain 
  } = useDeployment(projectId);
  const { subscription, canUseCustomDomain } = useSubscription();
  const [showDomainSetup, setShowDomainSetup] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'building': return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'offline': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      deployed: 'default',
      building: 'secondary',
      failed: 'destructive',
      offline: 'outline',
      pending: 'outline'
    };
    
    const labels: Record<string, string> = {
      deployed: 'En ligne',
      building: 'Publication...',
      failed: 'Échec',
      offline: 'Hors ligne',
      pending: 'En attente'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="gap-1">
        {getStatusIcon(status)}
        {labels[status] || status}
      </Badge>
    );
  };

  const handleCustomDomainClick = () => {
    if (!canUseCustomDomain) {
      setShowUpgradePrompt(true);
    } else {
      setShowDomainSetup(true);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Hosting Card */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Hébergement & Publication</CardTitle>
            </div>
            {deployment && getStatusBadge(deployment.status)}
          </div>
          <CardDescription>
            Publiez votre site sur un sous-domaine PenFlow ou connectez votre propre domaine
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current URL - Show custom domain if active, otherwise subdomain */}
          {(deployment?.deploymentUrl || customDomain?.domain) && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">URL actuelle</p>
              <div className="flex items-center gap-2">
                <a 
                  href={customDomain?.domain && customDomain?.sslProvisioned 
                    ? `https://${customDomain.domain}` 
                    : customDomain?.domain 
                      ? `https://${customDomain.domain}`
                      : deployment?.deploymentUrl || ''
                  } 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  {customDomain?.domain 
                    ? `https://${customDomain.domain}` 
                    : deployment?.deploymentUrl
                  }
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              {deployment?.lastDeployedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Dernière publication: {deployment.lastDeployedAt.toLocaleString('fr-FR')}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={publishToSubdomain}
              disabled={publishing}
              className="w-full gap-2"
              variant={deployment?.status === 'deployed' ? 'secondary' : 'default'}
            >
              {publishing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              {deployment?.status === 'deployed' ? 'Republier' : 'Publier sur PenFlow'}
            </Button>

            <Button
              onClick={handleCustomDomainClick}
              variant="outline"
              className="w-full gap-2"
              disabled={publishing}
            >
              <Globe className="w-4 h-4" />
              Domaine personnalisé
              {!canUseCustomDomain && (
                <Badge variant="secondary" className="text-xs ml-1">PRO</Badge>
              )}
            </Button>
          </div>

          {/* Subdomain Info */}
          {deployment?.subdomain && (
            <div className="text-sm text-muted-foreground">
              Votre sous-domaine gratuit: <span className="text-foreground font-medium">{deployment.subdomain}.penflow.site</span>
            </div>
          )}

          {/* Custom Domain Status */}
          {customDomain && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Domaine personnalisé</span>
                <Badge variant={customDomain.isActive ? 'default' : 'destructive'}>
                  {customDomain.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <p className="text-primary font-medium">{customDomain.domain}</p>
              
              {!customDomain.isActive && customDomain.deactivationReason === 'subscription_expired' && (
                <div className="mt-2 p-2 rounded bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Votre abonnement Pro n'est plus actif. Votre domaine personnalisé est désactivé.
                </div>
              )}

              {customDomain.verificationStatus === 'pending' && (
                <p className="text-sm text-yellow-600 mt-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Vérification DNS en attente
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {deployment?.errorMessage && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {deployment.errorMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployment Logs */}
      {logs.length > 0 && (
        <DeploymentLogs logs={logs} />
      )}

      {/* Domain Setup Modal */}
      {showDomainSetup && (
        <DomainSetup
          projectId={projectId}
          onClose={() => setShowDomainSetup(false)}
        />
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <UpgradePrompt
          feature="domaines personnalisés"
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}
    </div>
  );
};
