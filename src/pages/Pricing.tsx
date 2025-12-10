import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, ArrowLeft, Zap, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreditTier {
  credits: number;
  dailyCredits: number;
  price: number;
  planId: string;
  label: string;
}

const creditTiers: CreditTier[] = [
  { credits: 100, dailyCredits: 5, price: 25, planId: 'pro', label: '100 crédits/mois' },
  { credits: 200, dailyCredits: 10, price: 50, planId: 'pro_plus', label: '200 crédits/mois' },
  { credits: 400, dailyCredits: 20, price: 100, planId: 'pro_max', label: '400 crédits/mois' },
  { credits: 800, dailyCredits: 40, price: 200, planId: 'pro_ultra', label: '800 crédits/mois' },
  { credits: 10000, dailyCredits: 200, price: 2250, planId: 'pro_extreme', label: '10 000 crédits/mois' },
];

const Pricing = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { credits, planLimits } = useCredits();
  
  const currentPlan = subscription?.plan || 'free';
  const [selectedTier, setSelectedTier] = useState<CreditTier>(
    creditTiers.find(t => t.planId === currentPlan) || creditTiers[0]
  );

  const isCurrentPlan = (planId: string) => currentPlan === planId;
  const isPaidPlan = currentPlan !== 'free';

  const handleTierChange = (value: string) => {
    const tier = creditTiers.find(t => t.planId === value);
    if (tier) setSelectedTier(tier);
  };

  const proFeatures = [
    'Domaine personnalisé',
    'Sans badge Creali',
    'Vision AI + upload images',
    'Rollback version',
    'Support prioritaire',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={user ? "/projects" : "/"} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Creali</span>
            </Link>
          </div>

          {user && isPaidPlan && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">
                {planLimits?.name || 'Pro'}
              </Badge>
              <span className="text-muted-foreground">
                {credits} crédits restants
              </span>
            </div>
          )}

          {!user && (
            <Link to="/auth">
              <Button variant="outline">Se connecter</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 gap-2">
              <Sparkles className="w-3 h-3" />
              Tarification basée sur les crédits
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choisissez votre plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Chaque génération IA consomme 1-4 crédits selon la complexité.
            </p>
          </div>

          {/* Plans Grid - 2 columns */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            
            {/* FREE Plan */}
            <div className={`relative rounded-2xl p-6 border ${
              isCurrentPlan('free') 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card'
            }`}>
              {isCurrentPlan('free') && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Plan actuel
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-1">Free</h3>
                <p className="text-sm text-muted-foreground">Pour découvrir Creali</p>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground">/mois</span>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">5 crédits</span>
                  <span className="text-sm text-muted-foreground">au total</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pas de recharge • 1 projet max
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Sous-domaine creali.site</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Génération IA basique</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-4 h-4 flex items-center justify-center">×</span>
                  <span>Domaine personnalisé</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-4 h-4 flex items-center justify-center">×</span>
                  <span>Badge Creali obligatoire</span>
                </li>
              </ul>

              {isCurrentPlan('free') ? (
                <Button variant="outline" className="w-full" disabled>
                  Plan actuel
                </Button>
              ) : (
                <Button variant="outline" className="w-full">
                  Rétrograder
                </Button>
              )}
            </div>

            {/* PRO Plan with tier selector */}
            <div className={`relative rounded-2xl p-6 border-2 ${
              isPaidPlan 
                ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5' 
                : 'border-primary bg-gradient-to-br from-primary/10 to-primary/5'
            }`}>
              {isPaidPlan && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Plan actuel
                </Badge>
              )}
              {!isPaidPlan && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Recommandé
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-1">Pro</h3>
                <p className="text-sm text-muted-foreground">Pour les créateurs sérieux</p>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold">${selectedTier.price}</span>
                <span className="text-muted-foreground">/mois</span>
              </div>

              {/* Credit Tier Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Choisir le nombre de crédits</label>
                <Select 
                  value={selectedTier.planId} 
                  onValueChange={handleTierChange}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {creditTiers.map((tier) => (
                      <SelectItem 
                        key={tier.planId} 
                        value={tier.planId}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{tier.label}</span>
                          <span className="text-muted-foreground">${tier.price}/mois</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected tier details */}
              <div className="p-4 rounded-xl bg-background/50 border border-border/50 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{selectedTier.credits} crédits/mois</span>
                  <Badge variant="secondary" className="text-xs">
                    +{selectedTier.dailyCredits}/jour
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pool max: {selectedTier.credits * 1.5} crédits • Projets: {
                    selectedTier.planId === 'pro' ? '10' :
                    selectedTier.planId === 'pro_plus' ? '20' :
                    selectedTier.planId === 'pro_max' ? '50' :
                    selectedTier.planId === 'pro_ultra' ? '200' : 'Illimités'
                  }
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
                {selectedTier.planId === 'pro_extreme' && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Support dédié</span>
                  </li>
                )}
              </ul>

              {isCurrentPlan(selectedTier.planId) ? (
                <Button className="w-full" disabled>
                  Plan actuel
                </Button>
              ) : isPaidPlan ? (
                <Button className="w-full">
                  {creditTiers.findIndex(t => t.planId === currentPlan) < creditTiers.findIndex(t => t.planId === selectedTier.planId)
                    ? 'Passer à ce plan'
                    : 'Rétrograder'
                  }
                </Button>
              ) : (
                <Button className="w-full gap-2">
                  <Zap className="w-4 h-4" />
                  Passer à Pro
                </Button>
              )}
            </div>
          </div>

          {/* Credit Calculation Info */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Comment fonctionnent les crédits ?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-3">Consommation par tokens</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chaque génération IA consomme des crédits selon la complexité :
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Modification simple</span>
                    <span className="font-mono text-primary">1 crédit</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Ajout de section</span>
                    <span className="font-mono text-primary">2 crédits</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Génération complexe</span>
                    <span className="font-mono text-primary">3 crédits</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Site complet</span>
                    <span className="font-mono text-primary">4 crédits</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-3">Recharge quotidienne</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Les plans Pro rechargent automatiquement chaque jour :
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>100 crédits/mois</span>
                    <span className="font-mono text-green-500">+5/jour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>200 crédits/mois</span>
                    <span className="font-mono text-green-500">+10/jour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>400 crédits/mois</span>
                    <span className="font-mono text-green-500">+20/jour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>800 crédits/mois</span>
                    <span className="font-mono text-green-500">+40/jour</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Questions fréquentes
            </h2>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-2">
                  Que se passe-t-il si j'annule mon abonnement ?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vos domaines personnalisés seront automatiquement désactivés et vos sites reviendront 
                  sur des sous-domaines creali.site. Vos crédits restants seront plafonnés à 5 (limite Free).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-2">
                  Les crédits non utilisés sont-ils reportés ?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Vos crédits s'accumulent jusqu'à la limite de votre pool (ex: 150 pour 100 crédits/mois). 
                  Au-delà, les crédits quotidiens ne sont pas ajoutés.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-2">
                  Puis-je changer de niveau à tout moment ?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Oui ! Vous pouvez augmenter ou diminuer votre niveau de crédits à tout moment. 
                  Le changement prend effet immédiatement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
