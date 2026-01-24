import {
  Shield,
  Activity,
  AlertTriangle,
  Network,
  Brain,
  Search,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  Bell,
  X,
  BookOpen
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
  badgeType?: 'critical' | 'warning' | 'info';
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: AlertTriangle, label: "Threats", path: "/intrusion-detection", badge: 23, badgeType: 'critical' },
  { icon: Activity, label: "Predictive", path: "/predictive-analytics", badge: 5, badgeType: 'warning' },
  { icon: Network, label: "Network", path: "/network-analysis" },
  { icon: Brain, label: "Intelligence", path: "/intelligence" },
  { icon: Search, label: "Sentiment", path: "/sentiment-analysis" },
  { icon: Users, label: "Crosint Portal", path: "/crosint-portal" },
];

const bottomItems: NavItem[] = [
  { icon: Bell, label: "Notifications", path: "/notifications", badge: 8, badgeType: 'info' },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [badges, setBadges] = useState({ threats: 23, predictive: 5, notifications: 8 });
  const location = useLocation();

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setBadges({
            threats: data.activeThreats || 23,
            predictive: data.networkAnomalies || 5,
            notifications: 8
          });
        }
      } catch (e) {
        // Fallback to initial
      }
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 10000);
    return () => clearInterval(interval);
  }, []);

  const dynamicNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: AlertTriangle, label: "Threats", path: "/intrusion-detection", badge: badges.threats, badgeType: 'critical' },
    { icon: Activity, label: "Predictive", path: "/predictive-analytics", badge: badges.predictive, badgeType: 'warning' },
    { icon: Network, label: "Network", path: "/network-analysis" },
    { icon: Brain, label: "Intelligence", path: "/intelligence" },
    { icon: MessageSquare, label: "Sentiment", path: "/sentiment-analysis" },
    { icon: Search, label: "Propaganda", path: "/propaganda-monitoring" },
    { icon: Shield, label: "AI Framework", path: "/security-framework" },
    { icon: BookOpen, label: "Taxonomy", path: "/taxonomy" },
    { icon: FileText, label: "Crosint Portal", path: "/crosint-portal" },
  ];

  const dynamicBottomItems: NavItem[] = [
    { icon: Bell, label: "Notifications", path: "/notifications", badge: badges.notifications, badgeType: 'info' },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in flex-1">
              <h1 className="font-semibold text-foreground">CyberGuard</h1>
              <p className="text-xs text-muted-foreground">AI Security Platform</p>
            </div>
          )}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {dynamicNavItems.map((item) => (
          <NavButton
            key={item.label}
            item={item}
            collapsed={collapsed}
            active={location.pathname === item.path}
          />
        ))}
      </nav>

      {/* Bottom items */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {dynamicBottomItems.map((item) => (
          <NavButton
            key={item.label}
            item={item}
            collapsed={collapsed}
            active={location.pathname === item.path}
          />
        ))}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 border-t border-sidebar-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

function NavButton({
  item,
  collapsed,
  active
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  const badgeColors = {
    critical: 'bg-destructive text-destructive-foreground',
    warning: 'bg-warning text-warning-foreground',
    info: 'bg-primary text-primary-foreground',
  };

  return (
    <Link
      to={item.path}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 flex-shrink-0 transition-colors",
        active && "text-primary"
      )} />

      {!collapsed && (
        <span className="text-sm font-medium animate-fade-in">{item.label}</span>
      )}

      {item.badge && (
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          collapsed ? "absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0" : "ml-auto",
          badgeColors[item.badgeType || 'info']
        )}>
          {item.badge}
        </span>
      )}

      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      )}
    </Link>
  );
}
