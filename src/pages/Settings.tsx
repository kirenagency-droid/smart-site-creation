import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  ChevronDown
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

type SettingsTab = 'plans' | 'cloud' | 'privacy' | 'account' | 'labs' | 'integrations' | 'github' | 'people';

const Settings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('plans');
  const [annualPro, setAnnualPro] = useState(false);
  const [annualBusiness, setAnnualBusiness] = useState(false);

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
    { id: 'plans' as const, label: 'Plans & credits', icon: CreditCard },
    { id: 'cloud' as const, label: 'Cloud & AI balance', icon: Cloud },
    { id: 'privacy' as const, label: 'Privacy & security', icon: Shield },
  ];

  const accountNav = [
    { id: 'account' as const, label: 'Your Account', icon: User },
    { id: 'labs' as const, label: 'Labs', icon: Beaker },
  ];

  const integrationsNav = [
    { id: 'integrations' as const, label: 'Integrations', icon: Link2 },
    { id: 'github' as const, label: 'GitHub', icon: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    )},
  ];

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
              Account
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
              Integrations
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
            {activeTab === 'plans' && 'Plans & credits'}
            {activeTab === 'cloud' && 'Cloud & AI balance'}
            {activeTab === 'privacy' && 'Privacy & security'}
            {activeTab === 'account' && 'Your Account'}
            {activeTab === 'labs' && 'Labs'}
            {activeTab === 'integrations' && 'Integrations'}
            {activeTab === 'github' && 'GitHub'}
            {activeTab === 'people' && 'People'}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'plans' && (
            <div className="space-y-8">
              {/* Current Plan & Credits */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Plan */}
                <div className="bg-secondary/50 border border-border rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600" />
                    <div>
                      <h3 className="font-semibold text-foreground">You're on Pro Plan</h3>
                      <p className="text-sm text-muted-foreground">Renews Jan 9, 2026</p>
                      <button className="mt-3 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-sm font-medium transition-colors">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>

                {/* Credits Remaining */}
                <div className="bg-secondary/50 border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Credits remaining</h3>
                    <span className="text-sm text-muted-foreground">93.1 of 105</span>
                  </div>
                  <Progress value={88} className="h-2 mb-4" />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4" />
                      <span>Up to 100 credits rollover</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-4 h-4" />
                        <span>100 credits reset on 09 Jan at 4:49 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-muted-foreground">Using monthly credits</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Tiers */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pro */}
                <div className="bg-secondary/30 border border-border rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Pro</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Designed for fast-moving teams building together in real time.
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-foreground">$50</span>
                    <span className="text-muted-foreground">per month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">shared across unlimited users</p>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <Switch checked={annualPro} onCheckedChange={setAnnualPro} />
                    <span className="text-sm text-muted-foreground">Annual</span>
                  </div>

                  <button className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity mb-4">
                    Upgrade current plan
                  </button>

                  <button className="w-full flex items-center justify-between px-4 py-3 bg-secondary border border-border rounded-xl text-sm mb-6">
                    <span>200 credits / month</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <p className="text-sm text-muted-foreground mb-3">All features in Free, plus:</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4" />
                    <span>200 monthly credits</span>
                  </div>
                </div>

                {/* Business */}
                <div className="bg-secondary/30 border border-border rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Business</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Advanced controls and power features for growing departments.
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-foreground">$50</span>
                    <span className="text-muted-foreground">per month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">shared across unlimited users</p>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <Switch checked={annualBusiness} onCheckedChange={setAnnualBusiness} />
                    <span className="text-sm text-muted-foreground">Annual</span>
                  </div>

                  <button className="w-full py-3 bg-secondary hover:bg-secondary/80 border border-border text-foreground font-medium rounded-xl transition-colors mb-4">
                    Upgrade
                  </button>

                  <button className="w-full flex items-center justify-between px-4 py-3 bg-secondary border border-border rounded-xl text-sm mb-6">
                    <span>100 credits / month</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <p className="text-sm text-muted-foreground mb-3">All features in Pro, plus:</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4" />
                    <span>100 monthly credits</span>
                  </div>
                </div>

                {/* Enterprise */}
                <div className="bg-secondary/30 border border-border rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Enterprise</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Built for large orgs needing flexibility, scale, and governance.
                  </p>
                  
                  <p className="text-4xl font-bold text-foreground mb-2">Custom</p>
                  <p className="text-sm text-muted-foreground mb-10">Flexible plans</p>

                  <button className="w-full py-3 bg-secondary hover:bg-secondary/80 border border-border text-foreground font-medium rounded-xl transition-colors mb-6">
                    Book a demo
                  </button>

                  <p className="text-sm text-muted-foreground mb-3">All features in Business, plus:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4" />
                      <span>Dedicated support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4" />
                      <span>Onboarding services</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="max-w-xl">
              <div className="bg-secondary/30 border border-border rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-medium">
                    {userInitial}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{userEmail}</h3>
                    <p className="text-sm text-muted-foreground">Member since 2024</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'plans' && activeTab !== 'account' && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;