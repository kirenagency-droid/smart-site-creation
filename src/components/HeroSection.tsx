import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Paperclip, Sparkles, Zap, Globe, Palette, Code2, Rocket } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

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

const HeroSection = () => {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { themeColor } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      if (user) {
        navigate("/projects", { state: { initialPrompt: prompt } });
      } else {
        navigate("/auth", { state: { initialPrompt: prompt } });
      }
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
          className="absolute inset-0 transition-all duration-700"
          style={{ background: themeGradients[themeColor] }}
        />
        {/* Animated grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
        {/* Floating orbs */}
        <div className="absolute top-1/3 left-1/5 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px]" />
      </div>

      <div className="container-narrow relative z-10 flex flex-col items-center text-center px-4 py-12">
        {/* Badge */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-in-down backdrop-blur-sm"
          style={{ animationDelay: "0.1s" }}
        >
          <Sparkles className="w-4 h-4" />
          <span>Build with AI • Free to start</span>
        </div>

        {/* Main Title */}
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-fade-in tracking-tight"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="text-foreground">What do you want</span>
          <br />
          <span className="text-gradient-primary">to build today?</span>
        </h1>

        {/* Subtitle */}
        <p 
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mb-10 animate-fade-in leading-relaxed"
          style={{ animationDelay: "0.3s" }}
        >
          Describe your vision in plain words. Creali transforms it into a beautiful, 
          production-ready website in seconds.
        </p>

        {/* Premium Prompt Input Box */}
        <form 
          onSubmit={handleSubmit}
          className="w-full max-w-2xl animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className={`relative rounded-2xl bg-card/80 backdrop-blur-xl border-2 transition-all duration-300 ${
            isFocused 
              ? 'border-primary/50 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.4)]' 
              : 'border-border/50 shadow-xl shadow-background/50'
          }`}>
            {/* Text Input */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (prompt.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Describe your website... e.g., A modern landing page for a fitness app with dark theme"
              className="w-full bg-transparent border-0 px-6 pt-5 pb-2 text-foreground placeholder:text-muted-foreground/70 focus:outline-none text-base resize-none min-h-[80px]"
              rows={2}
            />
            
            {/* Bottom Actions */}
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="hidden sm:inline">Attach</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Templates</span>
                </button>
              </div>
              
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl overflow-hidden transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-sm font-medium text-primary-foreground hidden sm:inline">Generate</span>
                <ArrowUp className="relative z-10 w-4 h-4 text-primary-foreground group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </form>

        {/* Suggestions */}
        <div 
          className="flex flex-wrap items-center justify-center gap-2 mt-6 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <span className="text-xs text-muted-foreground/60 mr-1">Try:</span>
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200"
            >
              <suggestion.icon className="w-3 h-3" />
              {suggestion.text}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div 
          className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-border/30 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">10K+</div>
            <div className="text-xs text-muted-foreground">Sites created</div>
          </div>
          <div className="w-px h-10 bg-border/50" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">&lt;30s</div>
            <div className="text-xs text-muted-foreground">Average build time</div>
          </div>
          <div className="w-px h-10 bg-border/50" />
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">Free</div>
            <div className="text-xs text-muted-foreground">To get started</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
