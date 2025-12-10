import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Paperclip, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const themeGradients = {
  purple: `
    radial-gradient(ellipse 100% 80% at 50% 0%, hsl(265, 90%, 55%, 0.4) 0%, transparent 55%),
    radial-gradient(ellipse 80% 60% at 70% 20%, hsl(290, 85%, 50%, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse 60% 50% at 25% 15%, hsl(320, 80%, 50%, 0.2) 0%, transparent 45%)
  `,
  yellow: `
    radial-gradient(ellipse 100% 80% at 50% 0%, hsl(42, 100%, 55%, 0.4) 0%, transparent 55%),
    radial-gradient(ellipse 80% 60% at 70% 20%, hsl(28, 95%, 50%, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse 60% 50% at 25% 15%, hsl(45, 90%, 50%, 0.2) 0%, transparent 45%)
  `,
  blue: `
    radial-gradient(ellipse 100% 80% at 50% 0%, hsl(215, 95%, 55%, 0.4) 0%, transparent 55%),
    radial-gradient(ellipse 80% 60% at 70% 20%, hsl(235, 90%, 55%, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse 60% 50% at 25% 15%, hsl(200, 90%, 50%, 0.2) 0%, transparent 45%)
  `,
  green: `
    radial-gradient(ellipse 100% 80% at 50% 0%, hsl(155, 80%, 45%, 0.4) 0%, transparent 55%),
    radial-gradient(ellipse 80% 60% at 70% 20%, hsl(175, 75%, 40%, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse 60% 50% at 25% 15%, hsl(140, 80%, 45%, 0.2) 0%, transparent 45%)
  `,
};

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

  return (
    <section className="relative min-h-[75vh] flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 transition-all duration-700"
          style={{ background: themeGradients[themeColor] }}
        />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container-narrow relative z-10 flex flex-col items-center text-center pt-16 pb-8">
        {/* Badge */}
        <div 
          className="floating-badge mb-8 animate-fade-in-down"
          style={{ animationDelay: "0.1s" }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Build with AI in seconds</span>
        </div>

        {/* Main Title */}
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] mb-6 animate-fade-in tracking-tight"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="text-foreground">Describe it.</span>
          <br />
          <span className="text-gradient-primary">Creali builds it.</span>
        </h1>

        {/* Subtitle */}
        <p 
          className="text-lg md:text-xl text-muted-foreground max-w-xl mb-12 animate-fade-in leading-relaxed"
          style={{ animationDelay: "0.3s" }}
        >
          Create beautiful, production-ready websites in seconds with AI.
          Just describe what you need.
        </p>

        {/* Premium Prompt Input Box */}
        <form 
          onSubmit={handleSubmit}
          className="w-full max-w-2xl animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className={`input-premium ${isFocused ? 'shadow-glow' : ''}`}>
            {/* Text Input */}
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Create a landing page for my SaaS startup..."
              className="w-full bg-transparent border-0 px-6 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none text-base md:text-lg"
            />
            
            {/* Bottom Actions */}
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="hidden sm:inline">Attach</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Templates</span>
                </button>
              </div>
              
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="group relative w-11 h-11 flex items-center justify-center rounded-xl overflow-hidden transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                <ArrowUp className="relative z-10 w-5 h-5 text-primary-foreground group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-muted-foreground/60 mt-4 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground">Enter</kbd> to generate
          </p>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;