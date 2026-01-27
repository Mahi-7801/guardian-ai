import {
  Search,
  Bell,
  User,
  Shield,
  LogOut,
  Settings,
  UserCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Menu,
  X,
  LayoutDashboard,
  AlertTriangle,
  Activity,
  Network,
  Brain,
  MessageSquare,
  Shield as ShieldIcon,
  BookOpen,
  Users,
  FileText,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { insforge, AI_STATUS } from "@/lib/insforge";
import { API_BASE_URL } from "@/lib/api-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAiOnline = AI_STATUS.isOnline;
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const role = localStorage.getItem('user_role') || 'user';
    setUserRole(role);
  }, []);

  const baseNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: AlertTriangle, label: "Threats", path: "/intrusion-detection" },
    { icon: Activity, label: "Predictive", path: "/predictive-analytics" },
    { icon: Network, label: "Network", path: "/network-analysis" },
    { icon: Brain, label: "Intelligence", path: "/intelligence" },
    { icon: MessageSquare, label: "Sentiment", path: "/sentiment-analysis" },
    { icon: Search, label: "Propaganda", path: "/propaganda-monitoring" },
    { icon: ShieldIcon, label: "AI Framework", path: "/security-framework" },
    { icon: BookOpen, label: "Taxonomy", path: "/taxonomy" },
    { icon: Users, label: "Crosint Portal", path: "/crosint-portal" },
    { icon: FileText, label: "Reports", path: "/reports" },
  ];

  const navItems = userRole === 'admin'
    ? [{ icon: Shield, label: "Admin Console", path: "/admin" }, ...baseNavItems]
    : baseNavItems;

  // Distinguish between main nav and overflow
  const mainNavItems = navItems.slice(0, 5); // Show first 5 on desktop
  const overflowNavItems = navItems.slice(5);

  const handleResetEngine = () => {
    AI_STATUS.reset();
    localStorage.removeItem('guardian_posts_table_unindexed');
    toast.success("Intelligence modules reset. Re-attempting live uplink...");
    window.location.reload();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (!query) return;

    toast.loading(`AI Scanning for "${query}"...`, { id: "global-search" });

    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 800));

    if (query.includes('ddos') || query.includes('threat') || query.includes('intrusion') || query.includes('sql')) {
      toast.success(`Found active intrusion logs matching "${query}"`, { id: "global-search" });
      navigate('/intrusion-detection');
    } else if (query.includes('network') || query.includes('graph') || query.includes('node')) {
      toast.success(`Visualizing network segments for "${query}"`, { id: "global-search" });
      navigate('/network-analysis');
    } else if (query.includes('predict') || query.includes('risk') || query.includes('forecast')) {
      toast.success(`Generating risk projections for "${query}"`, { id: "global-search" });
      navigate('/predictive-analytics');
    } else if (query.includes('sentiment') || query.includes('social') || query.includes('speech')) {
      toast.success(`Analyzing neural sentiment for "${query}"`, { id: "global-search" });
      navigate('/sentiment-analysis');
    } else if (query.includes('set') || query.includes('config') || query.includes('mail')) {
      toast.info(`Opening system configuration...`, { id: "global-search" });
      navigate('/settings');
    } else {
      // Default: Find intelligence in threats
      toast.success(`Intelligence located: Primary clusters identified for "${query}"`, { id: "global-search" });
      navigate(`/intrusion-detection?search=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await insforge.auth.signOut();
      toast.success("Security session terminated successfully.");
    } catch (error) {
      console.warn("Auth signout error:", error);
      toast.info("Clearing local security cache...");
    } finally {
      // FORCE CLEAR EVERYTHING to prevent ghost sessions on refresh
      localStorage.clear();
      sessionStorage.clear();

      // Also clear specific keys we use in bridge
      localStorage.removeItem('insforge-auth-token');
      localStorage.removeItem('insforge-auth-user');

      // Redirect using window.location to ensure a hard reload of the app state
      window.location.href = "/";
    }
  };

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/threats`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.slice(0, 5));
        }
      } catch (e) {
        console.warn("Notification sync offline");
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 lg:h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left section: Logo & Title (Hidden on small mobile if needed, but keeping unified for now) */}
        <div className="flex items-center gap-3 lg:gap-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground leading-tight tracking-tight uppercase">CyberGuard</h1>
              <div className="flex items-center gap-1.5 flex-nowrap">
                <span className={cn("w-1 h-1 rounded-full animate-pulse", isAiOnline ? "bg-success" : "bg-warning")} />
                <span className={cn("text-[9px] font-black tracking-widest uppercase truncate", isAiOnline ? "text-success" : "text-warning")}>
                  {isAiOnline ? "Live" : "Offline"}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <div className="h-8 w-[1px] bg-border mx-2" />
            {mainNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Overflow Dropdown */}
            {overflowNavItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center gap-1 outline-none">
                    More <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-card border-border p-1">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-1.5">Extended Modules</DropdownMenuLabel>
                  {overflowNavItems.map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "gap-3 cursor-pointer py-2",
                        location.pathname === item.path && "bg-primary/10 text-primary font-bold"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
          <div className="hidden xl:flex flex-1 max-w-[280px] relative">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Secure Scan..."
                className="w-full h-9 pl-9 pr-4 rounded-full bg-secondary/50 border border-border focus:border-primary/50 outline-none text-[11px] text-foreground transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mobile Menu Trigger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="lg:hidden p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all">
                  <Menu className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] mt-2 bg-card border-border overflow-y-auto max-h-[70vh]">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground p-3">Intelligence Network</DropdownMenuLabel>
                <div className="grid grid-cols-2 gap-1 p-2">
                  {navItems.map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 gap-2 rounded-xl text-center",
                        location.pathname === item.path ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/30"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Actions (Desktop only for some) */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-destructive/5 rounded-full border border-destructive/20 cursor-help" onClick={() => toast.error("System-wide Critical Threat Alert Active")}>
              <ShieldIcon className="w-3.5 h-3.5 text-destructive animate-pulse" />
              <span className="text-[10px] font-black text-destructive tracking-widest">THREAT: HIGH</span>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors outline-none cursor-pointer">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse-glow">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border-border p-0">
                <DropdownMenuLabel className="flex justify-between items-center p-4">
                  Active Threats
                  <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                    {notifications.length} Alerts
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-[400px] overflow-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif, idx) => (
                      <NotificationItem
                        key={idx}
                        icon={notif.severity === 'critical' ? <AlertCircle className="w-4 h-4 text-destructive" /> : <Shield className="w-4 h-4 text-warning" />}
                        title={notif.type}
                        time="Live"
                        desc={`${notif.target} targeted from ${notif.source_ip}`}
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20 text-success" />
                      No active security alerts
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator className="m-0" />
                <DropdownMenuItem
                  className="justify-center text-primary font-bold text-xs cursor-pointer p-3"
                  onClick={() => navigate("/notifications")}
                >
                  View All Intelligence Logs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User / Admin */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-secondary transition-colors outline-none cursor-pointer">
                  <div className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center",
                    userRole === 'admin' ? "bg-primary/10 border-primary/30" : "bg-secondary border-border"
                  )}>
                    {userRole === 'admin' ? <Shield className="w-4 h-4 text-primary" /> : <UserCircle className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-sm font-medium text-foreground capitalize">{userRole}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{userRole === 'admin' ? 'Command' : 'Unit 42'}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <DropdownMenuLabel>My Security Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userRole === 'admin' && (
                  <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive font-bold" onClick={() => navigate("/admin")}>
                    <Shield className="w-4 h-4" /> Command Center
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4" /> Security Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-primary" onClick={handleResetEngine}>
                  <RefreshCw className="w-4 h-4" /> Reset Intel Node
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

function NotificationItem({ icon, title, time, desc }: { icon: React.ReactNode, title: string, time: string, desc: string }) {
  return (
    <div className="p-3 hover:bg-secondary/50 border-b border-border last:border-0 transition-colors cursor-pointer group">
      <div className="flex items-start gap-3">
        <div className="mt-1">{icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{title}</span>
            <span className="text-[10px] text-muted-foreground">{time}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">{desc}</p>
        </div>
      </div>
    </div>
  );
}
