import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Pour découvrir",
    price: "0€",
    period: "",
    features: [
      "1000 tokens offerts",
      "Projets illimités",
      "Téléchargement HTML",
      "Support communautaire",
    ],
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "Le plus populaire",
    price: "19€",
    period: "/mois",
    features: [
      "Tokens illimités",
      "Génération prioritaire",
      "Templates premium",
      "Hébergement inclus",
      "Support prioritaire",
    ],
    cta: "Passer au Pro",
    highlighted: true,
  },
  {
    name: "Agency",
    description: "Pour les équipes",
    price: "49€",
    period: "/mois",
    features: [
      "Tout du plan Pro",
      "5 membres d'équipe",
      "Marque blanche",
      "API access",
      "Support dédié",
    ],
    cta: "Contacter",
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="tarifs" className="section-padding bg-background">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Tarifs simples
          </h2>
          <p className="text-lg text-muted-foreground">
            Commence gratuitement avec 1000 tokens. Passe au Pro pour des générations illimitées.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary border border-border hover:border-primary/30"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-foreground text-background text-xs font-semibold">
                    Plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? "bg-primary-foreground/20" : "bg-primary/10"
                    }`}>
                      <Check className={`w-2.5 h-2.5 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`} />
                    </div>
                    <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/auth"
                className={`block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    : "bg-background text-foreground border border-border hover:border-primary/30"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
