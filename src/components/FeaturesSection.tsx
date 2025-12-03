import { Zap, Layout, FileText, Image, Cloud, Download, FolderKanban, Edit3 } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Génération IA en 10s",
    description: "Notre IA crée un site complet en quelques secondes seulement.",
  },
  {
    icon: Layout,
    title: "Templates premium",
    description: "Des designs professionnels pour chaque type de business.",
  },
  {
    icon: FileText,
    title: "Textes IA",
    description: "Contenus optimisés SEO générés automatiquement.",
  },
  {
    icon: Image,
    title: "Images IA",
    description: "Visuels uniques créés spécialement pour ton site.",
  },
  {
    icon: Cloud,
    title: "Hébergement automatique",
    description: "Ton site est hébergé et sécurisé sans configuration.",
  },
  {
    icon: Download,
    title: "Export HTML",
    description: "Télécharge ton site pour l'héberger où tu veux.",
  },
  {
    icon: FolderKanban,
    title: "Dashboard projets",
    description: "Gère tous tes sites depuis une interface intuitive.",
  },
  {
    icon: Edit3,
    title: "Page builder simple",
    description: "Modifie facilement chaque élément de ton site.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="fonctionnalites" className="section-padding bg-secondary/30">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            Fonctionnalités
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Tout ce dont tu as besoin
          </h2>
          <p className="text-lg text-muted-foreground">
            Des outils puissants pour créer des sites professionnels sans effort.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-soft transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-gradient-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
