import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreamingState {
  isStreaming: boolean;
  streamedHtml: string;
  thinkingText: string;
  phase: 'idle' | 'thinking' | 'analyzing' | 'designing' | 'generating' | 'complete';
  error: string | null;
}

interface UseStreamingGenerationOptions {
  onHtmlUpdate?: (html: string) => void;
  onThinkingUpdate?: (text: string) => void;
  onComplete?: (html: string, message: string) => void;
  onError?: (error: string) => void;
}

export function useStreamingGeneration(options: UseStreamingGenerationOptions = {}) {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    streamedHtml: '',
    thinkingText: '',
    phase: 'idle',
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const startGeneration = useCallback(async (
    projectId: string,
    message: string,
    currentHtml: string | null,
    siteStructure: unknown,
    imageData: string | null,
    conversationHistory: Array<{ role: string; content: string }>
  ) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState({
      isStreaming: true,
      streamedHtml: '',
      thinkingText: '',
      phase: 'thinking',
      error: null,
    });

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-website-v3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          projectId,
          message,
          currentHtml,
          siteStructure,
          imageData,
          conversationHistory: conversationHistory.slice(-15), // Last 15 messages for context
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de génération');
      }

      if (!response.body) {
        throw new Error('Stream non disponible');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullHtml = '';
      let fullThinking = '';
      let currentPhase: StreamingState['phase'] = 'thinking';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr);

            switch (event.type) {
              case 'phase':
                currentPhase = event.phase;
                setState(prev => ({ ...prev, phase: currentPhase }));
                break;

              case 'thinking':
                fullThinking += event.content;
                setState(prev => ({ ...prev, thinkingText: fullThinking }));
                options.onThinkingUpdate?.(fullThinking);
                break;

              case 'html_delta':
                fullHtml += event.content;
                setState(prev => ({ ...prev, streamedHtml: fullHtml }));
                options.onHtmlUpdate?.(fullHtml);
                break;

              case 'complete':
                setState(prev => ({ 
                  ...prev, 
                  phase: 'complete',
                  isStreaming: false,
                  streamedHtml: event.html || fullHtml,
                }));
                options.onComplete?.(event.html || fullHtml, event.message || '');
                break;

              case 'error':
                throw new Error(event.message || 'Erreur de génération');
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            console.warn('Parse error:', parseError);
          }
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't treat as error
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setState(prev => ({
        ...prev,
        isStreaming: false,
        phase: 'idle',
        error: errorMessage,
      }));
      options.onError?.(errorMessage);
    }
  }, [options]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isStreaming: false,
      phase: 'idle',
    }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      isStreaming: false,
      streamedHtml: '',
      thinkingText: '',
      phase: 'idle',
      error: null,
    });
  }, []);

  return {
    ...state,
    startGeneration,
    cancelGeneration,
    resetState,
  };
}
