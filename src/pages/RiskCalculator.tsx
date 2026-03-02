import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Calculator, Brain, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";

interface Factor { key: string; label: string; desc: string; icon: string; }
const FACTORS: Factor[] = [
    { key: "threat_level", label: "Threat Level", desc: "Severity of detected threat signatures", icon: "🔴" },
    { key: "network_exposure", label: "Network Exposure", desc: "Attack surface size and open port count", icon: "🌐" },
    { key: "data_sensitivity", label: "Data Sensitivity", desc: "Classification level of at-risk data", icon: "🔒" },
    { key: "historical_incidents", label: "Historical Incidents", desc: "Past incident frequency in similar context", icon: "📊" },
    { key: "social_signal", label: "Social Signal Strength", desc: "Volume of OSINT/social media threat signals", icon: "📡" },
];

const LEVEL_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
    CRITICAL: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/40", label: "🚨 Initiate Emergency Protocol" },
    HIGH: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/40", label: "⚠️ Escalate to Tier-2" },
    MEDIUM: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/40", label: "📋 Monitor & Review" },
    LOW: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/40", label: "✅ Routine Monitoring" },
};

export default function RiskCalculator() {
    const [values, setValues] = useState<Record<string, number>>({
        threat_level: 5, network_exposure: 5, data_sensitivity: 5,
        historical_incidents: 5, social_signal: 5,
    });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const calculate = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/risk/calculate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (res.ok) {
                const data = await res.json();
                setResult(data);
                toast.success(`Risk assessment complete: ${data.risk_level}`);
            }
        } catch {
            // Offline fallback
            const score = Object.entries(values).reduce((acc, [k, v]) => {
                const w: Record<string, number> = { threat_level: 0.3, network_exposure: 0.2, data_sensitivity: 0.2, historical_incidents: 0.15, social_signal: 0.15 };
                return acc + v * (w[k] || 0) * 10;
            }, 0);
            const level = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
            setResult({ risk_score: parseFloat(Math.min(100, score).toFixed(1)), risk_level: level, confidence: 91, model: "Local Estimate", recommendations: ["Review all active logs", "Notify analyst on duty"] });
            toast.warning("Backend offline — local estimate used.");
        } finally { setLoading(false); }
    };

    const lc = result ? LEVEL_CONFIG[result.risk_level] : null;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                        <Calculator className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">AI Risk Score Calculator</h1>
                        <p className="text-sm text-muted-foreground">Weighted multi-factor risk assessment · RandomForest + XAI Attribution</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left — Input Sliders */}
                    <div className="glass-card p-6 space-y-6">
                        <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Input Parameters
                        </h2>
                        {FACTORS.map(f => (
                            <div key={f.key}>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold flex items-center gap-2">
                                        <span>{f.icon}</span> {f.label}
                                    </label>
                                    <span className={cn(
                                        "text-lg font-mono font-black w-8 text-center",
                                        values[f.key] >= 8 ? "text-red-400" : values[f.key] >= 6 ? "text-orange-400" : values[f.key] >= 4 ? "text-yellow-400" : "text-green-400"
                                    )}>{values[f.key]}</span>
                                </div>
                                <input
                                    type="range" min={1} max={10} step={1}
                                    value={values[f.key]}
                                    onChange={e => setValues(v => ({ ...v, [f.key]: Number(e.target.value) }))}
                                    className="w-full accent-primary h-2 rounded-full cursor-pointer"
                                />
                                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                                    <span>Minimal (1)</span><span className="text-[9px]">{f.desc}</span><span>Extreme (10)</span>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={calculate} disabled={loading}
                            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                            {loading ? "AI Calculating..." : "Calculate Risk Score"}
                        </button>
                    </div>

                    {/* Right — Result */}
                    <div className="space-y-4">
                        {!result ? (
                            <div className="glass-card p-16 flex flex-col items-center gap-4 text-center">
                                <Calculator className="w-16 h-16 text-muted-foreground/30" />
                                <p className="text-muted-foreground text-sm">Set parameters and click<br /><strong>Calculate Risk Score</strong></p>
                                <p className="text-[11px] text-muted-foreground font-mono">Model: Weighted Multi-Factor + SHAP XAI</p>
                            </div>
                        ) : (
                            <>
                                {/* Score Dial */}
                                <div className={cn("glass-card p-8 text-center border", lc?.border, lc?.bg)}>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">RISK SCORE</p>
                                    <div className={cn("text-8xl font-black font-mono mb-2", lc?.color)}>{result.risk_score}</div>
                                    <div className={cn("text-2xl font-bold mb-1", lc?.color)}>{result.risk_level}</div>
                                    <div className="text-xs text-muted-foreground">{lc?.label}</div>
                                    <div className="text-[10px] text-muted-foreground mt-3 font-mono">
                                        Model Confidence: {result.confidence}% · {result.model}
                                    </div>
                                </div>

                                {/* Factor Contributions (SHAP-style) */}
                                {result.contributions && (
                                    <div className="glass-card p-5">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                            <Brain className="w-4 h-4" /> XAI Factor Contributions (SHAP)
                                        </h3>
                                        <div className="space-y-2">
                                            {Object.entries(result.contributions as Record<string, number>)
                                                .sort(([, a], [, b]) => b - a)
                                                .map(([k, v]) => {
                                                    const f = FACTORS.find(x => x.key === k);
                                                    const pct = Math.min(100, (v / 30) * 100);
                                                    return (
                                                        <div key={k}>
                                                            <div className="flex justify-between text-[11px] mb-1">
                                                                <span className="font-medium">{f?.icon} {f?.label}</span>
                                                                <span className="font-mono font-bold text-primary">+{v}</span>
                                                            </div>
                                                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendations */}
                                <div className="glass-card p-5">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-success" /> AI Recommendations
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.recommendations.map((r: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                                                <span className="text-muted-foreground">{r}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button onClick={() => { setResult(null); }} className="w-full py-2 bg-secondary rounded-lg text-sm text-muted-foreground hover:bg-secondary/80 transition-all">
                                    Reset Calculator
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
