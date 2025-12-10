import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Paperclip, Sparkles, Zap, Globe, Palette, Code2, Rocket, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const themeGradients = {
  purple: `
    radial-gradient(ellipse 120% 100% at 50% -20%, hsl(265, 90%, 55%, 0.5) 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 80% 20%, hsl(290, 85%, 50%, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse 60% 50% at 20% 30%, hsl(320, 80%, 50%, 0.15) 0%, transparent 45%)
  `,
  yellow: `
    radial-gradient(ellipse 120% 100% at 50% -20%, hsl(42, 100%, 55%, 0.5) 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 80% 20%, hsl(28, 95%, 50%, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse 60% 50% at 20% 30%, hsl(45, 90%, 50%, 0.15) 0%, transparent 45%)
  `,
  blue: `
    radial-gradient(ellipse 120% 100% at 50% -20%, hsl(215, 95%, 55%, 0.5) 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 80% 20%, hsl(235, 90%, 55%, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse 60% 50% at 20% 30%, hsl(200, 90%, 50%, 0.15) 0%, transparent 45%)
  `,
  green: `
    radial-gradient(ellipse 120% 100% at 50% -20%, hsl(155, 80%, 45%, 0.5) 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 80% 20%, hsl(175, 75%, 40%, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse 60% 50% at 20% 30%, hsl(140, 80%, 45%, 0.15) 0%, transparent 45%)
  `,
};

const suggestions = [
  { icon: Globe, text: "Landing page for my startup" },
  { icon: Palette, text: "Portfolio for a designer" },
  { icon: Code2, text: "SaaS dashboard interface" },
  { icon: Rocket, text: "E-commerce product page" },
];

// Floating particles configuration
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  delay: Math.random() * 15,
  duration: Math.random() * 10 + 15,
  opacity: Math.random() * 0.5 + 0.1,
}));

// Extract a meaningful project name from the prompt
const extractProjectName = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  
  const keywords = [
    'landing page', 'portfolio', 'dashboard', 'e-commerce', 'ecommerce', 'shop', 'store',
    'blog', 'website', 'site', 'app', 'application', 'saas', 'startup', 'agency',
    'restaurant', 'coach', 'fitness', 'gym', 'yoga', 'spa', 'hotel', 'travel',
    'photography', 'music', 'gaming', 'crypto', 'nft', 'real estate', 'immobilier',
    'avocat', 'lawyer', 'doctor', 'médecin', 'dentist', 'clinic', 'clinique',
    'école', 'school', 'formation', 'course', 'food', 'delivery', 'livraison'
  ];
  
  for (const keyword of keywords) {
    if (lowerPrompt.includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1);
    }
  }
  
  const patterns = [
    /(?:for|pour|de)\s+(?:a\s+|un\s+|une\s+|my\s+|mon\s+|ma\s+)?(\w+)/i,
    /(?:site|page|website)\s+(?:de\s+|for\s+)?(\w+)/i,
    /(\w+)\s+(?:landing|page|site|website)/i,
  ];
  
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      const word = match[1];
      if (!['the', 'une', 'mon', 'for', 'avec', 'with', 'and', 'site', 'page'].includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
    }
  }
  
  const words = prompt.split(/\s+/).filter(w => w.length > 3);
  const skipWords = ['create', 'make', 'build', 'crée', 'fais', 'créer', 'faire', 'pour', 'with', 'avec', 'modern', 'moderne', 'landing', 'page', 'site', 'website'];
  const significantWord = words.find(w => !skipWords.includes(w.toLowerCase()));
  
  if (significantWord) {
    return significantWord.charAt(0).toUpperCase() + significantWord.slice(1).toLowerCase();
  }
  
  return "Nouveau projet";
};

const HeroSection = () => {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { themeColor } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    if (!user) {
      navigate("/auth", { state: { initialPrompt: prompt } });
      return;
    }

    setIsCreating(true);
    
    try {
      const projectName = extractProjectName(prompt);
      
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectName,
          description: prompt,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Projet créé !",
        description: `${projectName} - Génération en cours...`,
      });

      navigate(`/app/${project.id}`, { state: { initialPrompt: prompt } });
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le projet",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 transition-all duration-1000"
          style={{ background: themeGradients[themeColor] }}
        />
        
        {/* Animated grid with fade effect */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)'
          }}
        />
        
        {/* Floating orbs with morphing animation */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-morph animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-morph animate-glow-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] animate-spin-slow" />
        
        {/* Floating particles */}
        {mounted && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary/30 animate-particle-float"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      <div className="container-narrow relative z-10 flex flex-col items-center text-center px-4 py-12">
        {/* Badge with bounce animation */}
        <div 
          className={`inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ transitionDelay: '0.1s' }}
        >
          <Sparkles className="w-4 h-4 animate-bounce-subtle" />
          <span>Build with AI • Free to start</span>
        </div>

        {/* Main Title with staggered word reveal */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-10 tracking-tight overflow-hidden">
          <span className="block overflow-hidden">
            <span 
              className={`inline-block text-foreground transition-all duration-700 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
              style={{ transitionDelay: '0.2s' }}
            >
              What do you want
            </span>
          </span>
          <span className="block overflow-hidden">
            <span 
              className={`inline-block text-gradient-primary transition-all duration-700 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
              style={{ transitionDelay: '0.35s' }}
            >
              to build today?
            </span>
          </span>
        </h1>

        {/* Premium Prompt Input Box with blur-in animation */}
        <form 
          onSubmit={handleSubmit}
          className={`w-full max-w-2xl transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'
          }`}
          style={{ transitionDelay: '0.5s' }}
        >
          <div className={`relative rounded-2xl bg-card/80 backdrop-blur-xl border-2 transition-all duration-500 ${
            isFocused 
              ? 'border-primary/50 shadow-[0_0_60px_-10px_hsl(var(--primary)/0.5)] scale-[1.02]' 
              : 'border-border/50 shadow-xl shadow-background/50 hover:border-border hover:shadow-2xl'
          }`}>
            {/* Animated border beam effect when focused */}
            {isFocused && (
              <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute w-20 h-20 bg-primary/60 blur-xl animate-spin-slow" 
                  style={{ 
                    offsetPath: 'rect(0 100% 100% 0 round 1rem)', 
                    animation: 'border-beam 4s linear infinite'
                  }} 
                />
              </div>
            )}
            
            {/* Text Input */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (prompt.trim() && !isCreating) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Describe your website... e.g., A modern landing page for a fitness app with dark theme"
              className="w-full bg-transparent border-0 px-6 pt-5 pb-2 text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-base resize-none min-h-[80px] transition-all"
              rows={2}
              disabled={isCreating}
            />
            
            {/* Bottom Actions */}
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 hover:scale-105"
                  disabled={isCreating}
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="hidden sm:inline">Attach</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 hover:scale-105"
                  disabled={isCreating}
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Templates</span>
                </button>
              </div>
              
              <button
                type="submit"
                disabled={!prompt.trim() || isCreating}
                className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl overflow-hidden transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-90 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                {isCreating ? (
                  <Loader2 className="relative z-10 w-4 h-4 text-primary-foreground animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10 text-sm font-medium text-primary-foreground hidden sm:inline">Generate</span>
                    <ArrowUp className="relative z-10 w-4 h-4 text-primary-foreground group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Suggestions with staggered animation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <span 
            className={`text-xs text-muted-foreground/60 mr-1 transition-all duration-500 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '0.7s' }}
          >
            Try:
          </span>
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(suggestion.text)}
              disabled={isCreating}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 disabled:opacity-50 hover:scale-105 hover:-translate-y-0.5 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${0.75 + i * 0.1}s` }}
            >
              <suggestion.icon className="w-3 h-3" />
              {suggestion.text}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
