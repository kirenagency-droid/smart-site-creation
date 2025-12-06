import { Link } from 'react-router-dom';
import { Crown, Check, AlertCircle, CreditCard, Calendar, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionPanel = () => {
  const { subscription, loading, isPro, isAgency } = useSubscription();

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const getPlanDisplay = () => {
    switch (subscription?.plan) {
      case 'pro':
        return { name: 'Pro', color: 'text-primary', badge: 'default' as const };
      case 'agency':
        return { name: 'Agency', color: 'text-purple-500', badge: 'secondary' as const };
      default:
        return { name: 'Free', color: 'text-muted-foreground', badge: 'outline' as const };
    }
  };

  const planDisplay = getPlanDisplay();

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
          <Badge variant={planDisplay.badge} className="gap-1">
            {(isPro || isAgency) && <Crown className="w-3 h-3" />}
            {planDisplay.name}
          </Badge>
        </div>
        <CardDescription>
          Gérez votre abonnement et accédez aux fonctionnalités premium
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Plan Info */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Plan actuel</span>
            <Badge variant={statusDisplay.variant}>{statusDisplay.label}</Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${planDisplay.color}`}>
              {subscription?.plan === 'free' ? '0€' : subscription?.plan === 'pro' ? '19€' : '49€'}
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
                Votre abonnement sera annulé à la fin de la période en cours
              </p>
            </div>
          )}
        </div>

        {/* Plan Features */}
        {subscription?.plan === 'free' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Projets illimités</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>1000 tokens offerts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Sous-domaine PenFlow gratuit</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>Domaines personnalisés (Pro requis)</span>
              </div>
            </div>

            <Link to="/pricing">
              <Button className="w-full gap-2">
                <Crown className="w-4 h-4" />
                Passer à Pro
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Tokens illimités</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Domaines personnalisés</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Certificat SSL automatique</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span>Support prioritaire</span>
              </div>
              {isAgency && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>5 membres d'équipe</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Marque blanche</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                Gérer l'abonnement
              </Button>
              {isPro && (
                <Link to="/pricing" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Passer à Agency
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Billing History Placeholder */}
        <div className="pt-4 border-t border-border/50">
          <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
            <span>Historique de facturation</span>
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Payment Status Warning */}
        {subscription?.status === 'past_due' && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Paiement en retard</p>
                <p className="text-sm text-destructive/80 mt-1">
                  Votre paiement n'a pas pu être traité. Mettez à jour vos informations de paiement pour éviter l'interruption du service.
                </p>
                <Button variant="destructive" size="sm" className="mt-3">
                  Mettre à jour le paiement
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Expired Warning */}
        {subscription?.status === 'expired' && (
          <div className="p-4 rounded-xl bg-muted border border-border">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Abonnement expiré</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre abonnement Pro a expiré. Vos domaines personnalisés ont été désactivés. Réactivez votre abonnement pour les restaurer.
                </p>
                <Link to="/pricing">
                  <Button size="sm" className="mt-3">
                    Réactiver Pro
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
