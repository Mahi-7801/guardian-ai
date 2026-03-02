import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from "recharts";
import { Clock, TrendingUp, TrendingDown, Minus, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";

type TabId = "timeline" | "heatmap";

export default function ThreatTimeline() {
    const [tab, setTab] = useState<TabId>("timeline");
    const [tl, setTl] = useState<any>(null);
    const [hm, setHm] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [r1, r2] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/threats/timeline`),
                    fetch(`${API_BASE_URL}/api/threats/heatmap`),
                ]);
                if (r1.ok) setTl(await r1.json());
                if (r2.ok) setHm(await r2.json());
            } catch { } finally { setLoading(false); }
        };
        load();
    }, []);

    const TrendIcon = tl?.trend === "increasing" ? TrendingUp : tl?.trend === "decreasing" ? TrendingDown : Minus;
    const trendColor = tl?.trend === "increasing" ? "text-red-400" : tl?.trend === "decreasing" ? "text-green-400" : "text-yellow-400";

    const scoreColor = (s: number) =>
        s >= 80 ? "bg-red-600" : s >= 60 ? "bg-orange-500" : s >= 40 ? "bg-yellow-500" : "bg-green-500";

    return (
        <DashboardLayout>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Threat Timeline & Heatmap</h1>
                    <p className="text-sm text-muted-foreground">30-day threat history · global threat density visualization</p>
                </div>
            </div>

            {/* Summary Cards */}
            {tl && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Threats (30d)", value: tl.total_period, color: "text-red-400" },
                        { label: "Peak Day", value: tl.peak_day, color: "text-orange-400" },
                        { label: "Trend", value: tl.trend?.toUpperCase(), color: trendColor, Icon: TrendIcon },
                        { label: "Regions Monitored", value: hm?.regions?.length ?? "—", color: "text-blue-400" },
                    ].map((c, i) => (
                        <div key={i} className="glass-card p-4">
                            {c.Icon && <c.Icon className={cn("w-5 h-5 mb-2", c.color)} />}
                            <div className={cn("text-2xl font-bold font-mono", c.color)}>{c.value}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{c.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {(["timeline", "heatmap"] as TabId[]).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={cn("px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize",
                            tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80")}>
                        {t === "timeline" ? "📈 30-Day Timeline" : "🌍 Global Heatmap"}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="glass-card p-20 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground font-mono text-sm animate-pulse">Loading threat data...</p>
                </div>
            ) : tab === "timeline" ? (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Daily Threat Count (Stacked by Severity)</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={tl?.timeline?.slice(-14)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} />
                                <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                                <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="high" stackId="a" fill="#f97316" name="High" />
                                <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                                <Bar dataKey="low" stackId="a" fill="#3b82f6" name="Low" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Blocked vs Active Threats (30 Days)</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={tl?.timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#888" }} interval={4} />
                                <YAxis tick={{ fontSize: 9, fill: "#888" }} />
                                <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #333", borderRadius: 8, fontSize: 11 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Line type="monotone" dataKey="blocked" stroke="#22c55e" strokeWidth={2} dot={false} name="Blocked" />
                                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} name="Critical" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Global Threat Density by Country
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(hm?.regions || [])
                            .sort((a: any, b: any) => b.score - a.score)
                            .map((r: any) => (
                                <div key={r.country} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all">
                                    <div className="w-24 text-sm font-bold flex-shrink-0">{r.country}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                            <span>{r.region}</span>
                                            <span className="font-mono font-bold">{r.incidents} incidents</span>
                                        </div>
                                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all", scoreColor(r.score))}
                                                style={{ width: `${r.score}%` }}
                                            />
                                        </div>
                                        <div className="text-[9px] text-muted-foreground mt-0.5 text-right font-mono">{r.score}%</div>
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div className="flex items-center gap-4 mt-6 justify-center flex-wrap">
                        {[["≥80%", "bg-red-600", "Critical"], ["60–79%", "bg-orange-500", "High"], ["40–59%", "bg-yellow-500", "Medium"], ["<40%", "bg-green-500", "Low"]].map(([range, bg, label]) => (
                            <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className={cn("w-4 h-4 rounded", bg)} />
                                <span>{range} · {label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
