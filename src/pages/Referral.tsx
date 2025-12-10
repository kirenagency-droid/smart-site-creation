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
  Sparkles,
  Trophy,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      number: "01",
      title: "Partage ton lien",
      description: "Envoie ton lien unique à tes amis ou partage-le sur les réseaux sociaux."
    },
    {
      icon: Globe,
      number: "02",
      title: "Ils créent un site",
      description: "Ton ami s'inscrit et publie son premier site web avec Creali."
    },
    {
      icon: CreditCard,
      number: "03",
      title: "Ils passent Pro",
      description: "Quand ils souscrivent au Pro (25€/mois), tu gagnes 10 crédits !"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
            
            <div className="relative max-w-5xl mx-auto px-6 pt-12 pb-16">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(-1)}
                className="mb-8 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>

              {/* Hero Content */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <Gift className="w-4 h-4" />
                  Programme de Parrainage
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                  Gagne <span className="text-primary">10 crédits</span>
                  <br />
                  par ami invité
                </h1>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Invite tes amis à découvrir Creali. Quand ils passent Pro, tu reçois 
                  automatiquement 10 crédits gratuits.
                </p>

                {/* Stats */}
                <div className="flex items-center justify-center gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{totalCreditsEarned}</div>
                    <div className="text-sm text-muted-foreground">Crédits gagnés</div>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{qualifiedReferrals}</div>
                    <div className="text-sm text-muted-foreground">Parrainages validés</div>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{pendingReferrals}</div>
                    <div className="text-sm text-muted-foreground">En attente</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 pb-16 space-y-12">
            {/* Referral Link Card */}
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <CardContent className="relative p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Ton lien d'affiliation</h2>
                    <p className="text-muted-foreground">Partage ce lien unique pour inviter tes amis</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Input 
                      readOnly 
                      value={loading ? 'Chargement...' : generateReferralLink()}
                      className="bg-background/80 font-mono text-sm h-12 pr-12"
                    />
                    <Button 
                      onClick={handleCopyLink}
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                      disabled={loading || !referralCode}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-none h-12 px-6"
                      disabled={loading || !referralCode}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button 
                      onClick={handleShare}
                      variant="outline"
                      className="flex-1 sm:flex-none h-12 px-6"
                      disabled={loading || !referralCode}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Partager
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How it Works */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Comment ça marche ?</h2>
                <p className="text-muted-foreground">3 étapes simples pour gagner des crédits</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className="relative group"
                  >
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-12 left-full w-full h-px">
                        <div className="absolute inset-0 bg-gradient-to-r from-border via-border/50 to-transparent" />
                        <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      </div>
                    )}
                    <Card className="h-full bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="relative inline-block">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                            <step.icon className="w-7 h-7 text-primary" />
                          </div>
                          <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                            {step.number.slice(-1)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg mb-2">{step.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards Banner */}
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Trophy className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      Pas de limite de gains !
                    </h3>
                    <p className="text-muted-foreground">
                      Invite autant d'amis que tu veux. Plus tu parraines, plus tu gagnes de crédits gratuits.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    <Zap className="w-6 h-6" />
                    +10 crédits
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conditions */}
            <Card className="bg-muted/20 border-border/50">
              <CardContent className="p-6 md:p-8">
                <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Conditions d'obtention des crédits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Inscription via ton lien d'affiliation
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Publication d'au moins un site web
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Souscription au Pro (25€/mois min.)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referrals History */}
            {referrals.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Historique des parrainages
                </h3>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {referrals.filter(r => r.referred_email).map((referral) => (
                        <div 
                          key={referral.id}
                          className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              referral.status === 'rewarded' 
                                ? 'bg-green-500/20' 
                                : 'bg-muted'
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
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className={`px-2 py-0.5 rounded-full ${
                                  referral.status === 'rewarded' 
                                    ? 'bg-green-500/10 text-green-600' 
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {referral.status === 'rewarded' && 'Validé'}
                                  {referral.status === 'qualified' && 'Qualifié'}
                                  {referral.status === 'signed_up' && 'Inscrit'}
                                  {referral.status === 'pending' && 'En attente'}
                                </span>
                                {!referral.has_published_site && referral.status !== 'pending' && (
                                  <span>• Site non publié</span>
                                )}
                                {!referral.has_pro_subscription && referral.status !== 'pending' && (
                                  <span>• Pas Pro</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {referral.credits_awarded > 0 && (
                            <div className="flex items-center gap-1.5 text-green-600 font-semibold bg-green-500/10 px-3 py-1.5 rounded-full">
                              <Coins className="w-4 h-4" />
                              +{referral.credits_awarded}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Referral;
