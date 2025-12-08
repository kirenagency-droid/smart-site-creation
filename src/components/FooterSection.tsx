import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="bg-background border-t border-border">
      {/* CTA Section */}
      <div className="section-padding">
        <div className="container-narrow">
          <div className="relative rounded-2xl bg-secondary border border-border p-10 md:p-16 text-center overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                Prêt à créer ton site ?
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Rejoins des milliers d'entrepreneurs qui ont déjà créé leur site avec Creali.
              </p>
              <Link to="/auth" className="btn-primary group inline-flex">
                Créer mon site maintenant
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="py-8 border-t border-border">
        <div className="container-narrow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Creali</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <a href="#fonctionnalites" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                Fonctionnalités
              </a>
              <a href="#templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                Templates
              </a>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                Tarifs
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Creali. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
