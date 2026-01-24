import { Search, Bell, User, Shield, LogOut, Settings, UserCircle, AlertCircle, CheckCircle2, RefreshCw, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { insforge, AI_STATUS } from "@/lib/insforge";
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
  const [searchQuery, setSearchQuery] = useState("");
  const isAiOnline = AI_STATUS.isOnline;

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
        const res = await fetch('http://localhost:5000/api/threats');
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
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Command Center</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">AI-Powered Threat Intelligence</p>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isAiOnline ? "bg-success" : "bg-warning")} />
              <span className={cn("text-[10px] font-bold tracking-widest uppercase", isAiOnline ? "text-success" : "text-warning")}>
                {isAiOnline ? "Live Uplink" : "Autonomous Mode"}
              </span>
            </div>
          </div>
        </div>

        {/* Center - Search (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-0 border-none bg-transparent hover:text-primary transition-colors cursor-pointer group z-10"
            >
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threats, IPs, locations..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-foreground placeholder:text-muted-foreground transition-all focus:bg-sidebar"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground font-mono">
              ⌘K
            </kbd>
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Threat level indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 cursor-help" onClick={() => toast.error("System-wide Critical Threat Alert Active")}>
            <Shield className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">HIGH</span>
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
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Admin</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel>My Security Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
