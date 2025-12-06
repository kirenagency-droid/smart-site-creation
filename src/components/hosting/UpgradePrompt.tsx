import { Link } from 'react-router-dom';
import { X, Crown, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UpgradePromptProps {
  feature: string;
  onClose: () => void;
}

export const UpgradePrompt = ({ feature, onClose }: UpgradePromptProps) => {
  const proFeatures = [
    'Domaines personnalisés illimités',
    'Certificat SSL automatique',
    'Tokens illimités',
    'Support prioritaire',
    'Génération prioritaire',
    'Suppression du badge PenFlow'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 border-primary/20 bg-gradient-to-b from-primary/5 to-background">
        <CardHeader className="text-center pb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute right-2 top-2"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          
          <CardTitle className="text-xl">
            Passez à Pro
          </CardTitle>
          <CardDescription className="text-base">
            La fonctionnalité <span className="font-semibold text-foreground">{feature}</span> est réservée aux membres Pro
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="space-y-3">
            {proFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-1 rounded-full bg-primary/10">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">19€</span>
              <span className="text-muted-foreground">/mois</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Annulez à tout moment
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link to="/pricing" className="block">
              <Button className="w-full gap-2" size="lg">
                <Sparkles className="w-4 h-4" />
                Passer à Pro
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={onClose}
            >
              Pas maintenant
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-xs text-center text-muted-foreground">
            🔒 Paiement sécurisé • Annulation en 1 clic • Garantie satisfait ou remboursé
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
