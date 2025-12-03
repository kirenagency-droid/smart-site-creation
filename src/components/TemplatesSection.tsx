import { UtensilsCrossed, Dumbbell, Briefcase, Camera, Palette, Building2, FileUser, Rocket } from "lucide-react";

const templates = [
  { icon: UtensilsCrossed, name: "Restaurant", color: "from-orange-500 to-red-500" },
  { icon: Dumbbell, name: "Coach", color: "from-green-500 to-emerald-500" },
  { icon: Briefcase, name: "Business", color: "from-blue-500 to-indigo-500" },
  { icon: Camera, name: "Modèle", color: "from-pink-500 to-rose-500" },
  { icon: Palette, name: "Portfolio", color: "from-purple-500 to-violet-500" },
  { icon: Building2, name: "Agence", color: "from-cyan-500 to-blue-500" },
  { icon: FileUser, name: "CV", color: "from-amber-500 to-orange-500" },
  { icon: Rocket, name: "SaaS", color: "from-indigo-500 to-purple-500" },
];

const TemplatesSection = () => {
  return (
    <section id="templates" className="section-padding bg-background">
      <div className="container-narrow">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            Templates
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Un template pour chaque besoin
          </h2>
          <p className="text-lg text-muted-foreground">
            Choisis parmi nos templates optimisés ou laisse l'IA créer un design unique pour toi.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {templates.map((template, index) => (
            <div
              key={template.name}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <template.icon className="w-7 h-7" />
                </div>
                <span className="text-lg font-semibold">{template.name}</span>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="#tarifs" className="btn-secondary">
            Voir tous les templates
          </a>
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
