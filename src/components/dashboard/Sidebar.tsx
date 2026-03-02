import {
  Shield, Activity, AlertTriangle, Network, Brain, Search,
  FileText, Users, Settings, ChevronLeft, ChevronRight,
  LayoutDashboard, MessageSquare, Bell, X, BookOpen,
  Globe, Calculator, Clock, Fingerprint, BookMarked,
  Radio, Volume2, VolumeX
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api-config";
import { useLang, Lang } from "@/context/LanguageContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
  badgeType?: 'critical' | 'warning' | 'info';
  isNew?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [badges, setBadges] = useState({ threats: 23, predictive: 5, notifications: 8 });
  const [showLang, setShowLang] = useState(false);
  const location = useLocation();
  const { lang, setLang, flags, labels } = useLang();

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
        if (res.ok) {
          const data = await res.json();
          setBadges({
            threats: data.activeThreats || 23,
            predictive: data.networkAnomalies || 5,
            notifications: 8
          });
        }
      } catch { }
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 10000);
    return () => clearInterval(interval);
  }, []);

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Bell, label: "Notifications", path: "/notifications", badge: badges.notifications, badgeType: 'info' },
      ]
    },
    {
      title: "Threat Intelligence",
      items: [
        { icon: AlertTriangle, label: "Intrusion Detection", path: "/intrusion-detection", badge: badges.threats, badgeType: 'critical' },
        { icon: Activity, label: "Predictive Analytics", path: "/predictive-analytics", badge: badges.predictive, badgeType: 'warning' },
        { icon: Clock, label: "Threat Timeline", path: "/threat-timeline", isNew: true },
        { icon: Calculator, label: "Risk Calculator", path: "/risk-calculator", isNew: true },
        { icon: Globe, label: "Dark Web Monitor", path: "/darkweb-monitor", isNew: true },
      ]
    },
    {
      title: "AI & Analysis",
      items: [
        { icon: Network, label: "Network Analysis", path: "/network-analysis" },
        { icon: Brain, label: "Intelligence", path: "/intelligence" },
        { icon: MessageSquare, label: "Sentiment Analysis", path: "/sentiment-analysis" },
        { icon: Search, label: "Propaganda Monitor", path: "/propaganda-monitoring" },
        { icon: Fingerprint, label: "Biometric Scan", path: "/biometric", isNew: true },
      ]
    },
    {
      title: "AI Pipeline",
      items: [
        { icon: Shield, label: "AI Framework", path: "/security-framework" },
        { icon: ChevronRight, label: "AI Pipeline", path: "/ai-pipeline" },
        { icon: BookMarked, label: "Incident Response", path: "/incident-response", isNew: true },
        { icon: BookOpen, label: "Taxonomy", path: "/taxonomy" },
      ]
    },
    {
      title: "Reports & Admin",
      items: [
        { icon: Users, label: "Crosint Portal", path: "/crosint-portal" },
        { icon: FileText, label: "Intel Reports", path: "/reports" },
        { icon: Shield, label: "Admin Panel", path: "/admin" },
        { icon: Settings, label: "Settings", path: "/settings" },
      ]
    },
  ];

  const LANGS: Lang[] = ["en", "hi", "te", "ar"];

  return (
    <div
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-3 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary flex-shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in flex-1 min-w-0">
              <h1 className="font-bold text-foreground text-sm leading-tight">CyberGuard AI</h1>
              <p className="text-[10px] text-muted-foreground">Security Platform</p>
            </div>
          )}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation — scrollable */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
        {navGroups.map(group => (
          <div key={group.title} className="mb-1">
            {/* Group Header */}
            {!collapsed && (
              <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 mt-2 first:mt-0 select-none">
                {group.title}
              </div>
            )}
            {collapsed && <div className="border-t border-sidebar-border/50 my-1.5" />}

            {/* Group Items */}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavButton
                  key={item.path}
                  item={item}
                  collapsed={collapsed}
                  active={location.pathname === item.path}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Language Switcher */}
      <div className="border-t border-sidebar-border flex-shrink-0">
        {!collapsed ? (
          <div className="p-2">
            <button
              onClick={() => setShowLang(p => !p)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-all text-muted-foreground"
            >
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium flex-1 text-left">{flags[lang]} {labels[lang]}</span>
              <ChevronRight className={cn("w-3 h-3 transition-transform", showLang && "rotate-90")} />
            </button>
            {showLang && (
              <div className="mt-1 space-y-0.5 animate-fade-in">
                {LANGS.map(l => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setShowLang(false); }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all",
                      l === lang
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    {flags[l]} {labels[l]}
                    {l === lang && <span className="ml-auto text-[9px] font-black">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full p-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={`Language: ${labels[lang]}`}
          >
            <span className="text-base">{flags[lang]}</span>
          </button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-3 border-t border-sidebar-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
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
      title={collapsed ? item.label : undefined}
      className={cn(
        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 group relative",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
      )}
    >
      <Icon className={cn(
        "w-4 h-4 flex-shrink-0 transition-colors",
        active && "text-primary"
      )} />

      {!collapsed && (
        <span className="text-xs font-medium truncate flex-1">{item.label}</span>
      )}

      {/* NEW badge */}
      {!collapsed && item.isNew && !item.badge && (
        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-tight">
          NEW
        </span>
      )}

      {/* Count badge */}
      {item.badge !== undefined && (
        <span className={cn(
          "text-[10px] font-bold rounded-full",
          collapsed
            ? "absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0 text-[8px]"
            : "ml-auto px-1.5 py-0.5",
          badgeColors[item.badgeType || 'info']
        )}>
          {item.badge}
        </span>
      )}

      {/* Active indicator */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}
    </Link>
  );
}
