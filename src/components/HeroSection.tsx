import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Sparkles, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const [prompt, setPrompt] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Navigate to auth or builder with the prompt
      if (user) {
        navigate("/projects", { state: { initialPrompt: prompt } });
      } else {
        navigate("/auth", { state: { initialPrompt: prompt } });
      }
    }
  };

  const trustedLogos = [
    "Stripe", "Shopify", "Notion", "Figma", "Linear", "Vercel"
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background pt-16">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-hero opacity-80" />
      </div>

      {/* Arc Glow at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] arc-glow" />

      <div className="container-narrow relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Propulsé par l'IA</span>
        </div>

        {/* Main Title */}
        <h1 
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-fade-in tracking-tight"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="text-foreground">Que vas-tu </span>
          <span className="text-primary italic">créer</span>
          <span className="text-foreground"> aujourd'hui ?</span>
        </h1>

        {/* Subtitle */}
        <p 
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          Crée des sites et apps magnifiques en discutant avec l'IA.
        </p>

        {/* Prompt Input Box */}
        <form 
          onSubmit={handleSubmit}
          className="w-full max-w-2xl animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="relative bg-secondary border border-border rounded-2xl p-2 transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-glow">
            {/* Text Area */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Crée un site vitrine pour mon salon de coiffure..."
              className="w-full min-h-[100px] bg-transparent border-0 p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-base"
              rows={3}
            />
            
            {/* Bottom Actions */}
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-10 h-10 rounded-xl bg-background/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Idées</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:brightness-110 transition-all duration-200"
                >
                  <span>Créer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Or Import From */}
        <div 
          className="flex items-center gap-4 mt-6 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <span className="text-sm text-muted-foreground">ou importer depuis</span>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.5 3C4.12 3 3 4.12 3 5.5v13C3 19.88 4.12 21 5.5 21h13c1.38 0 2.5-1.12 2.5-2.5v-13C21 4.12 19.88 3 18.5 3h-13zM12 7l5 5-5 5v-3.5H7v-3h5V7z"/>
              </svg>
              Figma
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>
        </div>

        {/* Trusted By Section */}
        <div 
          className="mt-24 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
            Le #1 des outils IA pour créer des sites
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {trustedLogos.map((logo) => (
              <span key={logo} className="text-lg font-semibold text-muted-foreground">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
