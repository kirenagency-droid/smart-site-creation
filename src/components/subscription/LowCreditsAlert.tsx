import { AlertTriangle, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface LowCreditsAlertProps {
  credits: number;
  maxCredits: number;
  planName: string;
  onDismiss?: () => void;
}

export const LowCreditsAlert = ({ credits, maxCredits, planName, onDismiss }: LowCreditsAlertProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || credits > 2) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const isOutOfCredits = credits === 0;
  const isFree = planName === 'Free';

  return (
    <div className={`relative p-4 rounded-xl border ${
      isOutOfCredits 
        ? 'bg-destructive/10 border-destructive/30' 
        : 'bg-yellow-500/10 border-yellow-500/30'
    }`}>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-background/50 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          isOutOfCredits ? 'bg-destructive/20' : 'bg-yellow-500/20'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${
            isOutOfCredits ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-400'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${
            isOutOfCredits ? 'text-destructive' : 'text-yellow-700 dark:text-yellow-300'
          }`}>
            {isOutOfCredits ? 'Plus de crédits' : 'Crédits faibles'}
          </h4>
          
          <p className="text-sm text-muted-foreground mt-1">
            {isOutOfCredits ? (
              isFree 
                ? "Vous avez utilisé tous vos crédits gratuits. Passez à Pro pour continuer à créer."
                : "Vos crédits seront rechargés demain. Passez à un plan supérieur pour plus de crédits quotidiens."
            ) : (
              `Il vous reste ${credits} crédit${credits > 1 ? 's' : ''}. ${
                isFree 
                  ? "Le plan Free ne recharge pas automatiquement." 
                  : "Votre prochaine recharge est demain."
              }`
            )}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Link to="/pricing">
              <Button size="sm" className="gap-2">
                <Zap className="w-3.5 h-3.5" />
                {isFree ? 'Passer à Pro' : 'Voir les plans'}
              </Button>
            </Link>
            
            {!isOutOfCredits && (
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Plus tard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast-style alert for inline use
export const CreditWarningToast = ({ credits }: { credits: number }) => {
  if (credits > 2) return null;

  const isOutOfCredits = credits === 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
      isOutOfCredits 
        ? 'bg-destructive/10 text-destructive' 
        : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
    }`}>
      <AlertTriangle className="w-4 h-4" />
      <span>
        {isOutOfCredits 
          ? 'Plus de crédits disponibles' 
          : `${credits} crédit${credits > 1 ? 's' : ''} restant${credits > 1 ? 's' : ''}`
        }
      </span>
      <Link 
        to="/pricing" 
        className="ml-auto font-medium hover:underline"
      >
        Upgrade
      </Link>
    </div>
  );
};
