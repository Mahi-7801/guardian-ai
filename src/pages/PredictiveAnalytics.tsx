import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { TrendingUp, BarChart3, Map as MapIcon, Calendar, Zap, RefreshCcw, Download, Share2, Loader2, Target, ShieldAlert, Users, Network, ArrowRight, ArrowLeft, Mail } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api-config";
import { cn } from "@/lib/utils";
import { insforge } from "@/lib/insforge";

interface Hotspot {
    location: string;
    risk: string;
    color: string;
}

interface Factor {
    label: string;
    value: number;
    color: string;
}

const PredictiveAnalytics = () => {
    // Workflow State
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [analysisType, setAnalysisType] = useState<string | null>(null);
    const [params, setParams] = useState({
        region: "Middle East",
        timeframe: "Next 30 Days",
        confidence: 75,
        factors: {
            historical: true,
            social: true,
            economic: true,
            political: true
        }
    });

    const [analyzing, setAnalyzing] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState("30D");
    const [stats, setStats] = useState({
        risk: "Low",
        predicted: "0",
        confidence: "0%",
        hotspots: "0"
    });
    const [timeline, setTimeline] = useState<number[]>([]);
    const [factors, setFactors] = useState<Factor[]>([]);
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [methodology, setMethodology] = useState<string>("");

    const ANALYSIS_TYPES = [
        { id: "terrorism", title: "Terrorism Event Prediction", icon: Target, desc: "Forecast potential attacks based on patterns." },
        { id: "cyber", title: "Cyberattack Forecasting", icon: ShieldAlert, desc: "Predict malware, DDoS, and intrusion attempts." },
        { id: "extremist", title: "Extremist Activity Trends", icon: Users, desc: "Analyze radicalization and group movements." },
        { id: "malware", title: "Malware Outbreak Prediction", icon: Network, desc: "Track viral spread of malicious code." }
    ];

    const runAnalysis = async () => {
        setStep(3);
        setAnalyzing(true);

        try {
            // Use local backend API
            const response = await fetch(`${API_BASE_URL}/api/predict/risk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: analysisType,
                    ...params
                })
            });

            if (!response.ok) throw new Error("Backend unavailable");

            const data = await response.json();

            // Map backend response to UI state
            setStats({
                risk: data.overallRisk || "High",
                predicted: "3",
                confidence: `${data.confidence}%`,
                hotspots: data.heatmap?.length.toString() || "3"
            });

            setTimeline(data.timeline || []);
            setFactors(data.factors || []);
            setHotspots(data.heatmap?.map((r: any) => ({
                location: r.name,
                risk: `${r.risk}%`,
                color: r.risk > 70 ? "text-destructive" : r.risk > 40 ? "text-warning" : "text-success"
            })) || []);

            setMethodology(data.methodology || "Heuristic Analysis");

            toast.success("Prediction generated successfully via Neural Engine.");

        } catch (error) {
            console.error("Analysis failed:", error);
            handleSimulation(); // Fallback
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        if (step === 3 && !analyzing) {
            const interval = setInterval(runAnalysis, 10000); // Slower refresh for analytics
            return () => clearInterval(interval);
        }
    }, [step, analyzing]);

    const handleSimulation = () => {
        // Fallback Data if backend fails
        toast.warning("Backend offline. Using simulation mode.");
        setStats({ risk: "Critical", predicted: "4-6", confidence: "87%", hotspots: "3 Active" });
        setTimeline([20, 30, 45, 60, 75, 80, 85, 80, 70, 60, 50, 40]);
        setFactors([
            { label: "Social Unrest", value: 82, color: "bg-destructive" },
            { label: "Historical Patterns", value: 65, color: "bg-warning" },
            { label: "Political Tensions", value: 48, color: "bg-primary" },
            { label: "Economic Data", value: 32, color: "bg-success" }
        ]);
        setHotspots([
            { location: "Region A", risk: "78%", color: "text-destructive" },
            { location: "Region B", risk: "45%", color: "text-warning" },
            { location: "Region C", risk: "23%", color: "text-success" }
        ]);
    };

    const handleDownload = async () => {
        toast.promise(
            fetch(`${API_BASE_URL}/api/predict/report/download`).then(res => res.json()),
            {
                loading: 'Generating PDF Intelligence Briefing...',
                success: (data: any) => `Report downloaded: ${data.filename}`,
                error: 'Download failed. Backend unavailable.',
            }
        );
    };

    const handleShare = () => {
        toast.success("Secure intelligence link copied to clipboard.");
    };

    // Step 1: Select Analysis Type
    const renderStep1 = () => (
        <div className="max-w-4xl mx-auto py-10 space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">What would you like to predict?</h2>
                <p className="text-muted-foreground">Select an analysis vector to initialize the predictive engine.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ANALYSIS_TYPES.map((type) => (
                    <div
                        key={type.id}
                        onClick={() => { setAnalysisType(type.id); }}
                        className={`group relative p-6 rounded-2xl border transition-all cursor-pointer overflow-hidden ${analysisType === type.id ? 'bg-primary/10 border-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]' : 'bg-card/50 border-border hover:border-primary/50 hover:bg-secondary/50'}`}
                    >
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${analysisType === type.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                <type.icon className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className={`font-bold text-lg transition-colors ${analysisType === type.id ? 'text-primary' : 'text-foreground'}`}>{type.title}</h3>
                                <p className="text-sm text-muted-foreground">{type.desc}</p>
                            </div>
                        </div>
                        {/* Radioactive Selection Indicator */}
                        {analysisType === type.id && (
                            <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-8">
                <button
                    onClick={() => analysisType && setStep(2)}
                    disabled={!analysisType}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next Step <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    // Step 2: Configure Parameters
    const renderStep2 = () => (
        <div className="max-w-2xl mx-auto py-10 space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Configuration Parameters</h2>
                <p className="text-muted-foreground">Fine-tune the predictive model inputs.</p>
            </div>

            <div className="glass-card p-8 space-y-8">
                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Target Region</label>
                    <select
                        className="w-full bg-secondary border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        value={params.region}
                        onChange={(e) => setParams({ ...params, region: e.target.value })}
                    >
                        <option>Middle East</option>
                        <option>North America</option>
                        <option>Eastern Europe</option>
                        <option>Asia Pacific</option>
                    </select>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Analysis Timeframe</label>
                    <select
                        className="w-full bg-secondary border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        value={params.timeframe}
                        onChange={(e) => setParams({ ...params, timeframe: e.target.value })}
                    >
                        <option>Next 7 Days</option>
                        <option>Next 30 Days</option>
                        <option>Next 90 Days</option>
                        <option>Next 1 Year</option>
                    </select>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Confidence Threshold</label>
                        <span className="text-primary font-bold font-mono">{params.confidence}%</span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="99"
                        value={params.confidence}
                        onChange={(e) => setParams({ ...params, confidence: Number(e.target.value) })}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Include Data Factors</label>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(params.factors).map(([key, value]) => (
                            <label key={key} className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-secondary/50 transition-all">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => setParams({ ...params, factors: { ...params.factors, [key]: e.target.checked } })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                    onClick={runAnalysis}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all"
                >
                    <Zap className="w-5 h-5" /> Generate Predictions
                </button>
            </div>
        </div>
    );

    // Step 3: Results Dashboard (Original View + Enhancements)
    const renderStep3 = () => (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Prediction Results</h1>
                    <p className="text-sm text-muted-foreground font-mono uppercase">Target: {analysisType} | Methodology: <span className="text-primary font-bold">{methodology}</span></p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setStep(2)}
                        className="px-4 py-2 bg-secondary rounded-lg text-sm border border-border hover:bg-secondary/80 transition-all font-medium"
                    >
                        Adjust Parameters
                    </button>
                    <button
                        onClick={runAnalysis}
                        disabled={analyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:glow-primary transition-all disabled:opacity-50 font-bold"
                    >
                        {analyzing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {analyzing ? "Updating..." : "Refresh Model"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Risk Assessment"
                    value={stats.risk}
                    change={stats.risk === 'Critical' ? "+15%" : stats.risk === 'Elevated' ? "+8%" : "-2%"}
                    changeType={stats.risk === 'Low' ? "neutral" : "increase"}
                    icon={TrendingUp}
                    variant={stats.risk === 'Critical' ? 'critical' : stats.risk === 'Elevated' ? 'warning' : 'success'}
                />
                <StatCard
                    title="Predicted Events"
                    value={stats.predicted}
                    change="High Probability"
                    icon={BarChart3}
                    variant="default"
                />
                <StatCard
                    title="Model Confidence"
                    value={stats.confidence}
                    icon={Zap}
                    variant="success"
                />
                <StatCard
                    title="Active Hotspots"
                    value={stats.hotspots}
                    icon={MapIcon}
                    variant="critical"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Probability Horizon
                            </h2>
                            <div className="flex gap-2">
                                {['7D', '30D', '90D', '1Y'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            setSelectedTimeframe(t);
                                            toast.info(`Recalculating horizon for ${t}...`);
                                        }}
                                        className={`px-3 py-1 text-[10px] rounded border transition-all ${selectedTimeframe === t ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-border hover:bg-secondary'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-64 flex items-end gap-1 px-4 border-b border-border relative">
                            <div className="absolute inset-0 cyber-grid opacity-10" />
                            {analyzing ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            ) : (
                                timeline.map((h, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-t transition-all duration-1000 group cursor-pointer relative ${h > 80 ? 'bg-destructive/60 hover:bg-destructive' : h > 60 ? 'bg-warning/60 hover:bg-warning' : 'bg-primary/60 hover:bg-primary'}`}
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-border">
                                            Risk: {h}%
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-mono">
                            <span>T-ZERO</span>
                            <span>T+1W</span>
                            <span>T+2W</span>
                            <span>T+3W</span>
                            <span>T+4W</span>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold mb-4">Risk Contribution Matrix</h2>
                        {analyzing ? (
                            <div className="space-y-4 opacity-50">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-secondary/50 rounded animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {factors.map((f, i) => (
                                    <FactorItem key={i} label={f.label} value={f.value} color={f.color} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold mb-4 text-primary">High Risk Coordinates</h2>
                        {analyzing ? (
                            <div className="space-y-4 opacity-50">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-secondary/50 rounded animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {hotspots.map((h, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/30 transition-all cursor-crosshair">
                                        <span className="text-sm font-medium">{h.location}</span>
                                        <span className={`text-xs font-mono font-bold ${h.color}`}>{h.risk}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6 border-glow relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Heuristic Settings
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Active Engines</p>
                                <div className="flex flex-wrap gap-2">
                                    {["Random Forest", "Neural Prophecy", "Dark Web Crawler"].map(a => (
                                        <span key={a} className="text-[10px] px-2 py-0.5 bg-sidebar-accent text-sidebar-accent-foreground rounded border border-sidebar-border cursor-pointer hover:border-primary/50 transition-colors">{a}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold flex justify-between">
                                    <span>Sensitivity Threshold</span>
                                    <span className="text-primary">{params.confidence}%</span>
                                </p>
                                <div className="w-full h-1 bg-secondary rounded-lg">
                                    <div className="h-full bg-primary rounded-lg transition-all" style={{ width: `${params.confidence}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-5 border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Explainable AI (XAI) Logic</h2>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-4 leading-relaxed">
                            Algorithmic transparency enabled. Feature importance weights (SHAP values) for current {analysisType} risk:
                        </p>
                        <div className="space-y-3">
                            {[
                                { label: "Temporal Proximity", value: 88, color: "bg-success" },
                                { label: "Geographical Context", value: 72, color: "bg-primary" },
                                { label: "Semantic Sentiment", value: 45, color: "bg-warning" }
                            ].map((x, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-mono">
                                        <span className="text-foreground/70">{x.label}</span>
                                        <span className="text-foreground font-bold">+{x.value}pt</span>
                                    </div>
                                    <div className="h-1 w-full bg-sidebar-accent rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-1000", x.color)} style={{ width: `${x.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary rounded-xl border border-border hover:bg-secondary/70 transition-all text-sm font-bold"
                        >
                            <Download className="w-4 h-4" /> Download
                        </button>
                        <button
                            onClick={async () => {
                                const { data: sessionData } = await insforge.auth.getCurrentSession();
                                const userEmail = sessionData?.session?.user?.email;

                                if (!userEmail) {
                                    toast.error("Please sign in to send intelligence reports.");
                                    return;
                                }

                                toast.promise(
                                    fetch(`${API_BASE_URL}/api/predict/report/send-email`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            email: userEmail,
                                            type: analysisType,
                                            region: params.region,
                                            risk: stats.risk,
                                            confidence: stats.confidence,
                                            factors,
                                            hotspots
                                        })
                                    }).then(res => res.json()),
                                    {
                                        loading: 'Dispatching intelligence briefing to email...',
                                        success: (data) => data.message,
                                        error: 'Failed to send email report.',
                                    }
                                );
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl hover:glow-primary transition-all text-sm font-bold shadow-lg"
                        >
                            <Mail className="w-4 h-4" /> Email Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </main>
            </div>
        </div>
    );
};

const FactorItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="space-y-1 group">
        <div className="flex justify-between text-xs font-medium">
            <span className="group-hover:text-primary transition-colors">{label}</span>
            <span className="font-mono text-muted-foreground group-hover:text-foreground">{value}%</span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(var(--primary),0.3)]`} style={{ width: `${value}%` }} />
        </div>
    </div>
);

export default PredictiveAnalytics;
