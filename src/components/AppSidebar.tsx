import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Search, 
  LayoutGrid, 
  Star, 
  Users, 
  Compass, 
  Layout, 
  GraduationCap,
  Gift,
  Zap,
  ChevronDown,
  PanelLeft,
  Settings,
  Moon,
  HelpCircle,
  FileText,
  Users2,
  LogOut,
  Check,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCredits } from "@/hooks/useCredits";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";

const mainNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search", url: "/search", icon: Search },
];

const projectItems = [
  { title: "All projects", url: "/projects", icon: LayoutGrid },
  { title: "Starred", url: "/starred", icon: Star },
  { title: "Shared with me", url: "/shared", icon: Users },
];

const resourceItems = [
  { title: "Discover", url: "/discover", icon: Compass },
  { title: "Templates", url: "/templates", icon: Layout },
  { title: "Learn", url: "/learn", icon: GraduationCap },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { themeColor, setThemeColor, themeMode, setThemeMode } = useTheme();
  const { credits, planLimits } = useCredits();
  const { subscription } = useSubscription();

  const isActive = (path: string) => location.pathname === path;

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const userEmail = user?.email || "user@example.com";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Credit calculation
  const maxCredits = planLimits?.max_credit_pool || 100;
  const currentCredits = credits || 0;
  const creditPercentage = Math.min((currentCredits / maxCredits) * 100, 100);

  // Plan display name
  const getPlanName = () => {
    const plan = subscription?.plan || 'free';
    const planNames: Record<string, string> = {
      'free': 'Free Plan',
      'pro': 'Pro Plan',
      'pro_plus': 'Pro+ Plan',
      'pro_max': 'Pro Max',
      'pro_ultra': 'Pro Ultra',
      'pro_extreme': 'Pro Extreme'
    };
    return planNames[plan] || 'Free Plan';
  };

  const isPro = subscription?.plan && subscription.plan !== 'free';

  return (
    <Sidebar 
      className="border-r border-border/50 bg-background/95 backdrop-blur-xl"
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        {/* Logo */}
        <div className="flex items-center justify-between mb-5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow duration-300">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-foreground">Creali</span>
            )}
          </Link>
          {!collapsed && (
            <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-all duration-200">
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Popover */}
        {!collapsed && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3.5 py-3 bg-secondary/40 hover:bg-secondary/60 rounded-xl transition-all duration-200 border border-transparent hover:border-border/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-sm">
                  {userInitial}
                </div>
                <span className="flex-1 text-left text-sm text-foreground truncate font-medium">
                  {userEmail}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              side="bottom" 
              align="start" 
              className="w-72 p-0 bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-elevated"
            >
              {/* User Header */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold shadow-sm">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{userEmail}</p>
                  <p className="text-xs text-muted-foreground">{getPlanName()} • 1 member</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 px-4 py-3 border-b border-border/50">
                <button 
                  onClick={() => navigate("/settings")}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors text-sm font-medium text-foreground"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors text-sm font-medium text-foreground"
                >
                  <Users2 className="w-4 h-4" />
                  Invite
                </button>
              </div>

              {/* Credits Section */}
              <div className="px-4 py-4">
                <button 
                  onClick={() => navigate("/settings")}
                  className="w-full flex items-center justify-between mb-3 group"
                >
                  <span className="text-sm font-medium text-foreground">Credits</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>{currentCredits.toLocaleString()} left</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
                <Progress value={creditPercentage} className="h-2 mb-2" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Using {isPro ? 'monthly' : 'daily'} credits</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive(item.url) 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        <SidebarGroup className="mt-6">
          {!collapsed && (
            <SidebarGroupLabel className="px-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Projects
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {projectItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive(item.url) 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        <SidebarGroup className="mt-6">
          {!collapsed && (
            <SidebarGroupLabel className="px-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Resources
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive(item.url) 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      {!collapsed && (
        <SidebarFooter className="p-3 space-y-2.5">
          {/* Share Card */}
          <button className="group w-full flex items-center justify-between px-4 py-3.5 bg-secondary/40 hover:bg-secondary/60 rounded-xl transition-all duration-200 border border-transparent hover:border-border/50">
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Share Creali</p>
              <p className="text-xs text-muted-foreground">Get 10 credits each</p>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-background/60 rounded-xl">
              <Gift className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </button>

          {/* Upgrade Card */}
          <button className="group w-full flex items-center justify-between px-4 py-3.5 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all duration-200 border border-primary/10 hover:border-primary/20">
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Upgrade to Pro</p>
              <p className="text-xs text-muted-foreground">Unlock all features</p>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-primary rounded-xl shadow-sm">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
          </button>

          {/* User Avatar with Dropdown */}
          <div className="flex items-center justify-between pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shadow-soft hover:shadow-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background">
                  {userInitial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="top" 
                align="start" 
                className="w-64 bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-elevated z-50 mb-2"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold shadow-sm">
                    {userInitial}
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">{userEmail}</span>
                </div>
                
                <DropdownMenuSeparator className="bg-border/50" />
                
                {/* Settings */}
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary/50 focus:bg-secondary/50 rounded-lg mx-1"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                {/* Appearance */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary/50 focus:bg-secondary/50 rounded-lg mx-1">
                    <Moon className="w-4 h-4 text-muted-foreground" />
                    <span>Appearance</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-elevated z-50 p-3 min-w-[220px]">
                    {/* Color Theme Label */}
                    <p className="text-xs font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">Color theme</p>
                    
                    {/* Color Theme Previews */}
                    <div className="flex gap-2 mb-4 px-1">
                      {/* Purple */}
                      <button 
                        className={`w-12 h-9 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          themeColor === 'purple' ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-transparent hover:border-border hover:scale-105'
                        }`}
                        onClick={() => setThemeColor('purple')}
                        title="Purple"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600" />
                      </button>
                      {/* Yellow */}
                      <button 
                        className={`w-12 h-9 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          themeColor === 'yellow' ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-transparent hover:border-border hover:scale-105'
                        }`}
                        onClick={() => setThemeColor('yellow')}
                        title="Yellow"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500" />
                      </button>
                      {/* Blue */}
                      <button 
                        className={`w-12 h-9 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          themeColor === 'blue' ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-transparent hover:border-border hover:scale-105'
                        }`}
                        onClick={() => setThemeColor('blue')}
                        title="Blue"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500" />
                      </button>
                      {/* Green */}
                      <button 
                        className={`w-12 h-9 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          themeColor === 'green' ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-transparent hover:border-border hover:scale-105'
                        }`}
                        onClick={() => setThemeColor('green')}
                        title="Green"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-green-400 via-emerald-500 to-green-600" />
                      </button>
                    </div>

                    <DropdownMenuSeparator className="bg-border/50 my-2" />
                    
                    {/* Mode Options */}
                    <p className="text-xs font-semibold text-muted-foreground mb-2 px-1 uppercase tracking-wider">Mode</p>
                    <DropdownMenuItem 
                      className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-secondary/50 rounded-lg"
                      onClick={() => setThemeMode('light')}
                    >
                      <span>Light</span>
                      {themeMode === 'light' && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-secondary/50 rounded-lg"
                      onClick={() => setThemeMode('dark')}
                    >
                      <span>Dark</span>
                      {themeMode === 'dark' && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-secondary/50 rounded-lg"
                      onClick={() => setThemeMode('system')}
                    >
                      <span>System</span>
                      {themeMode === 'system' && <Check className="w-4 h-4 text-primary" />}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* Support */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary/50 focus:bg-secondary/50 rounded-lg mx-1">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span>Support</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-elevated z-50">
                    <DropdownMenuItem className="px-3 py-2.5 cursor-pointer hover:bg-secondary/50 rounded-lg mx-1">Help Center</DropdownMenuItem>
                    <DropdownMenuItem className="px-3 py-2.5 cursor-pointer hover:bg-secondary/50 rounded-lg mx-1">Contact Us</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* Documentation */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary/50 focus:bg-secondary/50 rounded-lg mx-1">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>Documentation</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-elevated z-50">
                    <DropdownMenuItem className="px-3 py-2.5 cursor-pointer hover:bg-secondary/50 rounded-lg mx-1">Getting Started</DropdownMenuItem>
                    <DropdownMenuItem className="px-3 py-2.5 cursor-pointer hover:bg-secondary/50 rounded-lg mx-1">API Reference</DropdownMenuItem>
                    <DropdownMenuItem className="px-3 py-2.5 cursor-pointer hover:bg-secondary/50 rounded-lg mx-1">Changelog</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* Community */}
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary/50 focus:bg-secondary/50 rounded-lg mx-1">
                  <Users2 className="w-4 h-4 text-muted-foreground" />
                  <span>Community</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-border/50" />
                
                {/* Sign Out */}
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive rounded-lg mx-1"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

export default AppSidebar;