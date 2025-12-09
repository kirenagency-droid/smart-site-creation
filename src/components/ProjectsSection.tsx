import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  const [activeTab, setActiveTab] = useState<"recent" | "myprojects" | "templates">("recent");
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
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
    return date.toLocaleDateString("fr-FR");
  };

  const tabs = [
    { id: "recent" as const, label: "Recently viewed" },
    { id: "myprojects" as const, label: "My projects" },
    { id: "templates" as const, label: "Templates" },
  ];

  if (!user) {
    return null;
  }

  return (
    <section className="relative bg-card/50 backdrop-blur-sm border-t border-border">
      <div className="container-wide py-12">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            to="/projects"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-secondary rounded-xl mb-4" />
                <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Aucun projet pour le moment</p>
            <button
              onClick={() => navigate("/projects")}
              className="btn-primary"
            >
              Créer mon premier site
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/app?project=${project.id}`}
                className="group cursor-pointer"
              >
                {/* Preview Card */}
                <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden border border-border group-hover:border-primary/30 transition-all duration-300 mb-4">
                  {project.current_html ? (
                    <iframe
                      srcDoc={project.current_html}
                      className="w-full h-full pointer-events-none scale-[0.25] origin-top-left"
                      style={{ width: '400%', height: '400%' }}
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-sm">Aperçu non disponible</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm text-foreground rounded-md border border-border">
                      Published
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeAgo(project.updated_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
