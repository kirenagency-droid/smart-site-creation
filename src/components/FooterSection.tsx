import { Sparkles, ArrowRight } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="bg-gradient-hero">
      {/* CTA Section */}
      <div className="section-padding border-b border-white/10">
        <div className="container-narrow">
          <div className="relative rounded-3xl glass p-10 md:p-16 text-center overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-glow opacity-50" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Prêt à créer ton site ?
              </h2>
              <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
                Rejoins des milliers d'entrepreneurs qui ont déjà créé leur site avec SITEFORGE AI.
              </p>
              <a href="#tarifs" className="btn-primary group inline-flex">
                Créer mon site maintenant
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="py-12">
        <div className="container-narrow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-white">SITEFORGE AI</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <a href="#fonctionnalites" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                Fonctionnalités
              </a>
              <a href="#templates" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                Templates
              </a>
              <a href="#tarifs" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                Tarifs
              </a>
              <a href="/mentions-legales" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                Mentions légales
              </a>
              <a href="/confidentialite" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                Confidentialité
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} SITEFORGE AI. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
