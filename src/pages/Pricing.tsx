import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowLeft } from 'lucide-react';

const plans = [
  {
    name: "Free",
    price: "0€",
    description: "Pour découvrir Penflow.ai",
    features: [
      "1000 tokens offerts",
      "Génération de sites illimitée",
      "Téléchargement HTML",
      "Support communautaire",
    ],
    cta: "Commencer gratuitement",
    popular: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "19€",
    period: "/mois",
    description: "Pour les créateurs sérieux",
    features: [
      "Tokens illimités",
      "Génération prioritaire",
      "Templates premium",
      "Export code source complet",
      "Support prioritaire",
      "Hébergement inclus",
    ],
    cta: "Passer au Pro",
    popular: true,
    badge: "Plus populaire",
  },
  {
    name: "Agency",
    price: "49€",
    period: "/mois",
    description: "Pour les équipes et agences",
    features: [
      "Tout du plan Pro",
      "5 membres d'équipe",
      "Projets illimités",
      "Marque blanche",
      "API access",
      "Support dédié",
    ],
    cta: "Contacter les ventes",
    popular: false,
    badge: null,
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
              <span className="text-xl font-bold text-foreground">Penflow.ai</span>
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
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Tarifs simples
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Choisissez votre plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Commencez gratuitement avec 1000 tokens, puis passez au Pro pour des générations illimitées
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary'
                    : 'bg-card border border-border'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {plan.badge}
                  </span>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.popular ? 'btn-primary' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link to={plan.name === 'Free' ? '/auth' : '#'}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Questions fréquentes
            </h2>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">
                  Comment fonctionnent les tokens ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Chaque génération ou modification de site consomme 5 tokens. Avec le plan gratuit, 
                  vous recevez 1000 tokens à l'inscription, soit environ 200 générations.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">
                  Puis-je télécharger mon site ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Oui ! Tous les plans permettent de télécharger le code HTML de votre site. 
                  Le plan Pro inclut en plus l'hébergement et le code source complet.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">
                  Puis-je annuler mon abonnement ?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Oui, vous pouvez annuler à tout moment. Votre abonnement reste actif 
                  jusqu'à la fin de la période de facturation en cours.
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
