import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Users, 
  ExternalLink, 
  Check, 
  X, 
  Clock,
  Globe,
  Loader2
} from "lucide-react";

interface SharedProject {
  id: string;
  project_id: string;
  owner_id: string;
  shared_with_email: string;
  permission: string;
  status: string;
  created_at: string;
  project?: {
    id: string;
    name: string;
    description: string | null;
    business_type: string | null;
    updated_at: string;
  };
  owner_email?: string;
}

const Shared = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [shares, setShares] = useState<SharedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSharedProjects();
    }
  }, [user]);

  const fetchSharedProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch shares where user is the recipient
      const { data: sharesData, error: sharesError } = await supabase
        .from('project_shares')
        .select('*')
        .or(`shared_with_user_id.eq.${user.id},shared_with_email.eq.${user.email}`);

      if (sharesError) throw sharesError;

      if (sharesData && sharesData.length > 0) {
        // Fetch project details for each share
        const projectIds = sharesData.map(s => s.project_id);
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, name, description, business_type, updated_at')
          .in('id', projectIds);

        // Fetch owner emails from profiles
        const ownerIds = [...new Set(sharesData.map(s => s.owner_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', ownerIds);

        // Combine data
        const enrichedShares = sharesData.map(share => ({
          ...share,
          project: projectsData?.find(p => p.id === share.project_id),
          owner_email: profilesData?.find(p => p.id === share.owner_id)?.email
        }));

        setShares(enrichedShares);
      } else {
        setShares([]);
      }
    } catch (error) {
      console.error('Error fetching shared projects:', error);
      toast.error("Erreur lors du chargement des projets partagés");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .update({ 
          status: 'accepted',
          shared_with_user_id: user?.id 
        })
        .eq('id', shareId);

      if (error) throw error;

      toast.success("Invitation acceptée !");
      fetchSharedProjects();
    } catch (error) {
      console.error('Error accepting share:', error);
      toast.error("Erreur lors de l'acceptation");
    }
  };

  const handleDeclineShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('project_shares')
        .update({ status: 'declined' })
        .eq('id', shareId);

      if (error) throw error;

      toast.success("Invitation refusée");
      fetchSharedProjects();
    } catch (error) {
      console.error('Error declining share:', error);
      toast.error("Erreur lors du refus");
    }
  };

  const openProject = (projectId: string) => {
    navigate(`/builder/${projectId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-500 border-green-500/30"><Check className="w-3 h-3 mr-1" /> Accepté</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-red-500 border-red-500/30"><X className="w-3 h-3 mr-1" /> Refusé</Badge>;
      default:
        return null;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'view': return 'Lecture';
      case 'edit': return 'Édition';
      case 'admin': return 'Admin';
      default: return permission;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingShares = shares.filter(s => s.status === 'pending');
  const acceptedShares = shares.filter(s => s.status === 'accepted');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Shared with me</h1>
              <p className="text-muted-foreground">Projets partagés avec vous par d'autres utilisateurs</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : shares.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Aucun projet partagé</h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    Quand quelqu'un partagera un projet avec vous, il apparaîtra ici.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Pending Invitations */}
                {pendingShares.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      Invitations en attente ({pendingShares.length})
                    </h2>
                    <div className="grid gap-4">
                      {pendingShares.map((share) => (
                        <Card key={share.id} className="border-yellow-500/20 bg-yellow-500/5">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-primary-foreground" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-foreground">
                                      {share.project?.name || 'Projet inconnu'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      Partagé par {share.owner_email || 'Utilisateur inconnu'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  {getStatusBadge(share.status)}
                                  <Badge variant="secondary">{getPermissionLabel(share.permission)}</Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeclineShare(share.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Refuser
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptShare(share.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Accepter
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Projects */}
                {acceptedShares.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      Projets accessibles ({acceptedShares.length})
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {acceptedShares.map((share) => (
                        <Card 
                          key={share.id} 
                          className="group cursor-pointer hover:border-primary/30 transition-all duration-200"
                          onClick={() => share.project && openProject(share.project.id)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                                <Globe className="w-5 h-5 text-primary-foreground" />
                              </div>
                              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">
                              {share.project?.name || 'Projet inconnu'}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              Par {share.owner_email || 'Utilisateur inconnu'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{getPermissionLabel(share.permission)}</Badge>
                              {share.project?.business_type && (
                                <Badge variant="outline">{share.project.business_type}</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Shared;