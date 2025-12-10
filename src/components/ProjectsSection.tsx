import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Clock, Sparkles, Folder, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  current_html: string | null;
}

const ProjectsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, created_at, updated_at, current_html")
        .eq("user_id", user?.id)
        .order("updated_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "À l'instant";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
  };

  if (!user) {
    return null;
  }

  return (
    <section className="relative bg-background/50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Projets récents</h2>
              <p className="text-sm text-muted-foreground">Continuez là où vous vous êtes arrêté</p>
            </div>
          </div>

          <Link
            to="/projects"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="aspect-[16/10] bg-muted" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted/60 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed border-2 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucun projet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-sm">
                Créez votre premier site web avec l'IA. Décrivez simplement ce que vous voulez.
              </p>
              <button
                onClick={() => navigate("/projects")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Créer mon premier site
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                to={`/app/${project.id}`}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm">
                  {/* Preview */}
                  <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                    {project.current_html ? (
                      <iframe
                        srcDoc={project.current_html}
                        className="w-full h-full pointer-events-none scale-[0.25] origin-top-left"
                        style={{ width: '400%', height: '400%' }}
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Folder className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                        <ExternalLink className="w-4 h-4" />
                        Ouvrir
                      </span>
                    </div>
                  </div>

                  {/* Project Info */}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {project.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(project.updated_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* New Project Card */}
            <button
              onClick={() => navigate("/projects")}
              className="group"
            >
              <Card className="h-full overflow-hidden border-dashed border-2 border-border/50 hover:border-primary/30 transition-all duration-300 bg-transparent hover:bg-card/30">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] p-6">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Nouveau projet
                  </span>
                </CardContent>
              </Card>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
