import { useState } from 'react';
import { 
  Menu, Sparkles, Zap, MessageSquare, CreditCard, HelpCircle, 
  ArrowRight, LayoutTemplate, Users, BarChart3, X, Plus, Check
} from 'lucide-react';
import { componentLibrary, ComponentTemplate, ComponentVariant } from '@/lib/componentLibrary';
import { Button } from '@/components/ui/button';

interface ComponentPickerProps {
  onSelectVariant: (variant: ComponentVariant) => void;
  onClose: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Menu,
  Sparkles,
  Zap,
  MessageSquare,
  CreditCard,
  HelpCircle,
  ArrowRight,
  LayoutTemplate,
  Users,
  BarChart3,
};

export function ComponentPicker({ onSelectVariant, onClose }: ComponentPickerProps) {
  const [selectedType, setSelectedType] = useState<ComponentTemplate['type']>('hero');
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  const currentComponent = componentLibrary.find(c => c.type === selectedType);

  const handleAddVariant = (variant: ComponentVariant) => {
    if (!selectedVariants.includes(variant.id)) {
      setSelectedVariants(prev => [...prev, variant.id]);
    }
    onSelectVariant(variant);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Bibliothèque de composants</h2>
            <p className="text-sm text-muted-foreground">Sélectionne des sections pour ton site</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Component Types */}
          <div className="w-48 border-r border-border p-2 overflow-y-auto shrink-0">
            {componentLibrary.map((component) => {
              const Icon = iconMap[component.icon] || Sparkles;
              return (
                <button
                  key={component.id}
                  onClick={() => setSelectedType(component.type)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === component.type
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {component.name}
                </button>
              );
            })}
          </div>

          {/* Main - Variants */}
          <div className="flex-1 p-4 overflow-y-auto">
            {currentComponent && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{currentComponent.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentComponent.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentComponent.variants.map((variant) => {
                    const isSelected = selectedVariants.includes(variant.id);
                    return (
                      <div
                        key={variant.id}
                        className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                        }`}
                        onClick={() => handleAddVariant(variant)}
                      >
                        {/* Preview thumbnail */}
                        <div className="aspect-video rounded-lg bg-secondary/50 mb-3 overflow-hidden relative">
                          <div 
                            className="w-full h-full transform scale-[0.25] origin-top-left"
                            style={{ width: '400%', height: '400%' }}
                          >
                            <iframe
                              srcDoc={`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script><style>body{margin:0;}</style></head><body>${variant.html}</body></html>`}
                              className="w-full h-full pointer-events-none"
                              title={variant.name}
                            />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{variant.name}</h4>
                            <p className="text-xs text-muted-foreground">{variant.preview}</p>
                          </div>
                          
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-border group-hover:border-primary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border shrink-0 bg-secondary/30">
          <div className="text-sm text-muted-foreground">
            {selectedVariants.length > 0 && (
              <span>{selectedVariants.length} composant(s) ajouté(s)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={onClose} disabled={selectedVariants.length === 0}>
              Appliquer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Button to open the component picker
 */
interface ComponentPickerButtonProps {
  onSelectVariant: (variant: ComponentVariant) => void;
}

export function ComponentPickerButton({ onSelectVariant }: ComponentPickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <LayoutTemplate className="w-3.5 h-3.5" />
        Composants
      </button>

      {isOpen && (
        <ComponentPicker
          onSelectVariant={onSelectVariant}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
