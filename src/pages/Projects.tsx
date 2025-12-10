import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Plus, Sparkles, Folder, Calendar, Trash2, Loader2, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
interface Project {
  id: string;
  name: string;
  description: string | null;
  business_type: string | null;
  created_at: string;
  updated_at: string;
}
const Projects = () => {
  const {
    user,
    profile,
    loading,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);
  const fetchProjects = async () => {
    try {
      // Refresh session before making request
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // Try to refresh
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST303') {
          // JWT expired, try to refresh and retry
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            navigate('/auth');
            return;
          }
          // Retry the request
          const { data: retryData, error: retryError } = await supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false });
          
          if (!retryError) {
            setProjects(retryData || []);
          }
        } else {
          console.error('Error fetching projects:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger vos projets",
            variant: "destructive"
          });
        }
      } else {
        setProjects(data || []);
      }
    } catch (err) {
      console.error('Error in fetchProjects:', err);
    } finally {
      setIsLoading(false);
    }
  };
  const createProject = async () => {
    if (!newProjectName.trim() || !user) return;
    setIsCreating(true);
    
    try {
      // Refresh session before creating
      await supabase.auth.refreshSession();
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: newProjectName.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        if (error.code === 'PGRST303') {
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }
        toast({
          title: "Erreur",
          description: "Impossible de créer le projet",
          variant: "destructive"
        });
      } else if (data) {
        toast({
          title: "Projet créé ! 🎉",
          description: "Commencez à décrire votre site à l'IA"
        });
        navigate(`/app/${data.id}`);
      }
    } catch (err) {
      console.error('Error in createProject:', err);
    } finally {
      setIsCreating(false);
      setDialogOpen(false);
      setNewProjectName('');
    }
  };
  const deleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    const {
      error
    } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet",
        variant: "destructive"
      });
    } else {
      setProjects(projects.filter(p => p.id !== projectId));
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé"
      });
    }
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  if (loading || isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Penflow.ai</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Token Display */}
            

            <Link to="/pricing">
              <Button variant="outline" size="sm">
                Mettre à niveau
              </Button>
            </Link>

            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mes Projets</h1>
              <p className="text-muted-foreground mt-1">
                Créez et gérez vos sites web générés par IA
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau projet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau projet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input placeholder="Nom du projet (ex: Mon Restaurant)" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createProject()} />
                  <Button onClick={createProject} disabled={!newProjectName.trim() || isCreating} className="w-full btn-primary">
                    {isCreating ? <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                      </> : <>
                        <Plus className="w-4 h-4 mr-2" />
                        Créer le projet
                      </>}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <Folder className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Aucun projet
              </h2>
              <p className="text-muted-foreground mb-6">
                Créez votre premier site web avec l'IA
              </p>
              <Button onClick={() => setDialogOpen(true)} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Créer mon premier projet
              </Button>
            </div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map(project => <div key={project.id} onClick={() => navigate(`/app/${project.id}`)} className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <button onClick={e => deleteProject(project.id, e)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {project.name}
                  </h3>
                  {project.business_type && <span className="inline-block px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground mb-2">
                      {project.business_type}
                    </span>}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.updated_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>)}
            </div>}
        </div>
      </main>
    </div>;
};
export default Projects;