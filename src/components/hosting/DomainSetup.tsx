import { useState, useEffect, useCallback } from 'react';
import { X, Globe, Copy, CheckCircle, RefreshCw, AlertCircle, Trash2, Search, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeployment } from '@/hooks/useDeployment';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

interface PreCheckResult {
  valid: boolean;
  hasNameservers: boolean;
  currentARecord: string | null;
  currentCNAME: string | null;
  message: string;
  details: {
    nsRecords: string[];
    aRecord: string | null;
    cnameRecord: string | null;
  };
}

interface DnsStatus {
  aRecord: { found: boolean; value: string | null; expected: string };
  cnameRecord: { found: boolean; value: string | null; expected: string };
  txtRecord: { found: boolean; value: string | null; expected: string };
}

// Helper to clean domain input
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
  
  // New states for pre-check and real-time status
  const [isPreChecking, setIsPreChecking] = useState(false);
  const [preCheckResult, setPreCheckResult] = useState<PreCheckResult | null>(null);
  const [dnsStatus, setDnsStatus] = useState<DnsStatus | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Pre-check domain before configuration
  const handlePreCheck = useCallback(async () => {
    const cleaned = cleanDomain(domain);
    if (!cleaned) {
      toast.error('Veuillez entrer un nom de domaine');
      return;
    }

    setIsPreChecking(true);
    setPreCheckResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('dns-precheck', {
        body: { domain: cleaned }
      });

      if (error) throw error;
      setPreCheckResult(data as PreCheckResult);
      
      if (data?.valid) {
        toast.success('Domaine valide !');
      } else {
        toast.error(data?.message || 'Domaine invalide');
      }
    } catch (error) {
      console.error('Pre-check error:', error);
      toast.error('Erreur lors de la vérification');
    } finally {
      setIsPreChecking(false);
    }
  }, [domain]);

  const handleSetupDomain = async () => {
    const cleaned = cleanDomain(domain);
    
    if (!cleaned) {
      toast.error('Veuillez entrer un nom de domaine');
      return;
    }

    // Basic domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(cleaned)) {
      toast.error('Format invalide. Exemple: monsite.com (sans www ni http)');
      return;
    }

    // Update the input with cleaned domain
    setDomain(cleaned);

    setIsSettingUp(true);
    try {
      const result = await setupCustomDomain(cleaned);
      if (result) {
        setDnsInstructions(result.dnsInstructions);
        toast.success('Configuration du domaine initiée');
        setAutoRefresh(true); // Start auto-refresh after setup
      }
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerifyDns = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyDns();
      
      // Update DNS status from verification result
      if (result && typeof result === 'object') {
        const dnsResult = result as { verified?: boolean; details?: DnsStatus };
        
        if (dnsResult.details) {
          setDnsStatus(dnsResult.details);
        }
        
        if (dnsResult.verified) {
          await publishToCustomDomain(domain);
          setAutoRefresh(false); // Stop auto-refresh on success
          toast.success('Domaine vérifié et site publié !');
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Êtes-vous sûr de vouloir déconnecter ce domaine ?')) {
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

  // Auto-refresh DNS status every 30 seconds when enabled
  useEffect(() => {
    if (!autoRefresh || !customDomain) return;

    const interval = setInterval(() => {
      handleVerifyDns();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, customDomain]);

  const renderDnsStatusRow = (
    label: string, 
    status: { found: boolean; value: string | null; expected: string } | undefined,
    recordType: string
  ) => {
    if (!status) return null;
    
    return (
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border border-border/50">
        <div className="flex items-center gap-2">
          {status.found ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
          <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={status.found ? 'default' : 'secondary'}>
            {status.found ? 'Configuré' : 'En attente'}
          </Badge>
          {status.value && (
            <code className="bg-muted px-2 py-0.5 rounded">{status.value}</code>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Domaine personnalisé
            </CardTitle>
            <CardDescription>
              Connectez votre propre nom de domaine à votre site
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Domain Input with Pre-Check */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom de domaine</label>
            <div className="flex gap-2">
              <Input
                placeholder="exemple.com (sans www ni http)"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setPreCheckResult(null);
                }}
                disabled={!!customDomain?.domain || isSettingUp}
              />
              {!customDomain?.domain && (
                <>
                  <Button 
                    variant="outline"
                    onClick={handlePreCheck} 
                    disabled={isPreChecking || !domain}
                    title="Tester la connectivité DNS"
                  >
                    {isPreChecking ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                  <Button 
                    onClick={handleSetupDomain} 
                    disabled={isSettingUp || !domain}
                  >
                    {isSettingUp ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Configurer'
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Pre-Check Result */}
          {preCheckResult && (
            <div className={`p-4 rounded-xl border ${
              preCheckResult.valid 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {preCheckResult.valid ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {preCheckResult.valid ? 'Domaine accessible' : 'Domaine non accessible'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{preCheckResult.message}</p>
              
              {preCheckResult.valid && preCheckResult.details && (
                <div className="mt-3 space-y-1 text-xs">
                  {preCheckResult.details.nsRecords.length > 0 && (
                    <p className="text-muted-foreground">
                      Nameservers: {preCheckResult.details.nsRecords.slice(0, 2).join(', ')}
                    </p>
                  )}
                  {preCheckResult.currentARecord && (
                    <p className="text-muted-foreground">
                      A record actuel: <code className="bg-muted px-1 rounded">{preCheckResult.currentARecord}</code>
                      {preCheckResult.currentARecord === '76.76.21.21' ? ' ✅' : ' (à modifier)'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* DNS Instructions */}
          {(dnsInstructions || customDomain) && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Configuration DNS requise
                </h3>

                <div className="space-y-3">
                  {(dnsInstructions?.records || [
                    { type: 'A', name: '@', value: '76.76.21.21', description: 'Enregistrement A pour le domaine racine' },
                    { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', description: 'Enregistrement CNAME pour www' },
                  ]).map((record) => (
                    <div 
                      key={record.type + record.name}
                      className="p-3 rounded-lg bg-background border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{record.type}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(record.value, record.type)}
                          className="h-7"
                        >
                          {copiedRecord === record.type ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nom:</span>{' '}
                          <code className="bg-muted px-1 rounded">{record.name}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valeur:</span>{' '}
                          <code className="bg-muted px-1 rounded text-xs">{record.value}</code>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{record.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⏱️ La propagation DNS peut prendre jusqu'à 48 heures. Une fois configuré, cliquez sur "Vérifier" pour activer votre domaine.
                  </p>
                </div>
              </div>

              {/* Real-time DNS Status */}
              {dnsStatus && (
                <div className="p-4 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium flex items-center gap-2">
                      <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
                      Statut DNS en temps réel
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className="text-xs"
                    >
                      {autoRefresh ? 'Arrêter auto-refresh' : 'Auto-refresh (30s)'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {renderDnsStatusRow('A Record (@)', dnsStatus.aRecord, 'A')}
                    {renderDnsStatusRow('CNAME (www)', dnsStatus.cnameRecord, 'CNAME')}
                    {renderDnsStatusRow('TXT (vérification)', dnsStatus.txtRecord, 'TXT')}
                  </div>
                </div>
              )}

              {/* Verification Status */}
              {customDomain && !dnsStatus && (
                <div className="p-4 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Statut de vérification</span>
                    <Badge 
                      variant={customDomain.verificationStatus === 'verified' ? 'default' : 'secondary'}
                    >
                      {customDomain.verificationStatus === 'verified' ? 'Vérifié' : 'En attente'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {customDomain.dnsConfigured ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      DNS configuré
                    </div>
                    <div className="flex items-center gap-2">
                      {customDomain.sslProvisioned ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      Certificat SSL
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleVerifyDns}
                  disabled={isVerifying}
                  className="flex-1"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Vérifier le DNS
                </Button>

                {customDomain && (
                  <Button 
                    variant="destructive" 
                    onClick={handleDisconnect}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Déconnecter
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Besoin d'aide ?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Connectez-vous à votre registrar de domaine (OVH, Gandi, Namecheap...)</li>
              <li>Accédez aux paramètres DNS de votre domaine</li>
              <li>Ajoutez les enregistrements indiqués ci-dessus</li>
              <li>Attendez la propagation et cliquez sur Vérifier</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
