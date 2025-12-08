import { useState, useRef, useCallback } from 'react';
import { ImagePlus, X, Loader2, Upload, Sparkles, Palette, Copy, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageAnalyzed: (prompt: string, imageData: string) => void;
  disabled?: boolean;
}

const imageActionOptions = [
  { id: 'reproduce', label: 'Reproduire ce design', icon: Copy, prompt: 'Reproduis exactement ce design en HTML/Tailwind. Conserve la structure, les couleurs et le style.' },
  { id: 'modern', label: 'Version plus moderne', icon: Wand2, prompt: 'Crée une version plus moderne et premium de ce design. Garde la structure mais améliore le style avec des effets contemporains.' },
  { id: 'colors', label: 'Extraire les couleurs', icon: Palette, prompt: 'Analyse cette image et génère un site utilisant exactement la même palette de couleurs.' },
  { id: 'inspire', label: "M'inspirer du style", icon: Sparkles, prompt: "Inspire-toi du style de cette image pour créer un site original avec la même ambiance visuelle." },
];

export function ImageUpload({ onImageAnalyzed, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Seules les images (PNG, JPG, WEBP) sont acceptées",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreviewUrl(base64);
        setShowOptions(true);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleOptionSelect = (option: typeof imageActionOptions[0]) => {
    if (!previewUrl) return;
    
    onImageAnalyzed(option.prompt, previewUrl);
    setShowOptions(false);
    setPreviewUrl(null);
    
    toast({
      title: "Image envoyée 📷",
      description: `L'IA va ${option.id === 'reproduce' ? 'reproduire' : 'analyser'} ce design`,
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setShowOptions(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {showOptions && previewUrl ? (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-32 object-cover rounded-lg border border-border"
            />
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm font-medium text-foreground">Que veux-tu faire avec cette image ?</p>
          
          <div className="grid grid-cols-2 gap-2">
            {imageActionOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-foreground bg-secondary hover:bg-secondary/80 transition-colors text-left border border-transparent hover:border-primary/20"
              >
                <option.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all
            ${isDragging 
              ? 'border-primary bg-primary/10 scale-[1.02]' 
              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {isDragging ? "Dépose ton image ici" : "Ajoute une image de référence"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Screenshot, maquette, ou design que tu veux reproduire
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Compact button version for chat input
export function ImageUploadButton({ onImageAnalyzed, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Seules les images sont acceptées",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPendingImage(base64);
        setShowQuickActions(true);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (action: typeof imageActionOptions[0]) => {
    if (!pendingImage) return;
    onImageAnalyzed(action.prompt, pendingImage);
    setShowQuickActions(false);
    setPendingImage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isProcessing}
        className="shrink-0 hover:bg-primary/10"
        title="Uploader une image de référence"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImagePlus className="w-4 h-4" />
        )}
      </Button>

      {/* Quick Actions Popup */}
      {showQuickActions && pendingImage && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-card border border-border rounded-xl shadow-xl p-3 space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-200 z-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Action sur l'image</span>
            <button 
              onClick={() => {
                setShowQuickActions(false);
                setPendingImage(null);
              }}
              className="p-1 rounded hover:bg-secondary"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <img 
            src={pendingImage} 
            alt="Preview" 
            className="w-full h-20 object-cover rounded-lg border border-border"
          />
          
          <div className="space-y-1">
            {imageActionOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleQuickAction(option)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors text-left"
              >
                <option.icon className="w-4 h-4 text-primary shrink-0" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Full drag and drop zone for chat area
interface ChatDropZoneProps {
  onImageDrop: (prompt: string, imageData: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function ChatDropZone({ onImageDrop, disabled, children }: ChatDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const prompt = "Analyse cette image et reproduis le design en HTML/Tailwind. Crée un site moderne inspiré de cette référence.";
      onImageDrop(prompt, base64);
      toast({
        title: "Image reçue 📷",
        description: "L'IA analyse ton design...",
      });
    };
    reader.readAsDataURL(file);
  }, [disabled, onImageDrop]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className="relative flex-1 flex flex-col"
    >
      {children}
      
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-50 animate-in fade-in-0 duration-200">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <ImagePlus className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">Dépose ton image ici</p>
            <p className="text-sm text-muted-foreground mt-1">L'IA va analyser et reproduire ce design</p>
          </div>
        </div>
      )}
    </div>
  );
}
