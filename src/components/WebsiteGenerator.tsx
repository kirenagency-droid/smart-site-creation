import { useState } from "react";
import { Sparkles, Loader2, Download, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const businessTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "coach", label: "Coach / Consultant" },
  { value: "business", label: "Business / Entreprise" },
  { value: "portfolio", label: "Portfolio / Créatif" },
  { value: "agence", label: "Agence" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS / Startup" },
  { value: "autre", label: "Autre" },
];

const WebsiteGenerator = () => {
  const [siteName, setSiteName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!businessDescription.trim()) {
      toast({
        title: "Description requise",
        description: "Décris ton activité pour générer un site.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedHtml(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-website', {
        body: {
          businessDescription: businessDescription.trim(),
          businessType: businessType || "business",
          siteName: siteName.trim() || "Mon Site",
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedHtml(data.html);
      setSiteId(data.siteId);

      toast({
        title: "Site généré ! 🎉",
        description: "Ton site est prêt. Tu peux le prévisualiser ci-dessous.",
      });

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedHtml) return;

    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteName || 'mon-site'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Téléchargement lancé",
      description: "Ton fichier HTML est en cours de téléchargement.",
    });
  };

  const handleOpenInNewTab = () => {
    if (!generatedHtml) return;

    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleReset = () => {
    setGeneratedHtml(null);
    setSiteId(null);
  };

  return (
    <section id="generator" className="section-padding bg-gradient-hero">
      <div className="container-narrow">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-primary text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Essayer maintenant
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Génère ton site en direct
          </h2>
          <p className="text-lg text-white/60">
            Décris ton activité et regarde la magie opérer.
          </p>
        </div>

        {!generatedHtml ? (
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-3xl p-8 space-y-6">
              {/* Site Name */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Ex: Mon Restaurant"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Type d'activité
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="" className="bg-gray-900">Sélectionne un type</option>
                  {businessTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-gray-900">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Décris ton activité *
                </label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Ex: Je suis coach sportif à Paris, je propose des séances de fitness personnalisées à domicile ou en plein air. Ma spécialité est la perte de poids et la remise en forme."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !businessDescription.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Générer mon site
                  </>
                )}
              </button>

              {isGenerating && (
                <p className="text-center text-white/50 text-sm">
                  L'IA crée ton site... Cela peut prendre 10 à 30 secondes.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleDownload}
                className="btn-primary"
              >
                <Download className="w-5 h-5 mr-2" />
                Télécharger HTML
              </button>
              <button
                onClick={handleOpenInNewTab}
                className="btn-secondary"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Ouvrir en plein écran
              </button>
              <button
                onClick={handleReset}
                className="btn-ghost text-white/70 hover:text-white border border-white/20 rounded-2xl"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Nouveau site
              </button>
            </div>

            {/* Preview */}
            <div className="glass rounded-3xl p-2 overflow-hidden">
              <div className="bg-secondary/50 rounded-t-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-background/50 rounded-lg border border-border/50 max-w-md mx-auto">
                    <span className="text-xs text-muted-foreground truncate">
                      {siteName || 'mon-site'}.siteforge.ai
                    </span>
                  </div>
                </div>
              </div>
              <iframe
                srcDoc={generatedHtml}
                title="Site Preview"
                className="w-full h-[600px] bg-white rounded-b-2xl"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WebsiteGenerator;
