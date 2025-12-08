import { Database, TrendingUp, Shield, Gauge, Globe, Users } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section id="fonctionnalites" className="section-padding bg-background">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Tout ce dont tu as besoin
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-primary mb-6 tracking-tight">
            Intégré.
          </h3>
          <p className="text-lg text-muted-foreground">
            Arrête de jongler entre les outils. Creali te donne une infrastructure complète : 
            hébergement, base de données, intégrations et plus.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large Card - Left */}
          <div className="md:col-span-1 md:row-span-2 card-bento p-6 flex flex-col">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Bases de données illimitées
            </h4>
            <p className="text-sm text-muted-foreground mb-6">
              Stocke et gère tes données sans limites.
            </p>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full h-48">
                {/* Infinity symbol illustration */}
                <svg viewBox="0 0 200 100" className="w-full h-full text-primary">
                  <path
                    d="M50 50 C50 25, 75 25, 100 50 C125 75, 150 75, 150 50 C150 25, 125 25, 100 50 C75 75, 50 75, 50 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Top Middle Card */}
          <div className="card-bento p-6">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Performance pro
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Infrastructure scalable qui grandit avec toi.
            </p>
            <div className="h-24 flex items-end justify-center">
              <TrendingUp className="w-20 h-20 text-primary opacity-60" />
            </div>
          </div>

          {/* Top Right Card - Spans 2 rows */}
          <div className="md:row-span-2 card-bento p-6 flex flex-col">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Authentification & utilisateurs
            </h4>
            <p className="text-sm text-muted-foreground mb-6">
              Gestion complète des comptes, connexions et permissions.
            </p>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                <Shield className="w-24 h-24 text-primary opacity-60" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary/20 rounded-full blur-xl" />
              </div>
            </div>
          </div>

          {/* Bottom Left Card */}
          <div className="card-bento p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">100</span>
              </div>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              SEO optimisé
            </h4>
            <p className="text-xs text-muted-foreground">
              Ton projet est référencé dès le premier jour.
            </p>
          </div>

          {/* Bottom Middle Card */}
          <div className="card-bento p-6">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Hébergement & domaines custom
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Publie en un clic avec analytics intégrés.
            </p>
            <div className="flex justify-center">
              <div className="px-4 py-2 bg-primary rounded-lg text-primary-foreground text-sm font-medium transform -rotate-12">
                Publier
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
