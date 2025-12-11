import { useState, useEffect, useCallback } from 'react';
import { X, Globe, Copy, CheckCircle, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeployment } from '@/hooks/useDeployment';
import { toast } from 'sonner';

interface DomainSetupProps {
  projectId: string;
  onClose: () => void;
}

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  description: string;
}

const cleanDomain = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/+$/, '');
};

export const DomainSetup = ({ projectId, onClose }: DomainSetupProps) => {
  const { 
    deployment, 
    customDomain, 
    setupCustomDomain, 
    verifyDns, 
    disconnectDomain,
    publishToCustomDomain 
  } = useDeployment(projectId);
  
  const [domain, setDomain] = useState(customDomain?.domain || '');
  const [dnsInstructions, setDnsInstructions] = useState<{ records: DnsRecord[]; notes: string[] } | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [sslReady, setSslReady] = useState(customDomain?.sslProvisioned || false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [isChangingDomain, setIsChangingDomain] = useState(false);

  const handleSetupDomain = async () => {
    const cleaned = cleanDomain(domain);
    
    if (!cleaned) {
      toast.error('Veuillez entrer un nom de domaine');
      return;
    }

    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(cleaned)) {
      toast.error('Format invalide. Exemple: monsite.com');
      return;
    }

    setDomain(cleaned);
    setIsSettingUp(true);
    
    try {
      const result = await setupCustomDomain(cleaned);
      if (result) {
        setDnsInstructions(result.dnsInstructions);
        toast.success('Domaine configuré automatiquement sur Vercel !');
        setAutoRefresh(true);
      }
    } catch (error) {
      toast.error('Erreur lors de la configuration');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerifyDns = useCallback(async () => {
    setIsVerifying(true);
    try {
      const result = await verifyDns();
      
      if (result && typeof result === 'object') {
        const dnsResult = result as { 
          verified?: boolean; 
          sslReady?: boolean;
          message?: string;
        };
        
        setVerificationMessage(dnsResult.message || null);
        
        if (dnsResult.sslReady) {
          setSslReady(true);
          setAutoRefresh(false);
          await publishToCustomDomain(domain);
          toast.success('🎉 Domaine actif avec HTTPS !');
        } else if (dnsResult.verified) {
          toast.info('DNS vérifié, SSL en cours...');
        }
      }
    } catch (error) {
      console.error('Verify error:', error);
    } finally {
      setIsVerifying(false);
    }
  }, [verifyDns, publishToCustomDomain, domain]);

  const handleDisconnect = async () => {
    if (confirm('Déconnecter ce domaine ?')) {
      await disconnectDomain();
      setAutoRefresh(false);
      onClose();
    }
  };

  const copyToClipboard = (text: string, recordType: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRecord(recordType);
    toast.success('Copié !');
    setTimeout(() => setCopiedRecord(null), 2000);
  };

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!autoRefresh || sslReady) return;

    const interval = setInterval(() => {
      handleVerifyDns();
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh, sslReady, handleVerifyDns]);

  // Initial verify if domain exists
  useEffect(() => {
    if (customDomain?.domain && !customDomain.sslProvisioned) {
      setAutoRefresh(true);
      handleVerifyDns();
    }
  }, [customDomain?.domain]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Domaine personnalisé
            </CardTitle>
            <CardDescription>
              Configuration 100% automatique
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success State */}
          {sslReady && customDomain?.domain && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    Domaine actif avec HTTPS !
                  </p>
                  <a 
                    href={`https://${customDomain.domain}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    https://{customDomain.domain}
                  </a>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={handleDisconnect}
              >
                Déconnecter
              </Button>
            </div>
          )}

          {/* Domain Input */}
          {!sslReady && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de domaine</label>
              <div className="flex gap-2">
                <Input
                  placeholder="monsite.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={isSettingUp || (!!customDomain?.domain && !isChangingDomain)}
                />
                {(!customDomain?.domain || isChangingDomain) ? (
                  <Button 
                    onClick={handleSetupDomain} 
                    disabled={isSettingUp || !domain}
                  >
                    {isSettingUp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Configurer'
                    )}
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsChangingDomain(true);
                      setDomain('');
                    }}
                  >
                    Changer
                  </Button>
                )}
              </div>
              {customDomain?.domain && !isChangingDomain && (
                <p className="text-xs text-muted-foreground">
                  Domaine actuel : {customDomain.domain}
                </p>
              )}
            </div>
          )}

          {/* DNS Instructions */}
          {!sslReady && (dnsInstructions || customDomain?.domain) && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Configurez votre DNS
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  Allez chez votre registrar (Namecheap, GoDaddy, OVH...) et ajoutez :
                </p>

                <div className="space-y-3">
                  {(dnsInstructions?.records || [
                    { type: 'A', name: '@', value: '76.76.21.21', description: 'Pointez votre domaine vers Vercel' },
                  ]).map((record) => (
                    <div 
                      key={record.type + record.name}
                      className="p-3 rounded-lg bg-background border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{record.type}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(record.value, record.type + record.name)}
                          className="h-7"
                        >
                          {copiedRecord === record.type + record.name ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Host:</span>{' '}
                          <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{record.name}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value:</span>{' '}
                          <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{record.value}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Message */}
                {verificationMessage && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm">{verificationMessage}</p>
                  </div>
                )}

                {/* Verify Button */}
                <div className="mt-4 flex items-center justify-between">
                  <Button 
                    onClick={handleVerifyDns} 
                    disabled={isVerifying}
                    className="gap-2"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Vérifier
                  </Button>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {autoRefresh && (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Auto-vérification...
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Help */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  💡 La propagation DNS prend généralement 5-60 minutes. Une fois configuré, le HTTPS s'active automatiquement.
                </p>
              </div>

              {/* Disconnect */}
              {customDomain?.domain && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-destructive hover:text-destructive"
                >
                  Déconnecter le domaine
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
