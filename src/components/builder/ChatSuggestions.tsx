import { useState, useEffect } from 'react';

interface ChatSuggestionsProps {
  hasContent: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

// Suggestions for empty projects
const EMPTY_SUGGESTIONS = [
  "Crée un site pour un coach sportif premium",
  "Génère un site e-commerce moderne",
  "Crée une landing page SaaS",
  "Fais un portfolio de photographe",
];

// Suggestions for projects with content
const CONTENT_SUGGESTIONS = [
  "Ajoute une section témoignages",
  "Change la palette de couleurs",
  "Améliore le design du hero",
  "Rends le site plus moderne",
  "Ajoute des animations",
];

export const ChatSuggestions = ({ hasContent, onSuggestionClick }: ChatSuggestionsProps) => {
  const [visibleSuggestions, setVisibleSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const suggestions = hasContent ? CONTENT_SUGGESTIONS : EMPTY_SUGGESTIONS;
    // Show 2-3 random suggestions
    const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
    setVisibleSuggestions(shuffled.slice(0, 3));
  }, [hasContent]);

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {visibleSuggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-4 py-2 rounded-full bg-secondary border border-border text-sm text-foreground hover:bg-secondary/80 hover:border-primary/50 transition-all duration-200 truncate max-w-full"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};
