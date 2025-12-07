import { useState, useEffect } from 'react';
import { Sparkles, Brain, Palette, Lightbulb, Rocket, Check, Wand2 } from 'lucide-react';

interface AIStatusMessagesProps {
  phase: 'thinking' | 'analyzing' | 'designing' | 'generating' | 'complete' | null;
  onComplete?: () => void;
}

const phaseMessages = {
  thinking: [
    "Je réfléchis à ton design…",
    "Hmm, laisse-moi réfléchir…",
    "Je visualise le concept…",
    "Je cherche la meilleure approche…"
  ],
  analyzing: [
    "J'analyse ton site existant…",
    "Je regarde ce qu'on peut améliorer…",
    "J'étudie la structure actuelle…",
    "Je comprends tes besoins…"
  ],
  designing: [
    "Ok, je repense toute la structure.",
    "Je travaille sur le design…",
    "Je crée quelque chose de moderne…",
    "Je te propose une version plus professionnelle."
  ],
  generating: [
    "Je mets tout ça en place…",
    "Super idée, je m'en occupe !",
    "Je génère le code…",
    "Presque terminé…"
  ],
  complete: [
    "Voilà le rendu ! N'hésite pas à me demander une autre version 🙂",
    "Et voilà ! Dis-moi si tu veux des ajustements.",
    "C'est prêt ! Qu'en penses-tu ?",
    "Tada ! ✨ Dis-moi ce que tu en penses."
  ]
};

const phaseIcons = {
  thinking: Brain,
  analyzing: Lightbulb,
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
    "💡 Conseil : Tu peux ajouter une section témoignages pour améliorer la conversion.",
    "💡 Conseil : Les boutons d'appel à l'action sont plus efficaces avec des couleurs contrastées.",
    "💡 Conseil : Pense à ajouter un formulaire de contact pour collecter des leads.",
    "💡 Conseil : Une section FAQ peut répondre aux questions fréquentes de tes visiteurs.",
    "💡 Conseil : Les preuves sociales (logos clients, témoignages) renforcent la crédibilité."
  ]
};

export function AIStatusMessages({ phase, onComplete }: AIStatusMessagesProps) {
  const [message, setMessage] = useState('');
  const [tip, setTip] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    if (!phase) {
      setMessage('');
      setTip(null);
      setShowTip(false);
      return;
    }

    const messages = phaseMessages[phase];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);

    if (phase === 'complete') {
      const tips = phaseTips.complete;
      if (tips) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setTip(randomTip);
        // Show tip after a small delay
        setTimeout(() => setShowTip(true), 1500);
      }
      onComplete?.();
    } else {
      setTip(null);
      setShowTip(false);
    }
  }, [phase, onComplete]);

  if (!phase || !message) return null;

  const Icon = phaseIcons[phase];

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
          <p className="text-sm text-foreground">{message}</p>
        </div>
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
    // Auto-clear after 5 seconds
    setTimeout(() => setPhase(null), 5000);
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
