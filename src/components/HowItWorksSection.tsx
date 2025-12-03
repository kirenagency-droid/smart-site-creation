import { MessageSquare, Wand2, Rocket } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Décris ton activité",
    description: "En une phrase, explique ce que tu fais. Notre IA comprend instantanément ton besoin.",
  },
  {
    icon: Wand2,
    number: "02",
    title: "L'IA génère ton site",
    description: "En 10 secondes, SITEFORGE AI crée un site complet avec design, textes et images.",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Publie en 1 clic",
    description: "Ton site est prêt. Modifie si besoin et publie instantanément sur le web.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="comment-ca-marche" className="section-padding bg-background">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            Comment ça marche
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Aussi simple que 1, 2, 3
          </h2>
          <p className="text-lg text-muted-foreground">
            Pas besoin de compétences techniques. SITEFORGE AI s'occupe de tout.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="card-feature text-center h-full">
                {/* Icon */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-background border-2 border-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
