import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { HostingPanel } from '@/components/hosting/HostingPanel';
import { AIStatusMessages, useAIStatus } from '@/components/builder/AIStatusMessages';
import { VisualEditMode } from '@/components/builder/VisualEditMode';
import { ImageUploadButton } from '@/components/builder/ImageUpload';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Download, 
  ExternalLink,
  Coins,
  ArrowLeft,
  Code,
  Eye,
  Globe,
  Settings,
  X,
  ImagePlus
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  image?: string;
}

interface Project {
  id: string;
  name: string;
  current_html: string | null;
  site_structure: unknown;
}

const Builder = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [showHostingPanel, setShowHostingPanel] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const { phase, startGeneration, completeGeneration, resetStatus } = useAIStatus();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && projectId) {
      fetchProject();
      fetchMessages();
    }
  }, [user, projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle messages from iframe for visual edit mode
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'element-clicked' && isEditMode) {
        // Auto-populate the chat with an edit command
        const editCommand = `Modifie cet élément: ${e.data.elementInfo}`;
        setInputValue(editCommand);
        setIsEditMode(false);
        inputRef.current?.focus();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isEditMode]);

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Projet introuvable",
        description: "Ce projet n'existe pas ou vous n'y avez pas accès",
        variant: "destructive",
      });
      navigate('/projects');
      return;
    }

    setProject(data);
    setIsLoadingProject(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('project_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data as Message[]);
    }
  };

  const handleImageUpload = (prompt: string, imageData: string) => {
    setPendingImage(imageData);
    setInputValue(prompt);
    toast({
      title: "Image ajoutée 📷",
      description: "L'IA va analyser cette référence visuelle",
    });
  };

  const handleEditCommand = (command: string) => {
    setInputValue(command);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating || !user || !profile) return;

    // Check tokens
    if (profile.plan === 'free' && profile.token_balance < 5) {
      toast({
        title: "Plus de tokens",
        description: "Passez au plan Pro pour continuer à générer des sites",
        variant: "destructive",
      });
      return;
    }

    const userMessage = inputValue.trim();
    const imageToSend = pendingImage;
    setInputValue('');
    setPendingImage(null);
    setIsGenerating(true);

    // Add user message to UI
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
      image: imageToSend || undefined,
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      // Start AI status animation
      await startGeneration(!!project?.current_html);

      // Call edge function
      const { data, error } = await supabase.functions.invoke('generate-website-v2', {
        body: {
          projectId,
          message: userMessage,
          currentHtml: project?.current_html || null,
          siteStructure: project?.site_structure || {},
          imageData: imageToSend || null,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Update project with new HTML
      await supabase
        .from('projects')
        .update({
          current_html: data.html,
          site_structure: data.structure || {},
        })
        .eq('id', projectId);

      // Refresh profile to get updated token balance
      await refreshProfile();

      // Complete AI status animation
      completeGeneration();

      // Add assistant message
      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || "J'ai mis à jour ton site ! 🎨",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update local project state
      setProject(prev => prev ? { ...prev, current_html: data.html, site_structure: data.structure || {} } : null);

    } catch (error) {
      console.error('Generation error:', error);
      resetStatus();
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
      // Remove temp user message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!project?.current_html) return;

    const blob = new Blob([project.current_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name || 'site'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Téléchargement lancé",
      description: "Votre fichier HTML est en cours de téléchargement",
    });
  };

  const handleOpenInNewTab = () => {
    if (!project?.current_html) return;

    const blob = new Blob([project.current_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = profile && (profile.plan !== 'free' || profile.token_balance >= 5);

  if (loading || isLoadingProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">{project?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Token Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {profile?.token_balance ?? 0} / 1000
            </span>
          </div>

          {/* Publish Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowHostingPanel(true)}
            disabled={!project?.current_html}
          >
            <Globe className="w-4 h-4 mr-1" />
            Publier
          </Button>

          {/* Settings Link */}
          <Link to="/settings">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>

          <Link to="/pricing">
            <Button variant="outline" size="sm">
              Mettre à niveau
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="w-[400px] border-r border-border flex flex-col bg-card/50">
          {/* Chat Header */}
          <div className="p-4 border-b border-border/50">
            <p className="text-sm text-muted-foreground">
              Décris ton site, l'IA s'occupe du reste ✨
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  Commence par décrire le site que tu veux créer
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  Ex: "Crée un site pour un coach sportif avec une section témoignages"
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  💡 Tu peux aussi uploader une image pour m'inspirer !
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Reference" 
                      className="w-full max-h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {/* AI Status Messages */}
            {isGenerating && (
              <AIStatusMessages phase={phase} />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50">
            {!canSend && (
              <div className="mb-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  Tu as utilisé tous tes tokens gratuits
                </p>
                <Link to="/pricing" className="text-xs text-primary hover:underline">
                  Voir les offres →
                </Link>
              </div>
            )}

            {/* Pending Image Preview */}
            {pendingImage && (
              <div className="mb-3 relative">
                <img 
                  src={pendingImage} 
                  alt="Reference" 
                  className="w-full max-h-24 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => setPendingImage(null)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              {/* Image Upload Button */}
              <ImageUploadButton 
                onImageAnalyzed={handleImageUpload}
                disabled={!canSend || isGenerating}
              />
              
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={canSend ? "Décris ta modification..." : "Passe au plan Pro pour continuer"}
                disabled={!canSend || isGenerating}
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none disabled:opacity-50"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || !canSend || isGenerating}
                className="btn-primary px-4"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Chaque requête consomme 5 tokens • Il te reste {profile?.token_balance ?? 0} tokens
            </p>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col bg-secondary/20">
          {/* Preview Header */}
          <div className="h-12 px-4 border-b border-border/50 flex items-center justify-between bg-card/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCode(false)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !showCode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Preview
              </button>
              <button
                onClick={() => setShowCode(true)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  showCode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Code className="w-4 h-4 inline mr-1" />
                Code
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Visual Edit Mode Button */}
              {project?.current_html && !showCode && (
                <VisualEditMode
                  isActive={isEditMode}
                  onToggle={() => setIsEditMode(!isEditMode)}
                  onEditCommand={handleEditCommand}
                  iframeRef={iframeRef}
                />
              )}

              {project?.current_html && (
                <>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Plein écran
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-hidden">
            {!project?.current_html ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <p className="text-muted-foreground">
                    Ton site apparaîtra ici
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Décris ton projet dans le chat pour commencer
                  </p>
                </div>
              </div>
            ) : showCode ? (
              <div className="h-full overflow-auto p-4">
                <pre className="text-xs text-muted-foreground font-mono bg-card p-4 rounded-xl overflow-x-auto">
                  {project.current_html}
                </pre>
              </div>
            ) : (
              <div className="h-full p-2">
                <div className={`h-full rounded-xl overflow-hidden bg-white shadow-lg ${isEditMode ? 'ring-2 ring-primary' : ''}`}>
                  <iframe
                    ref={iframeRef}
                    srcDoc={project.current_html}
                    title="Site Preview"
                    className="w-full h-full"
                    sandbox="allow-scripts"
                  />
                </div>
                {isEditMode && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-lg animate-pulse">
                    🎯 Clique sur un élément pour le modifier
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hosting Panel Modal */}
      {showHostingPanel && projectId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Publication & Hébergement</h2>
              <button 
                onClick={() => setShowHostingPanel(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <HostingPanel projectId={projectId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Builder;
