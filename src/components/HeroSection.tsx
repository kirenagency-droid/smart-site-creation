import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Paperclip, MessageSquare, Palette } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const [prompt, setPrompt] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background Gradient - Purple/Pink/Blue */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 30%, hsl(270, 80%, 50%, 0.5) 0%, transparent 50%),
              radial-gradient(ellipse 60% 50% at 70% 40%, hsl(300, 70%, 45%, 0.4) 0%, transparent 45%),
              radial-gradient(ellipse 50% 40% at 30% 35%, hsl(220, 80%, 50%, 0.3) 0%, transparent 40%)
            `
          }}
        />
      </div>

      <div className="container-narrow relative z-10 flex flex-col items-center text-center pt-20">
        {/* Main Title */}
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-16 animate-fade-in tracking-tight text-foreground"
          style={{ animationDelay: "0.1s" }}
        >
          Say it with a URL.
        </h1>

        {/* Prompt Input Box - Dark style like Lovable */}
        <form 
          onSubmit={handleSubmit}
          className="w-full max-w-2xl animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="relative bg-secondary/90 backdrop-blur-sm border border-border rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-glow">
            {/* Text Input */}
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Creali to create an internal tool that"
              className="w-full bg-transparent border-0 px-5 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
            />
            
            {/* Bottom Actions */}
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-lg transition-all duration-200"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="hidden sm:inline">Attach</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-lg transition-all duration-200"
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Theme</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-lg transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </button>
                <button
                  type="submit"
                  className="w-10 h-10 flex items-center justify-center bg-muted-foreground/20 hover:bg-primary text-foreground rounded-full transition-all duration-200"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default HeroSection;
