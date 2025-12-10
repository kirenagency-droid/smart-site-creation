import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      console.log('Checkout session completed:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Paiement réussi !
        </h1>

        <p className="text-muted-foreground mb-8">
          Merci pour votre abonnement. Vos crédits ont été ajoutés à votre compte 
          et vous pouvez maintenant profiter de toutes les fonctionnalités Pro.
        </p>

        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold">Votre abonnement est actif</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Les crédits se rechargent automatiquement chaque jour.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/projects">
            <Button className="w-full gap-2">
              Accéder à mes projets
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" className="w-full">
              Gérer mon abonnement
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
