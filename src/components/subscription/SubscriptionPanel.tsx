import { Link } from 'react-router-dom';
import { Crown, Check, AlertCircle, CreditCard, Calendar, ArrowUpRight, Zap, Rocket, Star, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import { useCredits } from '@/hooks/useCredits';

const planDetails: Record<SubscriptionPlan, { name: string; icon: any; color: string; price: number }> = {
  free: { name: 'Free', icon: Zap, color: 'text-muted-foreground', price: 0 },
  pro: { name: 'Pro', icon: Zap, color: 'text-primary', price: 25 },
  pro_plus: { name: 'Pro+', icon: Rocket, color: 'text-blue-500', price: 50 },
  pro_max: { name: 'Pro Max', icon: Crown, color: 'text-purple-500', price: 100 },
  pro_ultra: { name: 'Pro Ultra', icon: Star, color: 'text-yellow-500', price: 200 },
  pro_extreme: { name: 'Pro Extreme', icon: Building2, color: 'text-red-500', price: 2250 },
};

export const SubscriptionPanel = () => {
  const { subscription, loading: subLoading, canUseCustomDomain } = useSubscription();
  const { credits, planLimits, loading: creditsLoading } = useCredits();

  const loading = subLoading || creditsLoading;

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const plan = subscription?.plan || 'free';
  const details = planDetails[plan];
  const Icon = details.icon;

  const maxPool = planLimits?.max_credit_pool || 5;
  const dailyCredits = planLimits?.daily_credits || 0;
  const percentUsed = Math.min((credits / maxPool) * 100, 100);
  const isFree = plan === 'free';

  const getStatusDisplay = () => {
    switch (subscription?.status) {
      case 'active':
        return { label: 'Actif', variant: 'default' as const };
      case 'past_due':
        return { label: 'Paiement en retard', variant: 'destructive' as const };
      case 'canceled':
        return { label: 'Annulé', variant: 'secondary' as const };
      case 'expired':
        return { label: 'Expiré', variant: 'outline' as const };
      default:
        return { label: 'Actif', variant: 'default' as const };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Abonnement</CardTitle>
          </div>
          <Badge variant={isFree ? 'outline' : 'default'} className="gap-1">
            <Icon className="w-3 h-3" />
            {details.name}
          </Badge>
        </div>
        <CardDescription>
          Gérez votre abonnement et vos crédits
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Plan & Status */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Plan actuel</span>
            <Badge variant={statusDisplay.variant}>{statusDisplay.label}</Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${details.color}`}>
              ${details.price}
            </span>
            <span className="text-muted-foreground">/mois</span>
          </div>

          {subscription?.currentPeriodEnd && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Prochain renouvellement: {subscription.currentPeriodEnd.toLocaleDateString('fr-FR')}
            </div>
          )}

          {subscription?.cancelAtPeriodEnd && (
            <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Votre abonnement sera annulé à la fin de la période
              </p>
            </div>
          )}
        </div>

        {/* Credits Section */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Crédits restants</span>
            <span className="text-sm text-muted-foreground">{credits} / {maxPool}</span>
          </div>
          <Progress value={percentUsed} className="h-2 mb-3" />
          
          <div className="space-y-1 text-xs text-muted-foreground">
            {!isFree && dailyCredits > 0 && (
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>+{dailyCredits} crédits/jour</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Check className="w-3 h-3 text-green-500" />
              <span>Pool maximum: {maxPool} crédits</span>
            </div>
            {canUseCustomDomain && (
              <div className="flex items-center gap-2">
                <Check className="w-3 h-3 text-green-500" />
                <span>Domaine personnalisé inclus</span>
              </div>
            )}
          </div>
        </div>

        {/* Plan Features */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Check className={`w-4 h-4 ${canUseCustomDomain ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span className={!canUseCustomDomain ? 'text-muted-foreground' : ''}>Domaine perso</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className={`w-4 h-4 ${planLimits?.badge_removable ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span className={!planLimits?.badge_removable ? 'text-muted-foreground' : ''}>Sans badge</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>{planLimits?.max_projects === -1 ? '∞' : planLimits?.max_projects} projets</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className={`w-4 h-4 ${(planLimits?.priority_level || 0) > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span className={(planLimits?.priority_level || 0) === 0 ? 'text-muted-foreground' : ''}>
              Priorité {['Standard', 'Normale', 'Améliorée', 'Haute', 'Max', 'Ultra'][planLimits?.priority_level || 0]}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isFree ? (
            <Link to="/pricing" className="flex-1">
              <Button className="w-full gap-2">
                <Crown className="w-4 h-4" />
                Passer à Pro
              </Button>
            </Link>
          ) : (
            <>
              <Button variant="outline" className="flex-1">
                Gérer l'abonnement
              </Button>
              <Link to="/pricing" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Changer de plan
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Billing History */}
        <div className="pt-4 border-t border-border/50">
          <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
            <span>Historique de facturation</span>
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Warnings */}
        {subscription?.status === 'past_due' && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Paiement en retard</p>
                <p className="text-sm text-destructive/80 mt-1">
                  Mettez à jour vos informations de paiement pour éviter l'interruption du service.
                </p>
                <Button variant="destructive" size="sm" className="mt-3">
                  Mettre à jour le paiement
                </Button>
              </div>
            </div>
          </div>
        )}

        {subscription?.status === 'expired' && (
          <div className="p-4 rounded-xl bg-muted border border-border">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Abonnement expiré</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre abonnement a expiré. Vos domaines personnalisés ont été désactivés.
                </p>
                <Link to="/pricing">
                  <Button size="sm" className="mt-3">
                    Réactiver
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
