import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { Shield, ChevronDown, ChevronRight, CheckCircle, Clock, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api-config";

interface Step { step: number; action: string; detail: string; time: string; }
interface Playbook { id: string; type: string; severity: string; eta: string; icon: string; steps: Step[]; }

const SEV: Record<string, { dot: string; badge: string; border: string }> = {
    critical: { dot: "bg-red-400", badge: "bg-red-500/20 text-red-400 border-red-500/30", border: "border-red-500/20" },
    high: { dot: "bg-orange-400", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30", border: "border-orange-500/20" },
    medium: { dot: "bg-yellow-400", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", border: "border-yellow-500/20" },
};

const ICON_MAP: Record<string, string> = {
    network: "🌐", lock: "🔒", alert: "🚨", database: "💾", user: "👤", shield: "🛡️"
};

export default function IncidentResponse() {
    const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [active, setActive] = useState<Record<string, number[]>>({});

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/incidents/playbooks`);
                if (res.ok) setPlaybooks(await res.json());
            } catch { } finally { setLoading(false); }
        })();
    }, []);

    const toggleStep = (pbId: string, step: number) => {
        setActive(prev => {
            const cur = prev[pbId] || [];
            const next = cur.includes(step) ? cur.filter(s => s !== step) : [...cur, step];
            return { ...prev, [pbId]: next };
        });
    };

    const activatePlaybook = (pb: Playbook) => {
        setExpanded(pb.id);
        toast.success(`🚨 Playbook ${pb.id} activated — ${pb.type}`);
    };

    return (
        <DashboardLayout>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Incident Response Playbooks</h1>
                    <p className="text-sm text-muted-foreground">Step-by-step response protocols for every threat type</p>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Critical Playbooks", value: playbooks.filter(p => p.severity === "critical").length, color: "text-red-400" },
                    { label: "High Severity", value: playbooks.filter(p => p.severity === "high").length, color: "text-orange-400" },
                    { label: "Total Protocols", value: playbooks.length, color: "text-primary" },
                ].map((s, i) => (
                    <div key={i} className="glass-card p-4 text-center">
                        <div className={cn("text-3xl font-black font-mono", s.color)}>{s.value}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="glass-card p-16 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-mono text-sm animate-pulse">Loading response protocols...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {playbooks.map(pb => {
                        const s = SEV[pb.severity];
                        const isOpen = expanded === pb.id;
                        const done = (active[pb.id] || []).length;
                        return (
                            <div key={pb.id} className={cn("glass-card border transition-all", s.border)}>
                                {/* Playbook Header */}
                                <div
                                    className="flex items-center gap-4 p-4 cursor-pointer select-none"
                                    onClick={() => setExpanded(isOpen ? null : pb.id)}
                                >
                                    <div className="text-2xl w-10 text-center flex-shrink-0">{ICON_MAP[pb.icon] || "🛡️"}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="font-mono text-[10px] text-muted-foreground">{pb.id}</span>
                                            <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", s.badge)}>{pb.severity}</span>
                                        </div>
                                        <h3 className="font-bold text-base">{pb.type}</h3>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-[10px] text-muted-foreground uppercase">ETA</div>
                                            <div className="text-sm font-bold font-mono text-primary">{pb.eta}</div>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground text-center">
                                            <div className="text-base font-bold font-mono">{done}/{pb.steps.length}</div>
                                            <div>steps done</div>
                                        </div>
                                        {isOpen ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="h-1 bg-secondary/50 mx-4">
                                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(done / pb.steps.length) * 100}%` }} />
                                </div>

                                {/* Steps */}
                                {isOpen && (
                                    <div className="p-4 pt-4 space-y-3 border-t border-border/50 mt-1">
                                        <div className="flex gap-2 mb-4">
                                            <button onClick={() => activatePlaybook(pb)}
                                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
                                                <Zap className="w-3 h-3" /> Activate Playbook
                                            </button>
                                            <button onClick={() => setActive(prev => ({ ...prev, [pb.id]: [] }))}
                                                className="flex items-center gap-2 bg-secondary text-muted-foreground px-4 py-2 rounded-lg text-xs font-bold transition-all hover:bg-secondary/80">
                                                Reset Progress
                                            </button>
                                        </div>
                                        {pb.steps.map(s => {
                                            const done = (active[pb.id] || []).includes(s.step);
                                            return (
                                                <div key={s.step}
                                                    className={cn("flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                                        done ? "bg-emerald-500/10 border-emerald-500/30" : "bg-secondary/30 border-border/50 hover:border-primary/30")}
                                                    onClick={() => toggleStep(pb.id, s.step)}
                                                >
                                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black border-2 transition-all",
                                                        done ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-border text-muted-foreground")}>
                                                        {done ? <CheckCircle className="w-4 h-4" /> : s.step}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm mb-1 flex items-center gap-2">
                                                            {s.action}
                                                            {done && <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">DONE</span>}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">{s.detail}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono flex-shrink-0">
                                                        <Clock className="w-3 h-3" />{s.time}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}
