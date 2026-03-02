import {
  Search, Bell, Shield, LogOut, Settings, UserCircle,
  AlertCircle, CheckCircle2, RefreshCw, Menu,
  LayoutDashboard, AlertTriangle, Activity, Network, Brain,
  MessageSquare, BookOpen, Users, FileText, ChevronDown,
  Globe, Calculator, Clock, Fingerprint, BookMarked, Languages
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
import { useLang, Lang } from "@/context/LanguageContext";

interface HeaderProps {
  onMenuClick?: () => void;
}

type NavGroupDef = {
  key: string;
  color: string;
  items: { icon: React.ElementType; key: string; path: string; isNew?: boolean }[];
};

// Keys match TRANSLATIONS in LanguageContext
const NAV_GROUPS: NavGroupDef[] = [
  {
    key: "group_threat",
    color: "text-red-400",
    items: [
      { icon: AlertTriangle, key: "threats", path: "/intrusion-detection" },
      { icon: Activity, key: "predictive", path: "/predictive-analytics" },
      { icon: Clock, key: "timeline", path: "/threat-timeline", isNew: true },
      { icon: Calculator, key: "risk", path: "/risk-calculator", isNew: true },
      { icon: Globe, key: "darkweb", path: "/darkweb-monitor", isNew: true },
    ]
  },
  {
    key: "group_ai",
    color: "text-blue-400",
    items: [
      { icon: Network, key: "network", path: "/network-analysis" },
      { icon: Brain, key: "intelligence", path: "/intelligence" },
      { icon: MessageSquare, key: "sentiment", path: "/sentiment-analysis" },
      { icon: Search, key: "propaganda", path: "/propaganda-monitoring" },
      { icon: Fingerprint, key: "biometric", path: "/biometric", isNew: true },
    ]
  },
  {
    key: "group_pipeline",
    color: "text-purple-400",
    items: [
      { icon: Shield, key: "framework", path: "/security-framework" },
      { icon: Brain, key: "pipeline", path: "/ai-pipeline" },
      { icon: BookMarked, key: "incident", path: "/incident-response", isNew: true },
      { icon: BookOpen, key: "taxonomy", path: "/taxonomy" },
    ]
  },
  {
    key: "group_reports",
    color: "text-green-400",
    items: [
      { icon: Users, key: "crosint", path: "/crosint-portal" },
      { icon: FileText, key: "reports", path: "/reports" },
      { icon: Shield, key: "admin", path: "/admin" },
      { icon: Settings, key: "settings", path: "/settings" },
    ]
  },
];

const LANG_DATA: { code: Lang; flag: string; native: string; label: string }[] = [
  { code: "en", flag: "🇬🇧", native: "English", label: "EN" },
  { code: "hi", flag: "🇮🇳", native: "हिंदी", label: "हि" },
  { code: "te", flag: "🇮🇳", native: "తెలుగు", label: "తె" },
  { code: "ar", flag: "🇸🇦", native: "عربي", label: "ع" },
];

// Extra translation keys for group headers
const GROUP_EN: Record<string, string> = {
  group_threat: "Threat Intelligence",
  group_ai: "AI & Analysis",
  group_pipeline: "AI Pipeline",
  group_reports: "Reports & Admin",
  taxonomy: "Taxonomy",
  admin: "Admin Panel",
  crosint: "Crosint Portal",
  propaganda: "Propaganda",
  framework: "AI Framework",
  pipeline: "AI Pipeline",
};
const GROUP_HI: Record<string, string> = {
  group_threat: "खतरा खुफिया",
  group_ai: "AI और विश्लेषण",
  group_pipeline: "AI पाइपलाइन",
  group_reports: "रिपोर्ट और प्रशासन",
  taxonomy: "वर्गीकरण",
  admin: "प्रशासन पैनल",
  crosint: "क्रॉसिंट पोर्टल",
  propaganda: "प्रचार",
  framework: "AI ढांचा",
  pipeline: "AI पाइपलाइन",
};
const GROUP_TE: Record<string, string> = {
  group_threat: "బెదిరింపు నిఘా",
  group_ai: "AI మరియు విశ్లేషణ",
  group_pipeline: "AI పైప్‌లైన్",
  group_reports: "నివేదికలు & నిర్వాహణ",
  taxonomy: "వర్గీకరణ",
  admin: "అడ్మిన్ పానెల్",
  crosint: "క్రోసింత్ పోర్టల్",
  propaganda: "ప్రచారం",
  framework: "AI నిర్మాణం",
  pipeline: "AI పైప్‌లైన్",
};
const GROUP_AR: Record<string, string> = {
  group_threat: "استخبارات التهديد",
  group_ai: "الذكاء الاصطناعي والتحليل",
  group_pipeline: "خط أنابيب الذكاء الاصطناعي",
  group_reports: "التقارير والإدارة",
  taxonomy: "التصنيف",
  admin: "لوحة الإدارة",
  crosint: "بوابة كروسينت",
  propaganda: "الدعاية",
  framework: "إطار الذكاء الاصطناعي",
  pipeline: "خط الأنابيب",
};

function getLabel(key: string, lang: Lang): string {
  const maps: Record<Lang, Record<string, string>> = {
    en: GROUP_EN, hi: GROUP_HI, te: GROUP_TE, ar: GROUP_AR
  };
  return maps[lang][key] || GROUP_EN[key] || key;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const isAiOnline = AI_STATUS.isOnline;
  const [userRole, setUserRole] = useState("user");
  const [notifications, setNotifications] = useState<any[]>([]);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    setUserRole(localStorage.getItem('user_role') || 'user');
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/threats`);
        if (res.ok) {
          const data = await res.json();
          setNotifications((data.threats || data).slice(0, 5));
        }
      } catch { }
    };
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 10000);
    return () => clearInterval(iv);
  }, []);

  const handleResetEngine = () => {
    AI_STATUS.reset();
    localStorage.removeItem('guardian_posts_table_unindexed');
    toast.success("Intelligence modules reset.");
    window.location.reload();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    toast.loading(`AI Scanning for "${q}"...`, { id: "gs" });
    await new Promise(r => setTimeout(r, 600));
    const routes: [string[], string][] = [
      [['ddos', 'threat', 'intrusion', 'sql'], '/intrusion-detection'],
      [['network', 'graph', 'node'], '/network-analysis'],
      [['predict', 'timeline', 'risk'], '/threat-timeline'],
      [['sentiment', 'social', 'nlp'], '/sentiment-analysis'],
      [['dark', 'tor', 'onion'], '/darkweb-monitor'],
      [['biometric', 'face', 'iris'], '/biometric'],
      [['calculator', 'score'], '/risk-calculator'],
      [['incident', 'playbook'], '/incident-response'],
      [['set', 'config'], '/settings'],
    ];
    const match = routes.find(([kws]) => kws.some(k => q.includes(k)));
    toast.success(`Found results for "${q}"`, { id: "gs" });
    navigate(match?.[1] || '/intrusion-detection');
  };

  const handleLogout = async () => {
    try { await insforge.auth.signOut(); } catch { }
    localStorage.clear(); sessionStorage.clear();
    window.location.href = "/";
  };

  const switchLang = (l: Lang) => {
    setLang(l);
    const found = LANG_DATA.find(x => x.code === l);
    toast.success(`🌐 Language switched to ${found?.native}`, { duration: 2000 });
  };

  const currentLang = LANG_DATA.find(x => x.code === lang)!;
  const isRTL = lang === "ar";

  return (
    <header className={cn("h-14 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50", isRTL && "direction-rtl")}>
      <div className="h-full px-3 sm:px-5 flex items-center justify-between gap-2">

        {/* ── LEFT: Logo + Nav ────────────────────────── */}
        <div className="flex items-center gap-1 lg:gap-0.5 min-w-0">
          <Link to="/dashboard" className="flex items-center gap-2 group flex-shrink-0 mr-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xs font-black text-foreground uppercase tracking-tight leading-none">CyberGuard</h1>
              <div className="flex items-center gap-1">
                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isAiOnline ? "bg-success" : "bg-warning")} />
                <span className={cn("text-[8px] font-black tracking-widest uppercase", isAiOnline ? "text-success" : "text-warning")}>
                  {isAiOnline ? "LIVE" : "OFFLINE"}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop nav groups */}
          <nav className="hidden lg:flex items-center gap-0.5">
            <div className="h-5 w-px bg-border mx-1" />

            {/* Dashboard pill */}
            <Link to="/dashboard"
              className={cn("px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap",
                location.pathname === "/dashboard"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              {t("dashboard")}
            </Link>

            {/* Grouped dropdowns */}
            {NAV_GROUPS.map(group => (
              <GroupDropdown key={group.key} group={group} lang={lang} navigate={navigate} location={location} t={t} />
            ))}
          </nav>
        </div>

        {/* ── RIGHT: Actions ──────────────────────────── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Search */}
          <div className="hidden xl:flex relative">
            <form onSubmit={handleSearch}>
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Secure Scan..."
                className="h-8 pl-8 pr-3 w-44 rounded-full bg-secondary/50 border border-border focus:border-primary/50 outline-none text-[11px] transition-all" />
            </form>
          </div>

          {/* Threat badge */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-destructive/10 rounded-full border border-destructive/20 cursor-pointer"
            onClick={() => toast.error("Critical threat levels elevated")}>
            <Shield className="w-3 h-3 text-destructive animate-pulse" />
            <span className="text-[9px] font-black text-destructive tracking-widest">THREAT: HIGH</span>
          </div>

          {/* ── LANGUAGE SWITCHER ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-secondary/60 border border-border hover:bg-primary/10 hover:border-primary/30 transition-all outline-none"
                title="Switch Language"
              >
                <Languages className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm">{currentLang.flag}</span>
                <span className="text-[10px] font-black text-primary hidden sm:block">{currentLang.label}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card border-border shadow-xl">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Languages className="w-3 h-3" /> Language / भाषा / భాష
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LANG_DATA.map(l => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => switchLang(l.code)}
                  className={cn(
                    "flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-lg mx-1 my-0.5",
                    lang === l.code
                      ? "bg-primary/15 text-primary font-bold border border-primary/20"
                      : "hover:bg-secondary/80"
                  )}
                >
                  <span className="text-xl">{l.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{l.native}</div>
                    <div className="text-[10px] text-muted-foreground">{l.code.toUpperCase()}</div>
                  </div>
                  {lang === l.code && (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors outline-none">
                <Bell className="w-4 h-4 text-muted-foreground" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-bold animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card border-border p-0">
              <DropdownMenuLabel className="flex justify-between items-center p-3">
                {t("notifications")}
                <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">{notifications.length}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="m-0" />
              <div className="max-h-72 overflow-auto">
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <NotificationItem key={i}
                    icon={n.severity === 'critical' ? <AlertCircle className="w-4 h-4 text-destructive" /> : <Shield className="w-4 h-4 text-warning" />}
                    title={n.type || "Threat"} time="Live"
                    desc={`${n.target || "Unknown"} ← ${n.source_ip || "Unknown IP"}`}
                  />
                )) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20 text-success" />
                    No active alerts
                  </div>
                )}
              </div>
              <DropdownMenuSeparator className="m-0" />
              <DropdownMenuItem className="justify-center text-primary font-bold text-xs p-3 cursor-pointer" onClick={() => navigate("/notifications")}>
                {t("notifications")} →
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="lg:hidden p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all outline-none">
                <Menu className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] mt-2 bg-card border-border overflow-y-auto max-h-[75vh]">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground p-3">
                All Modules
              </DropdownMenuLabel>
              {NAV_GROUPS.map(group => (
                <div key={group.key}>
                  <DropdownMenuLabel className={cn("text-[9px] uppercase tracking-widest px-3 py-1", group.color)}>
                    {getLabel(group.key, lang)}
                  </DropdownMenuLabel>
                  <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                    {group.items.map(item => (
                      <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}
                        className={cn("flex items-center gap-2 p-2.5 rounded-xl cursor-pointer",
                          location.pathname === item.path ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/30")}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-[10px] font-bold leading-tight">{t(item.key) || getLabel(item.key, lang)}</span>
                        {item.isNew && <span className="text-[7px] font-black bg-primary/20 text-primary px-1 rounded ml-auto">NEW</span>}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>
              ))}
              {/* Language row in mobile */}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[9px] uppercase tracking-widest px-3 py-1 text-muted-foreground">Language</DropdownMenuLabel>
              <div className="grid grid-cols-4 gap-1 p-2">
                {LANG_DATA.map(l => (
                  <button key={l.code} onClick={() => switchLang(l.code)}
                    className={cn("flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all",
                      lang === l.code ? "bg-primary/15 text-primary border border-primary/20" : "bg-secondary/30 text-muted-foreground")}>
                    <span className="text-lg">{l.flag}</span>
                    <span className="text-[9px] font-bold">{l.label}</span>
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-secondary transition-colors outline-none cursor-pointer">
                <div className={cn("w-7 h-7 rounded-lg border flex items-center justify-center",
                  userRole === 'admin' ? "bg-primary/10 border-primary/30" : "bg-secondary border-border")}>
                  {userRole === 'admin' ? <Shield className="w-3.5 h-3.5 text-primary" /> : <UserCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-xs font-bold capitalize">{userRole}</span>
                  <span className="text-[9px] text-muted-foreground uppercase">{userRole === 'admin' ? 'Command' : 'Unit 42'}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card border-border">
              <DropdownMenuLabel>Security Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userRole === 'admin' && (
                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive font-bold" onClick={() => navigate("/admin")}>
                  <Shield className="w-4 h-4" /> Command Center
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4" /> {t("settings")}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer text-primary" onClick={handleResetEngine}>
                <RefreshCw className="w-4 h-4" /> Reset Intel Node
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive cursor-pointer" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Terminate Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// ── Group dropdown with translated labels ─────────────────
function GroupDropdown({ group, lang, navigate, location, t }: {
  group: NavGroupDef; lang: Lang; navigate: any; location: any; t: (k: string) => string;
}) {
  const anyActive = group.items.some(i => location.pathname === i.path);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 outline-none whitespace-nowrap",
          anyActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}>
          {getLabel(group.key, lang)}
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60 bg-card border-border p-1 shadow-xl">
        <DropdownMenuLabel className={cn("text-[9px] uppercase tracking-widest px-2 py-1.5", group.color)}>
          {getLabel(group.key, lang)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {group.items.map(item => (
          <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}
            className={cn("gap-3 cursor-pointer py-2 rounded-lg",
              location.pathname === item.path && "bg-primary/10 text-primary font-bold"
            )}>
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-sm">{t(item.key) || getLabel(item.key, lang)}</span>
            {item.isNew && (
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase">NEW</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Notification item ─────────────────────────────────────
function NotificationItem({ icon, title, time, desc }: { icon: React.ReactNode; title: string; time: string; desc: string }) {
  return (
    <div className="p-3 hover:bg-secondary/50 border-b border-border last:border-0 transition-colors cursor-pointer group">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs font-bold group-hover:text-primary transition-colors truncate">{title}</span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{time}</span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
        </div>
      </div>
    </div>
  );
}
