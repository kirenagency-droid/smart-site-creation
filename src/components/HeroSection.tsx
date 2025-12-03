import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-20">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-glow opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container-narrow relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white/80">Propulsé par l'IA</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <span className="text-white">Crée ton site en</span>
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">10 secondes</span>
            <span className="text-white"> avec l'IA.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Décris ton business en une phrase. SITEFORGE AI génère un site complet, professionnel et optimisé en quelques secondes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <a href="#tarifs" className="btn-primary group">
              Créer mon site maintenant
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href="#comment-ca-marche" className="btn-ghost text-white/70 hover:text-white">
              Voir comment ça marche
            </a>
          </div>

          {/* Animated Mockup */}
          <div className="relative mt-16 md:mt-20 w-full max-w-4xl animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <div className="relative rounded-3xl overflow-hidden glass p-2 animate-pulse-glow">
              {/* Browser Frame */}
              <div className="bg-background/95 rounded-2xl overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-background rounded-lg border border-border/50 max-w-md mx-auto">
                      <div className="w-4 h-4 rounded bg-primary/20" />
                      <span className="text-xs text-muted-foreground">mon-site.siteforge.ai</span>
                    </div>
                  </div>
                </div>
                
                {/* Content Preview */}
                <div className="p-8 space-y-6">
                  {/* Typing Animation Simulation */}
                  <div className="space-y-3">
                    <div className="h-8 w-3/4 bg-gradient-to-r from-primary/20 to-transparent rounded-lg animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
                    <div className="h-4 w-full bg-muted/30 rounded" />
                    <div className="h-4 w-5/6 bg-muted/20 rounded" />
                  </div>
                  
                  {/* Cards */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl bg-secondary/30 p-4 animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                        <div className="w-10 h-10 rounded-lg bg-primary/20 mb-3" />
                        <div className="h-3 w-2/3 bg-muted/30 rounded mb-2" />
                        <div className="h-2 w-full bg-muted/20 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-2xl bg-gradient-primary opacity-20 blur-2xl animate-float" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
