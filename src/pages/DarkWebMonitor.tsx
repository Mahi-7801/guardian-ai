import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { Globe, AlertTriangle, Eye, RefreshCw, Shield, Search, Wifi } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";

interface DarkEntry { id: string; keyword: string; site: string; category: string; risk: string; status: string; timestamp: string; }
interface ScanData { mentions: DarkEntry[]; total_sites_scanned: number; scan_duration: string; last_scan: string; tor_nodes_active: number; alerts_today: number; }

const RISK_CONFIG: Record<string, { color: string; bg: string }> = {
    critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
    high: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
    medium: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
};
const STATUS_COLOR: Record<string, string> = {
    active: "bg-red-500/20 text-red-400 border-red-500/30",
    flagged: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    monitoring: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function DarkWebMonitor() {
    const [data, setData] = useState<ScanData | null>(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [filter, setFilter] = useState("all");
    const [query, setQuery] = useState("");

    const load = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/darkweb/scan`);
            if (res.ok) setData(await res.json());
        } catch { } finally { setLoading(false); }
    };

    const rescan = async () => {
        setScanning(true);
        toast.info("🕵️ Initiating deep scan via Tor network...");
        await new Promise(r => setTimeout(r, 2500));
        await load();
        setScanning(false);
        toast.success("Dark web scan complete. Results refreshed.");
    };

    useEffect(() => { load(); }, []);

    const mentions = (data?.mentions || []).filter(m =>
        (filter === "all" || m.risk === filter || m.status === filter) &&
        (m.keyword.toLowerCase().includes(query.toLowerCase()) || m.site.toLowerCase().includes(query.toLowerCase()))
    );

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-purple-400" />
                        </div>
                        <h1 className="text-3xl font-bold">Dark Web Monitor</h1>
                    </div>
                    <p className="text-muted-foreground text-sm ml-13">Real-time Tor network & dark web intelligence scanning</p>
                </div>
                <button
                    onClick={rescan}
                    disabled={scanning}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                >
                    <RefreshCw className={cn("w-4 h-4", scanning && "animate-spin")} />
                    {scanning ? "Scanning Tor..." : "Rescan Now"}
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Sites Scanned", value: data?.total_sites_scanned ?? "—", icon: Globe, color: "text-purple-400" },
                    { label: "Active Mentions", value: data?.mentions.length ?? "—", icon: AlertTriangle, color: "text-red-400" },
                    { label: "Tor Nodes Active", value: data?.tor_nodes_active?.toLocaleString() ?? "—", icon: Wifi, color: "text-blue-400" },
                    { label: "Alerts Today", value: data?.alerts_today ?? "—", icon: Shield, color: "text-orange-400" },
                ].map((s, i) => (
                    <div key={i} className="glass-card p-4">
                        <s.icon className={cn("w-5 h-5 mb-2", s.color)} />
                        <div className="text-2xl font-bold font-mono">{s.value}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-3 flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={query} onChange={e => setQuery(e.target.value)}
                        placeholder="Search keyword or .onion site..."
                        className="w-full bg-transparent pl-9 pr-4 py-2 text-sm focus:outline-none" />
                </div>
                {["all", "critical", "high", "medium", "active", "flagged", "monitoring"].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                            filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80")}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Scan Progress Bar (visual) */}
            {scanning && (
                <div className="glass-card p-4 mb-4 flex items-center gap-4">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 animate-[progress_2.5s_ease-in-out]" style={{ width: "100%" }} />
                    </div>
                    <span className="text-xs text-purple-400 font-mono animate-pulse">CRAWLING TOR NETWORK...</span>
                </div>
            )}

            {/* Results Grid */}
            {loading ? (
                <div className="glass-card p-20 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-muted-foreground font-mono text-sm animate-pulse">Establishing Tor connection...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {mentions.length === 0 ? (
                        <div className="glass-card p-16 text-center text-muted-foreground italic">No matches found in current scan window.</div>
                    ) : mentions.map(m => (
                        <div key={m.id} className={cn("glass-card p-4 border flex flex-col sm:flex-row sm:items-center gap-4 hover:border-purple-500/40 transition-all", RISK_CONFIG[m.risk]?.bg)}>
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg font-black", RISK_CONFIG[m.risk]?.bg)}>
                                    {m.category === "Marketplace" ? "🛒" : m.category === "Forum" ? "💬" : m.category === "Paste Site" ? "📋" : "🔒"}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-mono text-xs font-bold text-muted-foreground">[{m.id}]</span>
                                        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", RISK_CONFIG[m.risk]?.color, RISK_CONFIG[m.risk]?.bg)}>
                                            {m.risk}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">{m.category}</span>
                                    </div>
                                    <p className="text-sm font-bold truncate">{m.keyword}</p>
                                    <p className="text-xs font-mono text-muted-foreground">{m.site}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border", STATUS_COLOR[m.status])}>{m.status.toUpperCase()}</span>
                                <button onClick={() => toast.info(`Flagging ${m.site} for deep analysis...`)}
                                    className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors" title="Flag & Investigate">
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-[10px] text-muted-foreground mt-6 text-center font-mono">
                ⚠️ For authorized intelligence use only · Scan via simulated Tor proxy · Last scan: {data?.last_scan ? new Date(data.last_scan).toLocaleTimeString() : "—"}
            </p>
        </DashboardLayout>
    );
}
