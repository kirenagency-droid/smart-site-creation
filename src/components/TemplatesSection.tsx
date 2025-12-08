import { Link } from "react-router-dom";
import { Layout, BarChart3, Smartphone, Sparkles, ShoppingBag, Zap } from "lucide-react";

const templates = [
  { 
    icon: Layout, 
    name: "Landing page", 
    color: "from-pink-500 to-rose-500",
    preview: "bg-gradient-to-br from-amber-100 to-orange-200"
  },
  { 
    icon: BarChart3, 
    name: "Dashboard", 
    color: "from-purple-500 to-violet-500",
    preview: "bg-gradient-to-br from-slate-800 to-slate-900"
  },
  { 
    icon: Smartphone, 
    name: "Mobile", 
    color: "from-green-500 to-emerald-500",
    preview: "bg-gradient-to-br from-green-100 to-emerald-200"
  },
  { 
    icon: Sparkles, 
    name: "Portfolio", 
    color: "from-purple-500 to-indigo-500",
    preview: "bg-gradient-to-br from-slate-100 to-slate-200"
  },
  { 
    icon: ShoppingBag, 
    name: "E-commerce", 
    color: "from-orange-500 to-amber-500",
    preview: "bg-gradient-to-br from-teal-800 to-cyan-900"
  },
  { 
    icon: Zap, 
    name: "SaaS", 
    color: "from-yellow-500 to-orange-500",
    preview: "bg-gradient-to-br from-sky-100 to-blue-200"
  },
];

const TemplatesSection = () => {
  return (
    <section id="templates" className="section-padding bg-background">
      <div className="container-wide">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Tu peux littéralement tout créer
          </h2>
        </div>

        {/* Templates Horizontal Scroll */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
            {templates.map((template, index) => (
              <div
                key={template.name}
                className="flex-shrink-0 w-[240px] group cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Card */}
                <div className="relative rounded-2xl overflow-hidden bg-secondary border border-border transition-all duration-300 hover:border-primary/30">
                  {/* Header with icon and name */}
                  <div className="flex items-center gap-2 p-3 border-b border-border">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                      <template.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{template.name}</span>
                  </div>
                  
                  {/* Preview Area */}
                  <div className={`h-[180px] ${template.preview} p-4`}>
                    {/* Mock content */}
                    <div className="w-full h-full rounded-lg bg-white/20 backdrop-blur-sm border border-white/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Fade overlay on right */}
          <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>

        {/* CTA Button */}
        <div className="mt-8">
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary border border-border rounded-xl text-sm font-medium text-foreground hover:bg-secondary/80 hover:border-primary/30 transition-all duration-200"
          >
            Voir tous les projets
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TemplatesSection;
