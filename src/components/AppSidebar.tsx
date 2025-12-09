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
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

  const isActive = (path: string) => location.pathname === path;

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const userEmail = user?.email || "user@example.com";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <Sidebar 
      className="border-r border-border bg-background"
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        {/* Logo */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600" />
          </Link>
          {!collapsed && (
            <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors">
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Dropdown */}
        {!collapsed && (
          <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors">
            <div className="w-7 h-7 rounded-full bg-primary/80 flex items-center justify-center text-primary-foreground text-sm font-medium">
              {userInitial}
            </div>
            <span className="flex-1 text-left text-sm text-foreground truncate">
              {userEmail}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive(item.url) 
                          ? "bg-secondary text-foreground" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Projects
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {projectItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive(item.url) 
                          ? "bg-secondary text-foreground" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Resources
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive(item.url) 
                          ? "bg-secondary text-foreground" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
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
        <SidebarFooter className="p-3 space-y-2">
          {/* Share Card */}
          <button className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors group">
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Share Creali</p>
              <p className="text-xs text-muted-foreground">Get 10 credits each</p>
            </div>
            <div className="w-9 h-9 flex items-center justify-center bg-background/50 rounded-lg">
              <Gift className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </button>

          {/* Upgrade Card */}
          <button className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-colors group">
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Upgrade to Business</p>
              <p className="text-xs text-muted-foreground">Unlock more benefits</p>
            </div>
            <div className="w-9 h-9 flex items-center justify-center bg-primary/20 rounded-lg">
              <Zap className="w-4 h-4 text-primary" />
            </div>
          </button>

          {/* User Avatar with Dropdown */}
          <div className="flex items-center justify-between pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  {userInitial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="top" 
                align="start" 
                className="w-64 bg-popover border border-border rounded-xl shadow-lg z-50 mb-2"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                    {userInitial}
                  </div>
                  <span className="text-sm text-foreground truncate">{userEmail}</span>
                </div>
                
                <DropdownMenuSeparator className="bg-border" />
                
                {/* Settings */}
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary focus:bg-secondary"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                {/* Appearance */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary focus:bg-secondary">
                    <Moon className="w-4 h-4 text-muted-foreground" />
                    <span>Appearance</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover border border-border rounded-xl shadow-lg z-50">
                    <DropdownMenuItem className="px-3 py-2 cursor-pointer hover:bg-secondary">Light</DropdownMenuItem>
                    <DropdownMenuItem className="px-3 py-2 cursor-pointer hover:bg-secondary">Dark</DropdownMenuItem>
                    <DropdownMenuItem className="px-3 py-2 cursor-pointer hover:bg-secondary">System</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* Support */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary focus:bg-secondary">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span>Support</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover border border-border rounded-xl shadow-lg z-50">
                    <DropdownMenuItem className="px-3 py-2 cursor-pointer hover:bg-secondary">Help Center</DropdownMenuItem>
                    <DropdownMenuItem className="px-3 py-2 cursor-pointer hover:bg-secondary">Contact Us</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* Documentation */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary focus:bg-secondary">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>Documentation</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover border border-border rounded-xl shadow-lg z-50">
                    <DropdownMenuItem className="px-3 py-2 cursor-pointer hover:bg-secondary">Getting Started</DropdownMenuItem>
                    <DropdownMenuItem className="px-3 py-2 cursor-pointer hover:bg-secondary">API Reference</DropdownMenuItem>
                    <DropdownMenuItem className="px-3 py-2 cursor-pointer hover:bg-secondary">Changelog</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                {/* Community */}
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary focus:bg-secondary">
                  <Users2 className="w-4 h-4 text-muted-foreground" />
                  <span>Community</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-border" />
                
                {/* Sign Out */}
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-secondary focus:bg-secondary text-destructive"
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
