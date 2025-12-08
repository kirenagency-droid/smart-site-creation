import { useState, useEffect } from 'react';
import { Sparkles, Brain, Palette, Lightbulb, Rocket, Check, Wand2, Eye, Zap } from 'lucide-react';

interface AIStatusMessagesProps {
  phase: 'thinking' | 'analyzing' | 'designing' | 'generating' | 'complete' | null;
  onComplete?: () => void;
  hasImage?: boolean;
}

const phaseMessages = {
  thinking: [
    "Je réfléchis à ton design…",
    "Hmm, laisse-moi réfléchir…",
    "Je visualise le concept…",
    "Je cherche la meilleure approche…",
    "Je comprends ce que tu veux…"
  ],
  analyzing: [
    "J'analyse ton site existant…",
    "Je regarde ce qu'on peut améliorer…",
    "J'étudie la structure actuelle…",
    "Je comprends tes besoins…",
    "Je repère les points à optimiser…"
  ],
  designing: [
    "Ok, je repense toute la structure.",
    "Je travaille sur le design…",
    "Je crée quelque chose de moderne…",
    "Je te propose une version plus professionnelle.",
    "J'applique un style premium…"
  ],
  generating: [
    "Je mets tout ça en place…",
    "Super idée, je m'en occupe !",
    "Je génère le code…",
    "Presque terminé…",
    "Je peaufine les détails…"
  ],
  complete: [
    "Voilà le rendu ! N'hésite pas à me demander une autre version 🙂",
    "Et voilà ! Dis-moi si tu veux des ajustements.",
    "C'est prêt ! Qu'en penses-tu ?",
    "Tada ! ✨ Dis-moi ce que tu en penses.",
    "Voilà ! Je peux encore améliorer si besoin."
  ]
};

const visionPhaseMessages = {
  thinking: [
    "Je regarde ton image…",
    "J'analyse le design…",
    "Je scanne la structure…"
  ],
  analyzing: [
    "J'identifie les sections…",
    "Je note les couleurs et le style…",
    "Je comprends le layout…"
  ],
  designing: [
    "Je reproduis le design…",
    "J'adapte en HTML/Tailwind…",
    "Je recrée ce style…"
  ],
  generating: [
    "Je génère le site…",
    "Je mets tout en place…",
    "Presque terminé…"
  ],
  complete: [
    "J'ai reproduit le design ! Tu veux des ajustements ? 🎨",
    "Voilà le résultat ! Je peux améliorer certaines parties si tu veux.",
    "C'est prêt ! Le design te plaît ?"
  ]
};

const phaseIcons = {
  thinking: Brain,
  analyzing: Eye,
  designing: Palette,
  generating: Wand2,
  complete: Check
};

const phaseTips = {
  thinking: null,
  analyzing: null,
  designing: null,
  generating: null,
  complete: [
    "💡 Tu peux ajouter une section témoignages pour améliorer la conversion.",
    "💡 Les boutons d'appel à l'action sont plus efficaces avec des couleurs contrastées.",
    "💡 Pense à ajouter un formulaire de contact pour collecter des leads.",
    "💡 Une section FAQ peut répondre aux questions fréquentes de tes visiteurs.",
    "💡 Les preuves sociales (logos clients, témoignages) renforcent la crédibilité.",
    "💡 Un design mobile-first améliore l'expérience utilisateur.",
    "💡 Des animations subtiles rendent le site plus dynamique.",
    "💡 Un header sticky facilite la navigation."
  ]
};

export function AIStatusMessages({ phase, onComplete, hasImage }: AIStatusMessagesProps) {
  const [message, setMessage] = useState('');
  const [tip, setTip] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [dots, setDots] = useState('');

  // Animated dots for loading phases
  useEffect(() => {
    if (phase && phase !== 'complete') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 400);
      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [phase]);

  useEffect(() => {
    if (!phase) {
      setMessage('');
      setTip(null);
      setShowTip(false);
      return;
    }

    const messages = hasImage && visionPhaseMessages[phase] 
      ? visionPhaseMessages[phase] 
      : phaseMessages[phase];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);

    if (phase === 'complete') {
      const tips = phaseTips.complete;
      if (tips) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setTip(randomTip);
        setTimeout(() => setShowTip(true), 1500);
      }
      onComplete?.();
    } else {
      setTip(null);
      setShowTip(false);
    }
  }, [phase, onComplete, hasImage]);

  if (!phase || !message) return null;

  const Icon = phaseIcons[phase];
  const isLoading = phase !== 'complete';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3 bg-secondary/80 backdrop-blur-sm rounded-2xl px-4 py-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          phase === 'complete' 
            ? 'bg-green-500/20 text-green-500' 
            : 'bg-primary/20 text-primary'
        }`}>
          {phase === 'complete' ? (
            <Icon className="w-4 h-4" />
          ) : (
            <Icon className="w-4 h-4 animate-pulse" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-foreground">
            {message}{isLoading ? dots : ''}
          </p>
        </div>
        {isLoading && (
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {showTip && tip && (
        <div className="ml-11 text-xs text-muted-foreground bg-secondary/50 rounded-xl px-3 py-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
          {tip}
        </div>
      )}
    </div>
  );
}

// Hook to manage AI status phases
export function useAIStatus() {
  const [phase, setPhase] = useState<'thinking' | 'analyzing' | 'designing' | 'generating' | 'complete' | null>(null);

  const startGeneration = async (hasExistingHtml: boolean) => {
    setPhase('thinking');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (hasExistingHtml) {
      setPhase('analyzing');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setPhase('designing');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setPhase('generating');
  };

  const completeGeneration = () => {
    setPhase('complete');
    // Auto-clear after 8 seconds
    setTimeout(() => setPhase(null), 8000);
  };

  const resetStatus = () => {
    setPhase(null);
  };

  return {
    phase,
    startGeneration,
    completeGeneration,
    resetStatus
  };
}

// Proactive suggestions component
interface AIProactiveSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  hasContent: boolean;
}

export function AIProactiveSuggestions({ onSuggestionClick, hasContent }: AIProactiveSuggestionsProps) {
  const newSiteSuggestions = [
    "Crée un site pour un coach sportif",
    "Site e-commerce moderne",
    "Landing page SaaS",
    "Portfolio photographe",
    "Site restaurant premium"
  ];

  const improvementSuggestions = [
    "Améliore le responsive mobile",
    "Ajoute une section témoignages",
    "Rends le hero plus impactant",
    "Optimise les couleurs",
    "Ajoute des animations subtiles"
  ];

  const suggestions = hasContent ? improvementSuggestions : newSiteSuggestions;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {suggestions.slice(0, 3).map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 py-1.5 text-xs rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors border border-border/50"
        >
          <Zap className="w-3 h-3 inline mr-1" />
          {suggestion}
        </button>
      ))}
    </div>
  );
}
