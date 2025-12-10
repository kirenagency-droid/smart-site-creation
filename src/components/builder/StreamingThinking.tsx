import { useEffect, useState, useMemo } from 'react';
import { Brain, Sparkles, Code, Palette, CheckCircle2, Loader2 } from 'lucide-react';

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
    gradient: 'from-gray-500/20 to-gray-600/20',
    label: '' 
  },
  thinking: { 
    icon: Brain, 
    color: 'text-violet-400', 
    bg: 'bg-violet-500/10',
    gradient: 'from-violet-500/20 to-purple-500/20',
    label: 'Je réfléchis...' 
  },
  analyzing: { 
    icon: Code, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    label: 'J\'analyse ta demande...' 
  },
  designing: { 
    icon: Palette, 
    color: 'text-orange-400', 
    bg: 'bg-orange-500/10',
    gradient: 'from-orange-500/20 to-amber-500/20',
    label: 'Je conçois le design...' 
  },
  generating: { 
    icon: Code, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10',
    gradient: 'from-emerald-500/20 to-green-500/20',
    label: 'Génération en cours...' 
  },
  complete: { 
    icon: CheckCircle2, 
    color: 'text-green-400', 
    bg: 'bg-green-500/10',
    gradient: 'from-green-500/20 to-emerald-500/20',
    label: 'Terminé !' 
  },
};

// Format thinking text for better display
function formatThinkingText(text: string): string[] {
  if (!text) return [];
  
  // Split by numbered points or bullet patterns
  const lines = text
    .split(/(?:\n|(?=\d+\.\s)|(?=[-•]\s))/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  return lines;
}

export function StreamingThinking({ thinkingText, phase, isStreaming }: StreamingThinkingProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (thinkingText.length > currentCharIndex) {
      const timeout = setTimeout(() => {
        setDisplayedText(thinkingText.slice(0, currentCharIndex + 1));
        setCurrentCharIndex(prev => prev + 1);
      }, 12);
      return () => clearTimeout(timeout);
    }
  }, [thinkingText, currentCharIndex]);

  // Reset on new generation
  useEffect(() => {
    if (thinkingText === '') {
      setDisplayedText('');
      setCurrentCharIndex(0);
    }
  }, [thinkingText]);

  const formattedLines = useMemo(() => formatThinkingText(displayedText), [displayedText]);

  if (phase === 'idle' || !isStreaming) return null;

  const config = phaseConfig[phase];
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-3 animate-in fade-in-0 slide-in-from-bottom-3 duration-500">
      {/* Phase indicator with gradient background */}
      <div className={`relative overflow-hidden flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-sm ${config.bg}`}>
        {/* Animated gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-50`} />
        
        <div className="relative flex items-center gap-3">
          {phase !== 'complete' ? (
            <div className="relative">
              <Icon className={`w-5 h-5 ${config.color}`} />
              <div className={`absolute inset-0 ${config.color} animate-ping opacity-40`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          ) : (
            <Icon className={`w-5 h-5 ${config.color}`} />
          )}
          
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
          
          {phase !== 'complete' && (
            <div className="flex gap-1 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </div>

      {/* Thinking content with formatted display */}
      {displayedText && (
        <div className="relative overflow-hidden bg-secondary/60 backdrop-blur-sm rounded-2xl border border-white/5">
          {/* Subtle animated border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          
          <div className="relative p-4">
            <div className="flex items-start gap-3">
              <div className={`shrink-0 w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center`}>
                <Brain className={`w-4 h-4 ${config.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Réflexion de l'IA
                </p>
                
                <div className="space-y-1.5">
                  {formattedLines.map((line, index) => (
                    <p 
                      key={index} 
                      className="text-sm text-foreground/80 leading-relaxed animate-in fade-in-0 slide-in-from-left-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {line.match(/^\d+\./) ? (
                        <span className="flex gap-2">
                          <span className={`font-semibold ${config.color}`}>
                            {line.match(/^\d+\./)?.[0]}
                          </span>
                          <span>{line.replace(/^\d+\.\s*/, '')}</span>
                        </span>
                      ) : line.startsWith('-') || line.startsWith('•') ? (
                        <span className="flex gap-2">
                          <span className={config.color}>•</span>
                          <span>{line.replace(/^[-•]\s*/, '')}</span>
                        </span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
                
                {/* Typing indicator */}
                {currentCharIndex < thinkingText.length && (
                  <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5 rounded-sm" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Code streaming preview component with line counter
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
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary text-xs font-medium">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Génération... ({lineCount} lignes)</span>
        </div>
      )}
      
      <div 
        className={`transition-opacity duration-300 ${isStreaming ? 'opacity-90' : 'opacity-100'}`}
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
