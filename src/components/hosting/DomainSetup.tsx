import { useState } from 'react';
import { X, Globe, Copy, CheckCircle, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
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

  const handleSetupDomain = async () => {
    if (!domain.trim()) {
      toast.error('Veuillez entrer un nom de domaine');
      return;
    }

    // Basic domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast.error('Format de domaine invalide');
      return;
    }

    setIsSettingUp(true);
    try {
      const result = await setupCustomDomain(domain);
      if (result) {
        setDnsInstructions(result.dnsInstructions);
        toast.success('Configuration du domaine initiée');
      }
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerifyDns = async () => {
    setIsVerifying(true);
    try {
      const verified = await verifyDns();
      if (verified) {
        // If verified, also publish to custom domain
        await publishToCustomDomain(domain);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Êtes-vous sûr de vouloir déconnecter ce domaine ?')) {
      await disconnectDomain();
      onClose();
    }
  };

  const copyToClipboard = (text: string, recordType: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRecord(recordType);
    toast.success('Copié !');
    setTimeout(() => setCopiedRecord(null), 2000);
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
          {/* Domain Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom de domaine</label>
            <div className="flex gap-2">
              <Input
                placeholder="monsite.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={!!customDomain?.domain || isSettingUp}
              />
              {!customDomain?.domain && (
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
              )}
            </div>
          </div>

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

              {/* Verification Status */}
              {customDomain && (
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
