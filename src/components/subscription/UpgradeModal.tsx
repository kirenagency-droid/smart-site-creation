import { X, Crown, Check, Sparkles, Zap, Globe, Rocket, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface UpgradeModalProps {
  feature?: string;
  reason?: 'no_credits' | 'pro_feature' | 'project_limit' | 'general';
  onClose: () => void;
}

const plans = [
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    icon: Zap,
    popular: true,
    features: [
      '100 crédits/mois',
      '+5 crédits/jour',
      '10 projets actifs',
      'Domaine personnalisé',
      'Sans badge Creali',
    ]
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    price: 50,
    icon: Rocket,
    popular: false,
    features: [
      '200 crédits/mois',
      '+10 crédits/jour',
      '20 projets actifs',
      'Priorité améliorée',
      'Rollback illimité',
    ]
  },
  {
    id: 'pro_max',
    name: 'Pro Max',
    price: 100,
    icon: Crown,
    popular: false,
    features: [
      '400 crédits/mois',
      '+20 crédits/jour',
      '50 projets actifs',
      'IA accélérée',
      'Historique complet',
    ]
  }
];

export const UpgradeModal = ({ feature, reason = 'general', onClose }: UpgradeModalProps) => {
  const getTitle = () => {
    switch (reason) {
      case 'no_credits':
        return 'Plus de crédits';
      case 'pro_feature':
        return 'Fonctionnalité Pro';
      case 'project_limit':
        return 'Limite de projets atteinte';
      default:
        return 'Passez à Pro';
    }
  };

  const getDescription = () => {
    switch (reason) {
      case 'no_credits':
        return "Vous n'avez plus de crédits. Passez à un plan supérieur pour continuer à créer.";
      case 'pro_feature':
        return feature 
          ? `La fonctionnalité "${feature}" est réservée aux membres Pro.`
          : 'Cette fonctionnalité est réservée aux membres Pro.';
      case 'project_limit':
        return 'Vous avez atteint la limite de projets de votre plan actuel.';
      default:
        return 'Débloquez toutes les fonctionnalités et créez sans limites.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl border-primary/20 bg-gradient-to-b from-primary/5 to-background max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center pb-2 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          
          <CardTitle className="text-2xl">
            {getTitle()}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {getDescription()}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div 
                  key={plan.id}
                  className={`relative rounded-2xl p-5 border ${
                    plan.popular 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-card/50'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                      Populaire
                    </Badge>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${plan.popular ? 'bg-primary/20' : 'bg-secondary'}`}>
                      <Icon className={`w-4 h-4 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <h3 className="font-semibold">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">/mois</span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="sm"
                  >
                    Choisir {plan.name}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Higher Plans Link */}
          <div className="text-center">
            <Link 
              to="/pricing" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Voir tous les plans (Pro Ultra, Pro Extreme) →
            </Link>
          </div>

          {/* Close Button */}
          <div className="flex justify-center">
            <Button variant="ghost" onClick={onClose}>
              Pas maintenant
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-xs text-center text-muted-foreground">
            🔒 Paiement sécurisé • Annulation en 1 clic • Garantie 30 jours
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
