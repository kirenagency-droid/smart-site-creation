import { Zap, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';

export const CreditsDashboard = () => {
  const { credits, planLimits, loading } = useCredits();

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const maxPool = planLimits?.max_credit_pool || 5;
  const dailyCredits = planLimits?.daily_credits || 0;
  const percentUsed = Math.min((credits / maxPool) * 100, 100);
  const isLowCredits = credits <= 2;
  const isOutOfCredits = credits === 0;
  const isFree = planLimits?.plan === 'free';

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Crédits
          </CardTitle>
          <Badge variant={isLowCredits ? 'destructive' : 'secondary'} className="text-xs">
            {planLimits?.name || 'Free'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Credits Display */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-foreground">{credits}</span>
            <span className="text-sm text-muted-foreground">/ {maxPool} max</span>
          </div>
          <Progress 
            value={percentUsed} 
            className={`h-2 ${isLowCredits ? '[&>div]:bg-destructive' : ''}`} 
          />
        </div>

        {/* Daily Refill Info */}
        {!isFree && dailyCredits > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>+{dailyCredits} crédits/jour</span>
          </div>
        )}

        {/* Next Refill */}
        {!isFree && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Prochaine recharge: demain à minuit</span>
          </div>
        )}

        {/* Low Credits Warning */}
        {isLowCredits && !isOutOfCredits && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Crédits faibles</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Il vous reste peu de crédits. Passez à un plan supérieur pour continuer à créer.
            </p>
          </div>
        )}

        {/* Out of Credits Warning */}
        {isOutOfCredits && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Plus de crédits</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Vous n'avez plus de crédits. Passez à Pro pour continuer à utiliser l'IA.
            </p>
          </div>
        )}

        {/* Upgrade CTA for Free users */}
        {isFree && (
          <Link to="/pricing">
            <Button className="w-full gap-2" size="sm">
              <Zap className="w-4 h-4" />
              Passer à Pro
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

// Compact widget version for sidebar/header
export const CreditsWidget = () => {
  const { credits, planLimits, loading } = useCredits();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
        <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxPool = planLimits?.max_credit_pool || 5;
  const isLowCredits = credits <= 2;
  const isFree = planLimits?.plan === 'free';

  return (
    <Link 
      to="/settings" 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
        isLowCredits 
          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' 
          : 'bg-secondary hover:bg-secondary/80'
      }`}
    >
      <Zap className={`w-4 h-4 ${isLowCredits ? 'text-destructive' : 'text-primary'}`} />
      <span className="text-sm font-medium">{credits}</span>
      <span className="text-xs text-muted-foreground">/ {maxPool}</span>
      {isFree && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          FREE
        </Badge>
      )}
    </Link>
  );
};
