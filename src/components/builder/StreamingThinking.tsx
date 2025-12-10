import { useEffect, useState } from 'react';
import { Brain, Sparkles, Code, Palette, CheckCircle2 } from 'lucide-react';

interface StreamingThinkingProps {
  thinkingText: string;
  phase: 'idle' | 'thinking' | 'analyzing' | 'designing' | 'generating' | 'complete';
  isStreaming: boolean;
}

const phaseConfig = {
  idle: { 
    icon: Sparkles, 
    color: 'text-muted-foreground', 
    bg: 'bg-secondary/50',
    label: '' 
  },
  thinking: { 
    icon: Brain, 
    color: 'text-violet-500', 
    bg: 'bg-violet-500/10',
    label: 'Réflexion...' 
  },
  analyzing: { 
    icon: Code, 
    color: 'text-blue-500', 
    bg: 'bg-blue-500/10',
    label: 'Analyse du code...' 
  },
  designing: { 
    icon: Palette, 
    color: 'text-orange-500', 
    bg: 'bg-orange-500/10',
    label: 'Design...' 
  },
  generating: { 
    icon: Code, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-500/10',
    label: 'Génération...' 
  },
  complete: { 
    icon: CheckCircle2, 
    color: 'text-green-500', 
    bg: 'bg-green-500/10',
    label: 'Terminé !' 
  },
};

export function StreamingThinking({ thinkingText, phase, isStreaming }: StreamingThinkingProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Typewriter effect for thinking text
  useEffect(() => {
    if (thinkingText.length > currentCharIndex) {
      const timeout = setTimeout(() => {
        setDisplayedText(thinkingText.slice(0, currentCharIndex + 1));
        setCurrentCharIndex(prev => prev + 1);
      }, 15); // Fast typing speed
      return () => clearTimeout(timeout);
    }
  }, [thinkingText, currentCharIndex]);

  // Reset when thinking text changes completely (new generation)
  useEffect(() => {
    if (thinkingText === '') {
      setDisplayedText('');
      setCurrentCharIndex(0);
    }
  }, [thinkingText]);

  if (phase === 'idle' || !isStreaming) return null;

  const config = phaseConfig[phase];
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {/* Phase indicator */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color} ${phase !== 'complete' ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
        {phase !== 'complete' && (
          <div className="flex gap-0.5">
            <div className={`w-1 h-1 rounded-full ${config.bg.replace('/10', '/60')} animate-bounce`} style={{ animationDelay: '0ms' }} />
            <div className={`w-1 h-1 rounded-full ${config.bg.replace('/10', '/60')} animate-bounce`} style={{ animationDelay: '150ms' }} />
            <div className={`w-1 h-1 rounded-full ${config.bg.replace('/10', '/60')} animate-bounce`} style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Thinking content */}
      {displayedText && (
        <div className="bg-secondary/80 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-[90%]">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">
            {displayedText}
            {currentCharIndex < thinkingText.length && (
              <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-0.5" />
            )}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Code streaming preview component
 */
interface StreamingCodePreviewProps {
  html: string;
  isStreaming: boolean;
}

export function StreamingCodePreview({ html, isStreaming }: StreamingCodePreviewProps) {
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    const lines = html.split('\n').length;
    setLineCount(lines);
  }, [html]);

  if (!html) return null;

  return (
    <div className="relative">
      {/* Streaming indicator */}
      {isStreaming && (
        <div className="absolute top-2 right-2 flex items-center gap-2 px-2 py-1 rounded-md bg-primary/20 text-primary text-xs">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Génération en cours... ({lineCount} lignes)</span>
        </div>
      )}
      
      <div 
        className={`transition-opacity duration-300 ${isStreaming ? 'opacity-80' : 'opacity-100'}`}
      >
        <iframe
          srcDoc={html}
          title="Streaming Preview"
          className="w-full h-full"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}
