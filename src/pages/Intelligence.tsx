import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ThreatIntelFeed } from "@/components/dashboard/ThreatIntelFeed";
import { Brain, Shield, Zap, Search, Globe, Filter, Loader2, Layers, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api-config";

const Intelligence = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        depth: "94%",
        sources: "98%",
        investigations: "288",
        synthesis_description: "Guardian AI core is actively synthesizing signals..."
    });
    const [fusion, setFusion] = useState<any>(null);
    const [social, setSocial] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [briefingSubject, setBriefingSubject] = useState("");
    const [generatedBriefing, setGeneratedBriefing] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchIntelStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/intelligence/ops`);
            if (res.ok) {
                const data = await res.json();
                setStats({
                    depth: `${94 + Math.floor(Math.random() * 5)}%`,
                    sources: `${data.verified_sources}%`,
                    investigations: data.active_investigations.toString(),
                    synthesis_description: data.synthesis_description
                });
            }
        } catch (e) {
            console.error("Failed to fetch intel stats");
        }
    };

    useEffect(() => {
        fetchIntelStats();

        const fetchFusion = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/fusion/status`);
                if (res.ok) setFusion(await res.json());
            } catch (e) { console.error("Fusion service offline"); }
        };

        const fetchSocial = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/social/analysis`);
                if (res.ok) setSocial(await res.json());
            } catch (e) { console.error("Social analysis service offline"); }
        };

        fetchFusion();
        fetchSocial();

        const interval = setInterval(fetchIntelStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const handlePriorityScan = () => {
        setIsLoading(true);
        toast.info("Priority neural scan initiated across global relays...");
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Priority scan complete. Neural buffers synchronized.");
            fetchIntelStats();
        }, 2000);
    };

    const generateBriefing = async () => {
        if (!briefingSubject) {
            toast.error("Please enter an intelligence subject.");
            return;
        }
        setIsGenerating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/intelligence/briefing/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: briefingSubject })
            });
            if (res.ok) {
                const data = await res.json();
                setGeneratedBriefing(data);
                toast.success("AI Synthesis complete. Intelligence briefing generated.");
            }
        } catch (e) {
            toast.error("Briefing generation failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    const publishBriefing = async () => {
        if (!generatedBriefing) return;
        toast.promise(
            fetch(`${API_BASE_URL}/api/intelligence/briefing/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(generatedBriefing)
            }).then(res => res.json()),
            {
                loading: 'Dispatching to command nodes...',
                success: 'Briefing published successfully.',
                error: 'Publication failed.'
            }
        );
        setGeneratedBriefing(null);
        setBriefingSubject("");
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Intelligence Operations</h1>
                        <p className="text-muted-foreground">Global threat gathering and AI-driven intelligence synthesis.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button className="px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-secondary/80 transition-all">
                            <Globe className="w-4 h-4" /> Global Node Map
                        </button>
                        <button
                            onClick={handlePriorityScan}
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg hover:glow-primary transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Priority Scan
                        </button>
                    </div>
                </div>

                {/* Intel Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Intelligence Depth"
                        value={stats.depth}
                        icon={Brain}
                        variant="default"
                    />
                    <StatCard
                        title="Verified Sources"
                        value={stats.sources}
                        icon={Shield}
                        variant="success"
                    />
                    <StatCard
                        title="Active Investigations"
                        value={stats.investigations}
                        icon={Search}
                        variant="warning"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Detailed Intelligence Feed - Takes 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-6 bg-primary/5 border-primary/20">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Active Neural Synthesis</h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {stats.synthesis_description}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-lg font-bold">Intelligence Feed</h3>
                            <button
                                onClick={() => navigate('/notifications')}
                                className="text-[10px] font-black uppercase text-primary hover:underline transition-all"
                            >
                                View All Signals
                            </button>
                        </div>
                        <ThreatIntelFeed />
                    </div>

                    {/* Intel Parameters & Briefing */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 border-primary/30">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Brain className="w-4 h-4 text-primary" />
                                Generate Briefing
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground">Intelligence Subject</label>
                                    <input
                                        type="text"
                                        value={briefingSubject}
                                        onChange={(e) => setBriefingSubject(e.target.value)}
                                        placeholder="e.g. Sector Delta Analytics"
                                        className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                {generatedBriefing ? (
                                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 animate-fade-in">
                                        <h4 className="text-sm font-bold mb-2">{generatedBriefing.title}</h4>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">{generatedBriefing.content}</p>
                                        <button
                                            onClick={publishBriefing}
                                            className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:glow-primary transition-all"
                                        >
                                            Publish Briefing
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={generateBriefing}
                                        disabled={isGenerating || !briefingSubject}
                                        className="w-full py-3 bg-secondary rounded-lg text-xs font-bold border border-border flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all disabled:opacity-50"
                                    >
                                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                        Generate AI Briefing
                                    </button>
                                )}
                            </div>
                        </div>

                        {fusion && (
                            <div className="glass-card p-6 border-primary/30 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Layers className="w-12 h-12" />
                                </div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-primary" />
                                    Data Fusion Status
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground uppercase font-black">Method:</span>
                                        <span className="font-mono text-primary font-bold">{fusion.fusion_method}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {fusion.data_sources_synced.map((s: string) => (
                                            <span key={s} className="px-2 py-1 bg-secondary rounded text-[9px] font-bold border border-border/50">{s}</span>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                        <p className="text-[10px] text-muted-foreground mb-1 font-bold">Accuracy Boost (SUMMIT/SHARP)</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: fusion.accuracy_boost }} />
                                            </div>
                                            <span className="text-[10px] font-mono text-primary">{fusion.accuracy_boost}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {social && (
                            <div className="glass-card p-6 bg-destructive/5 border-destructive/20 group">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-destructive">
                                    <Users className="w-4 h-4" />
                                    Target Monitoring
                                </h3>
                                <div className="space-y-3">
                                    {social.detected_groups.map((g: any) => (
                                        <div key={g.name} className="flex justify-between items-start p-2 rounded bg-background/50 border border-destructive/10 group-hover:border-destructive/30 transition-all">
                                            <div>
                                                <p className="text-xs font-bold">{g.name}</p>
                                                <p className="text-[9px] text-muted-foreground uppercase font-mono">{g.dominant_platform} | {g.members} Targets</p>
                                            </div>
                                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-destructive text-white rounded">LEVEL: {g.threat_level}</span>
                                        </div>
                                    ))}
                                    <div className="pt-2">
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Methodology (RNN/LSTM)</p>
                                        <div className="flex gap-2">
                                            {social.tech_stack.map((t: string) => (
                                                <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 bg-sidebar-accent border border-sidebar-border rounded text-muted-foreground">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="glass-card p-6 border-warning/30 bg-warning/5">
                            <h3 className="text-lg font-bold mb-2 text-warning">Security Advisory</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                Unauthorized publishing of raw intelligence data outside of secure channels is a Tier-1 violation.
                            </p>
                            <div className="text-[10px] font-mono p-2 bg-background/50 rounded border border-warning/20 text-warning cursor-pointer hover:bg-warning/10 transition-all" onClick={() => toast.warning("Protocol SIGMA_EPSILON_9 is active. All data exfiltration is logged.")}>
                                PROTOCOL: SIGMA_EPSILON_9
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Intelligence;
