import { User, Laptop, Lightbulb, Camera, Briefcase, Building } from "lucide-react";

const audiences = [
  {
    icon: User,
    title: "Coachs",
    description: "Développe ta présence en ligne et attire plus de clients.",
  },
  {
    icon: Laptop,
    title: "Freelancers",
    description: "Montre tes compétences avec un portfolio professionnel.",
  },
  {
    icon: Lightbulb,
    title: "Créateurs",
    description: "Lance ton business et vends tes créations en ligne.",
  },
  {
    icon: Camera,
    title: "Modèles",
    description: "Crée un book en ligne qui te démarque.",
  },
  {
    icon: Briefcase,
    title: "Business",
    description: "Digitalise ton entreprise avec un site professionnel.",
  },
  {
    icon: Building,
    title: "Agences",
    description: "Crée des sites pour tes clients en quelques clics.",
  },
];

const TargetAudienceSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            Pour qui ?
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Fait pour toi
          </h2>
          <p className="text-lg text-muted-foreground">
            Que tu sois entrepreneur solo ou à la tête d'une agence, SITEFORGE AI s'adapte à tes besoins.
          </p>
        </div>

        {/* Audience Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((audience, index) => (
            <div
              key={audience.title}
              className="group p-8 rounded-3xl bg-secondary/30 border border-transparent hover:border-primary/20 hover:bg-secondary/50 transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <audience.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {audience.title}
              </h3>
              <p className="text-muted-foreground">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
