import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Folder, ExternalLink } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (!user) {
    return null;
  }

  return (
    <section ref={sectionRef} className="relative bg-background border-t border-border/50">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div 
          className={`flex items-center justify-between mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Recent projects</h2>
            <p className="text-sm text-muted-foreground mt-1">Pick up where you left off</p>
          </div>

          <Link
            to="/projects"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card animate-pulse">
                <div className="aspect-[16/10] bg-muted" />
                <div className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted/60 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div 
            className={`rounded-xl border-2 border-dashed border-border bg-card/30 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '0.2s' }}
          >
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6">
                <Plus className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-8 text-center max-w-xs">
                Create your first AI-generated website. Just describe what you want.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all"
              >
                Create project
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                to={`/app/${project.id}`}
                className={`group block transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${0.1 + index * 0.08}s` }}
              >
                <div className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group-hover:-translate-y-1">
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
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <Folder className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground font-medium text-sm shrink-0">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatTimeAgo(project.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* New Project Card */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`group text-left transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${0.1 + projects.length * 0.08}s` }}
            >
              <div className="h-full rounded-xl border-2 border-dashed border-border bg-transparent overflow-hidden transition-all duration-300 hover:border-primary/30 hover:bg-card/50 group-hover:-translate-y-1">
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6">
                  <div className="w-10 h-10 rounded-lg bg-secondary group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    New project
                  </span>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsSection;
