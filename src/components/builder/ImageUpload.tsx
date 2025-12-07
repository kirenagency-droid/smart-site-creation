import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageAnalyzed: (description: string, imageData: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageAnalyzed, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Veuillez uploader une image (PNG, JPG, WEBP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreviewUrl(base64);
        
        // Create a prompt for the AI to analyze and reproduce the design
        const analysisPrompt = `[IMAGE UPLOADÉE] Voici un screenshot d'un site web. Analyse cette image et reproduis le design en HTML/Tailwind. 
        
Identifie :
- La structure et le layout
- Les couleurs et le style graphique
- Les sections présentes
- La typographie et le spacing

Génère un site moderne inspiré de cette référence visuelle.`;
        
        onImageAnalyzed(analysisPrompt, base64);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearPreview = () => {
    setPreviewUrl(null);
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

      {previewUrl ? (
        <div className="relative group">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full max-h-32 object-cover rounded-lg border border-border"
          />
          <button
            onClick={clearPreview}
            className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed cursor-pointer transition-all
            ${isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <ImagePlus className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {isDragging ? "Déposez l'image ici" : "Ajouter une image de référence"}
          </span>
        </div>
      )}
    </div>
  );
}

// Compact button version for chat input
export function ImageUploadButton({ onImageAnalyzed, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format invalide",
        description: "Veuillez uploader une image (PNG, JPG, WEBP)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        
        const analysisPrompt = `[IMAGE UPLOADÉE] Analyse cette image et reproduis le design en HTML/Tailwind moderne. Génère un site inspiré de cette référence visuelle.`;
        
        onImageAnalyzed(analysisPrompt, base64);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <>
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
        className="shrink-0"
        title="Uploader une image de référence"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImagePlus className="w-4 h-4" />
        )}
      </Button>
    </>
  );
}
