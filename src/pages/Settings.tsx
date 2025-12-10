import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionPanel } from '@/components/subscription/SubscriptionPanel';
import { CreditsDashboard } from '@/components/subscription/CreditsDashboard';
import { useCredits } from '@/hooks/useCredits';
import { 
  Users, 
  CreditCard, 
  Cloud, 
  Shield, 
  User, 
  Beaker, 
  Link2, 
  X,
  Check,
  History
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SettingsTab = 'plans' | 'cloud' | 'privacy' | 'account' | 'labs' | 'integrations' | 'github' | 'people';

const Settings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('plans');
  const { creditLogs, planLimits } = useCredits();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userEmail = user?.email || "user@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const workspaceNav = [
    { id: 'people' as const, label: 'People', icon: Users },
    { id: 'plans' as const, label: 'Plans & crédits', icon: CreditCard },
    { id: 'cloud' as const, label: 'Cloud & AI', icon: Cloud },
    { id: 'privacy' as const, label: 'Confidentialité', icon: Shield },
  ];

  const accountNav = [
    { id: 'account' as const, label: 'Votre compte', icon: User },
    { id: 'labs' as const, label: 'Labs', icon: Beaker },
  ];

  const integrationsNav = [
    { id: 'integrations' as const, label: 'Intégrations', icon: Link2 },
    { id: 'github' as const, label: 'GitHub', icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    )},
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'consumption': 'Génération IA',
      'daily_refill': 'Recharge quotidienne',
      'subscription_activated': 'Abonnement activé',
      'subscription_reactivated': 'Abonnement réactivé',
      'subscription_canceled': 'Abonnement annulé',
      'downgrade': 'Rétrogradation',
    };
    return labels[action] || action;
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-border bg-background flex flex-col">
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {/* Workspace Section */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Workspace
            </h3>
            
            {/* User */}
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {userInitial}
              </div>
              <span className="text-sm text-foreground truncate">{userEmail}</span>
            </div>

            {/* Nav Items */}
            <nav className="space-y-1">
              {workspaceNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Compte
            </h3>
            <nav className="space-y-1">
              {accountNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Integrations Section */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Intégrations
            </h3>
            <nav className="space-y-1">
              {integrationsNav.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <IconComponent />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border">
          <h1 className="text-2xl font-semibold text-foreground">
            {activeTab === 'plans' && 'Plans & crédits'}
            {activeTab === 'cloud' && 'Cloud & AI'}
            {activeTab === 'privacy' && 'Confidentialité'}
            {activeTab === 'account' && 'Votre compte'}
            {activeTab === 'labs' && 'Labs'}
            {activeTab === 'integrations' && 'Intégrations'}
            {activeTab === 'github' && 'GitHub'}
            {activeTab === 'people' && 'Équipe'}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'plans' && (
            <div className="space-y-8 max-w-4xl">
              {/* Subscription & Credits Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SubscriptionPanel />
                <CreditsDashboard />
              </div>

              {/* Credit History */}
              <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Historique des crédits</h3>
                </div>

                {creditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucune activité récente
                  </p>
                ) : (
                  <div className="space-y-3">
                    {creditLogs.slice(0, 10).map((log) => (
                      <div 
                        key={log.id} 
                        className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            log.amount > 0 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {log.amount > 0 ? '+' : '−'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{getActionLabel(log.action_type)}</p>
                            <p className="text-xs text-muted-foreground">{log.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            log.amount > 0 ? 'text-green-500' : 'text-foreground'
                          }`}>
                            {log.amount > 0 ? '+' : ''}{log.amount} crédits
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(log.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="max-w-xl">
              <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-medium">
                    {userInitial}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{userEmail}</h3>
                    <p className="text-sm text-muted-foreground">
                      Plan {planLimits?.name || 'Free'}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors">
                  Supprimer le compte
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'plans' && activeTab !== 'account' && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Bientôt disponible...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
