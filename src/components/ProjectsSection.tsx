import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Clock, Sparkles } from "lucide-react";
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

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const tabs = [
    { id: "recent" as const, label: "Recently viewed", icon: Clock },
    { id: "myprojects" as const, label: "My projects", icon: null },
    { id: "templates" as const, label: "Templates", icon: Sparkles },
  ];

  if (!user) {
    return null;
  }

  return (
    <section className="relative bg-background border-t border-border/50">
      <div className="container-wide py-14">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-1 p-1.5 bg-secondary/60 backdrop-blur-sm rounded-xl border border-border/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            to="/projects"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors link-underline"
          >
            Browse all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] bg-secondary/60 rounded-2xl mb-4" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                    <div className="h-3 bg-secondary/60 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Start building your first website with AI. Just describe what you need.
            </p>
            <button
              onClick={() => navigate("/projects")}
              className="btn-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create my first site
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                to={`/app/${project.id}`}
                className="group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Preview Card */}
                <div className="relative aspect-[16/10] bg-card rounded-2xl overflow-hidden border border-border group-hover:border-primary/30 transition-all duration-300 mb-4 shadow-soft group-hover:shadow-card">
                  {project.current_html ? (
                    <iframe
                      srcDoc={project.current_html}
                      className="w-full h-full pointer-events-none scale-[0.25] origin-top-left"
                      style={{ width: '400%', height: '400%' }}
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-mesh">
                      <span className="text-sm text-muted-foreground">Preview unavailable</span>
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Status Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1.5 text-xs font-medium bg-background/90 backdrop-blur-sm text-foreground rounded-lg border border-border/50">
                      Published
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-soft">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
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