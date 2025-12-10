import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';

const CheckoutCancel = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-3">
          Paiement annulé
        </h1>

        <p className="text-muted-foreground mb-8">
          Vous avez annulé le processus de paiement. Aucun montant n'a été débité de votre compte.
        </p>

        <div className="p-4 rounded-xl bg-muted/50 border border-border mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Besoin d'aide ?</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Si vous avez rencontré un problème ou avez des questions, 
            n'hésitez pas à nous contacter.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/pricing">
            <Button className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour aux tarifs
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="outline" className="w-full">
              Continuer avec le plan Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;
