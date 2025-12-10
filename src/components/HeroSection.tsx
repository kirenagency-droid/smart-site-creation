import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Command, Globe, Layers, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const suggestions = [
  { icon: Globe, text: "Landing page for startup", tag: "POPULAR" },
  { icon: Layers, text: "Portfolio website", tag: "NEW" },
  { icon: Zap, text: "SaaS product page", tag: null },
];

const extractProjectName = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  
  const keywords = [
    'landing page', 'portfolio', 'dashboard', 'e-commerce', 'ecommerce', 'shop', 'store',
    'blog', 'website', 'site', 'app', 'application', 'saas', 'startup', 'agency',
    'restaurant', 'coach', 'fitness', 'gym', 'yoga', 'spa', 'hotel', 'travel',
    'photography', 'music', 'gaming', 'crypto', 'nft', 'real estate', 'immobilier'
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
  const skipWords = ['create', 'make', 'build', 'crée', 'fais', 'créer', 'faire', 'pour', 'with', 'avec'];
  const significantWord = words.find(w => !skipWords.includes(w.toLowerCase()));
  
  if (significantWord) {
    return significantWord.charAt(0).toUpperCase() + significantWord.slice(1).toLowerCase();
  }
  
  return "New Project";
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
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
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
        title: "Project created",
        description: `${projectName} — generating...`,
      });

      navigate(`/app/${project.id}`, { state: { initialPrompt: prompt } });
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
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
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background grain">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orb */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-30"
          style={{
            background: `radial-gradient(ellipse 100% 100% at 50% 0%, hsl(var(--primary) / 0.2) 0%, transparent 70%)`
          }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Accent lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      </div>

      <div className="container-narrow relative z-10 flex flex-col items-center text-center px-6 py-16">
        {/* Version badge */}
        <div 
          className={`inline-flex items-center gap-2 px-3 py-1.5 mb-12 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
          style={{ 
            background: 'hsl(var(--primary) / 0.08)',
            color: 'hsl(var(--primary))',
            border: '1px solid hsl(var(--primary) / 0.15)'
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>v2.0 — AI Powered</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8">
          <span className="block overflow-hidden">
            <span 
              className={`block transition-all duration-700 ease-out ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
              style={{ transitionDelay: '0.15s' }}
            >
              <span className="text-foreground">Build</span>
            </span>
          </span>
          <span className="block overflow-hidden">
            <span 
              className={`block transition-all duration-700 ease-out ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
              style={{ transitionDelay: '0.25s' }}
            >
              <span className="text-gradient-primary">websites</span>
            </span>
          </span>
          <span className="block overflow-hidden">
            <span 
              className={`block transition-all duration-700 ease-out ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
              style={{ transitionDelay: '0.35s' }}
            >
              <span className="text-muted-foreground/60">with AI</span>
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p 
          className={`text-lg text-muted-foreground max-w-md mb-12 leading-relaxed transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '0.45s' }}
        >
          Describe what you want. Get a production-ready website in seconds.
        </p>

        {/* Input area */}
        <form 
          onSubmit={handleSubmit}
          className={`w-full max-w-xl transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.55s' }}
        >
          <div 
            className={`relative rounded-xl transition-all duration-300 ${
              isFocused 
                ? 'ring-2 ring-primary/30 ring-offset-2 ring-offset-background' 
                : ''
            }`}
          >
            <div className="relative bg-card border border-border rounded-xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-4">
                <Command className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !isCreating) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="What do you want to build?"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:outline-none text-base"
                  disabled={isCreating}
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || isCreating}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:brightness-110"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Generate</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div 
            className={`flex flex-wrap items-center justify-center gap-2 mt-6 transition-all duration-700 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '0.7s' }}
          >
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestionClick(suggestion.text)}
                disabled={isCreating}
                className={`group flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg border border-transparent hover:border-border transition-all duration-200 disabled:opacity-50 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${0.75 + i * 0.08}s` }}
              >
                <suggestion.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span>{suggestion.text}</span>
                {suggestion.tag && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded bg-primary/10 text-primary">
                    {suggestion.tag}
                  </span>
                )}
              </button>
            ))}
          </div>
        </form>

        {/* Stats row */}
        <div 
          className={`flex items-center gap-8 mt-16 text-sm transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '0.9s' }}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-mono text-foreground">2.5K+</span>
            <span>sites built</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-mono text-foreground">&lt;30s</span>
            <span>avg. build</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-mono text-primary">Free</span>
            <span>to start</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
