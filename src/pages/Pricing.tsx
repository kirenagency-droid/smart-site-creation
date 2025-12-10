import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, ArrowLeft, Zap, Rocket, Crown, Building2, Star } from 'lucide-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Pour découvrir Creali',
    icon: Zap,
    features: [
      '5 crédits au total',
      '1 projet actif',
      'Sous-domaine creali.site',
      'Badge Creali obligatoire',
      'Support communautaire',
    ],
    limits: [
      'Pas de recharge quotidienne',
      'Pas de domaine personnalisé',
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    description: 'Pour les créateurs sérieux',
    icon: Zap,
    features: [
      '100 crédits/mois',
      '+5 crédits/jour',
      'Pool max: 150 crédits',
      '10 projets actifs',
      'Domaine personnalisé',
      'Sans badge Creali',
      'Vision AI + upload images',
      'Priorité normale',
    ],
    limits: [],
    cta: 'Passer à Pro',
    popular: true,
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    price: 50,
    description: 'Pour les power users',
    icon: Rocket,
    features: [
      '200 crédits/mois',
      '+10 crédits/jour',
      'Pool max: 300 crédits',
      '20 projets actifs',
      'Domaine personnalisé',
      'Sans badge Creali',
      'Priorité améliorée',
      'Rollback version illimité',
    ],
    limits: [],
    cta: 'Passer à Pro+',
    popular: false,
  },
  {
    id: 'pro_max',
    name: 'Pro Max',
    price: 100,
    description: 'Pour les professionnels',
    icon: Crown,
    features: [
      '400 crédits/mois',
      '+20 crédits/jour',
      'Pool max: 600 crédits',
      '50 projets actifs',
      'Priorité haute IA',
      'Générations accélérées',
      'Historique complet',
    ],
    limits: [],
    cta: 'Passer à Pro Max',
    popular: false,
  },
  {
    id: 'pro_ultra',
    name: 'Pro Ultra',
    price: 200,
    description: 'Pour les créateurs intensifs',
    icon: Star,
    features: [
      '800 crédits/mois',
      '+40 crédits/jour',
      'Pool max: 1000 crédits',
      '200 projets actifs',
      'Domaines illimités',
      'Priorité maximale',
      'IA mode intelligent++',
    ],
    limits: [],
    cta: 'Passer à Pro Ultra',
    popular: false,
  },
  {
    id: 'pro_extreme',
    name: 'Pro Extreme',
    price: 2250,
    description: 'Pour agences et créateurs de masse',
    icon: Building2,
    features: [
      '10 000 crédits/mois',
      '+200 crédits/jour',
      'Pool max: 15 000 crédits',
      'Projets illimités',
      'Domaines illimités',
      'IA haute fréquence',
      'Rebuild site en 1 requête',
      'Support dédié',
    ],
    limits: [],
    cta: 'Contacter les ventes',
    popular: false,
  },
];

const Pricing = () => {
  const { user } = useAuth();

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

          {!user && (
            <Link to="/auth">
              <Button variant="outline">Se connecter</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 gap-2">
              <Sparkles className="w-3 h-3" />
              Tarification basée sur les crédits
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choisissez votre plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Payez selon votre usage. Chaque génération IA consomme 1-4 crédits selon la complexité.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {plans.slice(0, 3).map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 ${
                    plan.popular
                      ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary'
                      : 'bg-card border border-border'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Plus populaire
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${plan.popular ? 'bg-primary/20' : 'bg-secondary'}`}>
                      <Icon className={`w-5 h-5 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.limits.map((limit) => (
                      <li key={limit} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-4 h-4 flex items-center justify-center shrink-0">×</span>
                        <span>{limit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={plan.id === 'free' ? '/auth' : '#'}>
                      {plan.cta}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Higher tier plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.slice(3).map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className="rounded-2xl p-6 bg-card border border-border"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-secondary">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 5).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-sm text-muted-foreground">
                        +{plan.features.length - 5} autres avantages
                      </li>
                    )}
                  </ul>

                  <Button className="w-full" variant="outline">
                    {plan.cta}
                  </Button>
                </div>
              );
            })}
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
                  Chaque génération IA consomme des crédits selon la complexité de la demande :
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
                  Les plans payants rechargent automatiquement vos crédits chaque jour :
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Plan Pro</span>
                    <span className="font-mono text-green-500">+5/jour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Plan Pro+</span>
                    <span className="font-mono text-green-500">+10/jour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Plan Pro Max</span>
                    <span className="font-mono text-green-500">+20/jour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Plan Pro Ultra</span>
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
                  Vos crédits s'accumulent jusqu'à la limite de votre pool (ex: 150 pour Pro). 
                  Au-delà de cette limite, les crédits quotidiens ne sont pas ajoutés.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold mb-2">
                  Puis-je changer de plan à tout moment ?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Oui ! Vous pouvez passer à un plan supérieur immédiatement. Le changement vers un plan 
                  inférieur prend effet à la fin de votre période de facturation actuelle.
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
