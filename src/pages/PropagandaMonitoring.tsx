import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Search, Globe, Users, AlertTriangle, ShieldAlert, BarChart3, TrendingUp, RefreshCw, Loader2, Bot, Share2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api-config";
import { cn } from "@/lib/utils";

const PropagandaMonitoring = () => {
    const [loading, setLoading] = useState(true);
    const [disinfoData, setDisinfoData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        botClusters: "12",
        disinfoIndex: "High",
        reach: "2.4M",
        verified: "85%"
    });

    const fetchDisinfo = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/disinfo/signals`);
            if (response.ok) {
                const data = await response.json();
                setDisinfoData(data);

                setStats({
                    botClusters: (10 + (data.length > 5 ? data.length : 2)).toString(),
                    disinfoIndex: data.some((d: any) => d.status === 'flagged') ? "Critical" : "High",
                    reach: `${(1.5 + (data.length * 0.1)).toFixed(1)}M`,
                    verified: `${80 + (data.length * 2)}%`
                });

                toast.success("Disinformation vectors synchronized via Live Neural Feed.");
            }
        } catch (e) {
            console.error("Disinfo fetch failed");
            toast.error("Neural Sync failed. Check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisinfo();
        const interval = setInterval(fetchDisinfo, 12000);
        return () => clearInterval(interval);
    }, []);

    const isolateCluster = (id: string) => {
        setDisinfoData(prev => prev.map(d => d.id === id ? { ...d, status: 'isolated' } : d));
        toast.error(`PROTOCOL SIGMA: Disinformation node ${id} isolated and nullified.`, {
            icon: <ShieldAlert className="w-4 h-4" />
        });
    };

    const isolateAll = () => {
        setDisinfoData(prev => prev.map(d => ({ ...d, status: 'isolated' })));
        toast.error("EMERGENCY PROTOCOL SIGMA: GLOBAL DISINFO NETWORK FRAGMENTED.", {
            style: { background: '#7f1d1d', color: 'white' }
        });
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Propaganda Monitoring</h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Bot className="w-4 h-4" />
                                    Real-time influence operation detection and narrative mitigation.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={fetchDisinfo}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-all text-sm font-bold"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                    Sync Neural Feed
                                </button>
                                <button
                                    onClick={isolateAll}
                                    className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all text-sm font-black uppercase tracking-widest"
                                >
                                    <ShieldAlert className="w-4 h-4" />
                                    Cluster Isolate
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Bot Clusters" value={stats.botClusters} icon={Bot} variant="warning" />
                            <StatCard title="Disinfo Index" value={stats.disinfoIndex} icon={AlertTriangle} variant="critical" />
                            <StatCard title="Audience Reach" value={stats.reach} icon={Globe} variant="default" />
                            <StatCard title="Verification" value={stats.verified} icon={BarChart3} variant="success" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                <div className="glass-card p-6 border-primary/20 bg-primary/5">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Detected Narratives
                                    </h3>

                                    {loading && disinfoData.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                            <p className="text-sm font-mono tracking-widest uppercase">Analyzing Social Signal Buffers...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {disinfoData.map((data) => (
                                                <div key={data.id} className={cn(
                                                    "p-4 rounded-xl border transition-all group relative overflow-hidden",
                                                    data.status === 'isolated' ? "bg-destructive/10 border-destructive opacity-60" : "bg-card hover:border-primary/50"
                                                )}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-sidebar-accent rounded">{data.id}</span>
                                                            <span className="text-xs font-bold text-primary">{data.source}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[10px] font-mono opacity-50">{data.platform}</span>
                                                            {data.status !== 'isolated' && (
                                                                <button
                                                                    onClick={() => isolateCluster(data.id)}
                                                                    className="text-destructive hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <ShieldAlert className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium mb-3">{data.narrative}</p>
                                                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                                        <div className="flex gap-4">
                                                            <div className="text-[10px]">
                                                                <span className="text-muted-foreground uppercase mr-1">Reach:</span>
                                                                <span className="font-bold">{data.reach}</span>
                                                            </div>
                                                            <div className="text-[10px]">
                                                                <span className="text-muted-foreground uppercase mr-1">Match:</span>
                                                                <span className="font-bold text-success">{data.confidence}%</span>
                                                            </div>
                                                        </div>
                                                        <button className="text-[10px] uppercase font-black text-primary hover:underline transition-all flex items-center gap-1">
                                                            Trace Source <Share2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="glass-card p-6 border-glow">
                                    <h3 className="text-lg font-bold mb-4">Neural Tech Stack</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: "Semantic Analysis", val: "BERT", status: "Active" },
                                            { label: "Bot Mapping", val: "GNN + SNA", status: "Active" },
                                            { label: "Disinfo Scoring", val: "VADER / Custom", status: "Synced" }
                                        ].map(t => (
                                            <div key={t.label} className="flex justify-between items-center p-3 rounded-lg bg-secondary/50 border border-border">
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-0.5">{t.label}</p>
                                                    <p className="text-sm font-bold">{t.val}</p>
                                                </div>
                                                <span className="text-[9px] px-1.5 py-0.5 bg-success/20 text-success border border-success/30 rounded font-mono">{t.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card p-6 border-destructive/20 bg-destructive/5 relative overflow-hidden group">
                                    <div className="absolute inset-0 cyber-grid opacity-10" />
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="w-5 h-5" />
                                        Critical Alerts
                                    </h3>
                                    <div className="space-y-3 relative z-10">
                                        <div className="p-3 bg-background/50 rounded-lg border border-destructive/30 text-[11px] leading-relaxed">
                                            <span className="font-bold text-destructive">ANOMALY:</span> Coordinated narrative burst detected in <span className="underline">Sector Delta</span>. Source obfuscation indicates high-tier state proxy.
                                        </div>
                                        <button
                                            onClick={isolateAll}
                                            className="w-full py-2 bg-destructive text-destructive-foreground rounded text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all"
                                        >
                                            Engage Global Mitigation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PropagandaMonitoring;
