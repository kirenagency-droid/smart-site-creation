import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";

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
    <section id="tarifs" className="section-padding bg-gradient-hero">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Tarifs simples
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Choisis ton plan
          </h2>
          <p className="text-lg text-white/60">
            Commence gratuitement avec 1000 tokens. Passe au Pro pour des générations illimitées.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-primary shadow-glow scale-105 lg:scale-110"
                  : "glass hover:bg-white/10"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-white text-primary text-sm font-semibold shadow-lg">
                    Plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <p className={`text-sm ${plan.highlighted ? "text-white/80" : "text-white/60"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className={`text-lg ${plan.highlighted ? "text-white/80" : "text-white/60"}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? "bg-white/20" : "bg-primary/20"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? "text-white" : "text-primary"}`} />
                    </div>
                    <span className={`text-sm ${plan.highlighted ? "text-white/90" : "text-white/70"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/auth"
                className={`block w-full py-4 rounded-2xl font-semibold text-center transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
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
