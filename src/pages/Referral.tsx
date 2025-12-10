import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gift, 
  Copy, 
  Check, 
  Users, 
  Coins, 
  Globe, 
  CreditCard,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useReferral } from '@/hooks/useReferral';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Referral = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    referralCode, 
    referrals, 
    loading, 
    totalCreditsEarned,
    pendingReferrals,
    qualifiedReferrals,
    generateReferralLink 
  } = useReferral();
  
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const link = generateReferralLink();
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Lien copié !",
        description: "Partagez ce lien avec vos amis pour gagner des crédits.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    const link = generateReferralLink();
    if (!link) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins Creali !',
          text: 'Crée ton site web en quelques secondes avec Creali. Utilise mon lien pour t\'inscrire !',
          url: link,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  const steps = [
    {
      icon: Share2,
      title: "1. Partage ton lien",
      description: "Envoie ton lien d'affiliation unique à tes amis, collègues ou sur les réseaux sociaux."
    },
    {
      icon: Globe,
      title: "2. Ils publient un site",
      description: "La personne invitée crée un compte et publie son premier site web avec Creali."
    },
    {
      icon: CreditCard,
      title: "3. Ils passent Pro",
      description: "Quand ils souscrivent à l'abonnement Pro à 25€/mois, tu reçois automatiquement 10 crédits !"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Gift className="w-8 h-8 text-primary" />
                  Programme de Parrainage
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gagne 10 crédits pour chaque ami qui passe Pro !
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{totalCreditsEarned}</p>
                      <p className="text-sm text-muted-foreground">Crédits gagnés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{pendingReferrals}</p>
                      <p className="text-sm text-muted-foreground">En attente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{qualifiedReferrals}</p>
                      <p className="text-sm text-muted-foreground">Validés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Link Card */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Ton lien d'affiliation
                </CardTitle>
                <CardDescription>
                  Partage ce lien unique pour inviter tes amis et gagner des crédits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={loading ? 'Chargement...' : generateReferralLink()}
                    className="bg-background/50 font-mono text-sm"
                  />
                  <Button 
                    onClick={handleCopyLink}
                    variant="secondary"
                    className="shrink-0"
                    disabled={loading || !referralCode}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCopyLink}
                    className="flex-1"
                    disabled={loading || !referralCode}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier le lien
                  </Button>
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1"
                    disabled={loading || !referralCode}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle>Comment ça marche ?</CardTitle>
                <CardDescription>
                  3 étapes simples pour gagner des crédits gratuits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {steps.map((step, index) => (
                    <div key={index} className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center shadow-lg">
                        <step.icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conditions */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Conditions d'obtention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    La personne parrainée doit s'inscrire avec ton lien d'affiliation
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Elle doit publier au moins un site web sur Creali
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Elle doit souscrire à l'abonnement Pro (25€/mois minimum)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Coins className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground font-medium">
                    Tu reçois automatiquement 10 crédits dès que toutes les conditions sont remplies !
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Referrals History */}
            {referrals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Historique des parrainages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referrals.filter(r => r.referred_email).map((referral) => (
                      <div 
                        key={referral.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            referral.status === 'rewarded' 
                              ? 'bg-green-500/20' 
                              : 'bg-secondary'
                          }`}>
                            {referral.status === 'rewarded' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Clock className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {referral.referred_email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {referral.status === 'rewarded' && '✓ Validé'}
                              {referral.status === 'qualified' && '⏳ Qualifié'}
                              {referral.status === 'signed_up' && '📝 Inscrit'}
                              {referral.status === 'pending' && '⏳ En attente'}
                              {!referral.has_published_site && referral.status !== 'pending' && ' • Site non publié'}
                              {!referral.has_pro_subscription && referral.status !== 'pending' && ' • Pas encore Pro'}
                            </p>
                          </div>
                        </div>
                        {referral.credits_awarded > 0 && (
                          <div className="flex items-center gap-1 text-green-500 font-semibold">
                            <Coins className="w-4 h-4" />
                            +{referral.credits_awarded}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Referral;
