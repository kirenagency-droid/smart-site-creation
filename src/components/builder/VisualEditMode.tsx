import { useState, useCallback } from 'react';
import { MousePointer2, Type, Palette, Smartphone, Layout, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VisualEditModeProps {
  isActive: boolean;
  onToggle: () => void;
  onEditCommand: (command: string) => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

const editOptions = [
  { id: 'modify', label: 'Modifier cette section', icon: Layout },
  { id: 'text', label: 'Changer le texte', icon: Type },
  { id: 'style', label: 'Changer le style', icon: Palette },
  { id: 'responsive', label: 'Rendre responsive', icon: Smartphone },
];

export function VisualEditMode({ isActive, onToggle, onEditCommand, iframeRef }: VisualEditModeProps) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [optionsPosition, setOptionsPosition] = useState({ x: 0, y: 0 });

  const handleIframeClick = useCallback((e: MessageEvent) => {
    if (e.data.type === 'element-clicked') {
      const { elementInfo, position } = e.data;
      setSelectedElement(elementInfo);
      setOptionsPosition({ x: position.x, y: position.y });
      setShowOptions(true);
    }
  }, []);

  const injectClickHandler = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const script = `
      (function() {
        if (window.__editModeActive) return;
        window.__editModeActive = true;
        
        let highlightedEl = null;
        const originalStyles = new Map();
        
        document.addEventListener('mouseover', function(e) {
          if (highlightedEl) {
            highlightedEl.style.outline = originalStyles.get(highlightedEl) || '';
          }
          highlightedEl = e.target;
          originalStyles.set(highlightedEl, highlightedEl.style.outline);
          highlightedEl.style.outline = '2px solid #4A4AE8';
          highlightedEl.style.outlineOffset = '2px';
          highlightedEl.style.cursor = 'pointer';
        });
        
        document.addEventListener('mouseout', function(e) {
          if (highlightedEl) {
            highlightedEl.style.outline = originalStyles.get(highlightedEl) || '';
            highlightedEl.style.outlineOffset = '';
            highlightedEl.style.cursor = '';
          }
        });
        
        document.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const el = e.target;
          const rect = el.getBoundingClientRect();
          
          const tagName = el.tagName.toLowerCase();
          const classes = Array.from(el.classList).join(' ');
          const id = el.id || '';
          const textContent = el.textContent?.substring(0, 50) || '';
          
          let elementInfo = tagName;
          if (id) elementInfo += '#' + id;
          if (classes) elementInfo += '.' + classes.split(' ')[0];
          elementInfo += ' ("' + textContent + '...")';
          
          window.parent.postMessage({
            type: 'element-clicked',
            elementInfo: elementInfo,
            position: { x: rect.left + window.scrollX, y: rect.top + window.scrollY }
          }, '*');
        }, true);
      })();
    `;

    try {
      const doc = iframe.contentDocument;
      if (doc) {
        const scriptEl = doc.createElement('script');
        scriptEl.textContent = script;
        doc.body?.appendChild(scriptEl);
      }
    } catch (e) {
      console.error('Could not inject edit mode script:', e);
    }
  }, [iframeRef]);

  const removeClickHandler = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    try {
      const doc = iframe.contentDocument;
      if (doc) {
        const script = `window.__editModeActive = false;`;
        const scriptEl = doc.createElement('script');
        scriptEl.textContent = script;
        doc.body?.appendChild(scriptEl);
      }
    } catch (e) {
      console.error('Could not remove edit mode script:', e);
    }
  }, [iframeRef]);

  const handleToggle = () => {
    if (!isActive) {
      injectClickHandler();
      window.addEventListener('message', handleIframeClick);
    } else {
      removeClickHandler();
      window.removeEventListener('message', handleIframeClick);
      setShowOptions(false);
      setSelectedElement(null);
    }
    onToggle();
  };

  const handleOptionClick = (option: typeof editOptions[0]) => {
    if (!selectedElement) return;
    
    const command = `${option.label} : ${selectedElement}`;
    onEditCommand(command);
    setShowOptions(false);
    setSelectedElement(null);
    onToggle();
  };

  return (
    <>
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        className={isActive ? "bg-primary text-primary-foreground" : ""}
      >
        <MousePointer2 className="w-4 h-4 mr-1" />
        {isActive ? "Mode édition actif" : "Edit"}
      </Button>

      {/* Edit Options Popup */}
      {showOptions && selectedElement && (
        <div 
          className="fixed z-[100] bg-card border border-border rounded-xl shadow-xl p-2 min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-200"
          style={{ 
            left: Math.min(optionsPosition.x, window.innerWidth - 220),
            top: Math.min(optionsPosition.y + 40, window.innerHeight - 200)
          }}
        >
          <div className="flex items-center justify-between mb-2 px-2 py-1">
            <span className="text-xs text-muted-foreground font-medium">Modifier</span>
            <button 
              onClick={() => {
                setShowOptions(false);
                setSelectedElement(null);
              }}
              className="p-1 rounded hover:bg-secondary"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="text-xs text-primary px-2 py-1 mb-2 bg-primary/10 rounded-lg truncate">
            {selectedElement}
          </div>
          
          {editOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors text-left"
            >
              <option.icon className="w-4 h-4 text-primary" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
