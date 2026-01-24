import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BookOpen, Search, Code2, Network, Shield, Brain, Layers, Users, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const Taxonomy = () => {
    const [taxonomy, setTaxonomy] = useState<any>(null);
    const [activeSection, setActiveSection] = useState<string>("predictive_modeling");
    const [activity, setActivity] = useState<any>(null);
    const [signals, setSignals] = useState<any[]>([]);
    const [systemStatus, setSystemStatus] = useState({
        latency: 0,
        brain_sync: 0,
        active_vectors: 0
    });

    useEffect(() => {
        fetch('http://localhost:5000/api/taxonomy')
            .then(res => res.json())
            .then(data => setTaxonomy(data))
            .catch(err => console.error("Failed to load taxonomy"));
    }, []);

    useEffect(() => {
        const fetchActivity = () => {
            fetch(`http://localhost:5000/api/taxonomy/activity?section=${activeSection}`)
                .then(res => res.json())
                .then(data => setActivity(data));

            if (activeSection === 'crosint') {
                fetch('http://localhost:5000/api/crosint/events')
                    .then(res => res.json())
                    .then(data => setSignals(data.slice(0, 3)));
            }
        };

        const fetchSystemStatus = () => {
            fetch('http://localhost:5000/api/system/status')
                .then(res => res.json())
                .then(data => setSystemStatus(data));
        };

        fetchActivity();
        fetchSystemStatus();

        const interval = setInterval(() => {
            fetchActivity();
            fetchSystemStatus();
        }, 4000);

        return () => clearInterval(interval);
    }, [activeSection]);

    const sections = [
        { id: "predictive_modeling", title: "Predictive Modeling", icon: Brain },
        { id: "cybersecurity", title: "Cybersecurity", icon: Shield },
        { id: "nlp_techniques", title: "NLP Techniques", icon: MessageSquare },
        { id: "social_network_analysis", title: "Social Network", icon: Users },
        { id: "data_fusion", title: "Data Fusion", icon: Layers },
        { id: "explainable_ai", title: "Explainable AI", icon: Code2 },
        { id: "crosint", title: "Crosint", icon: Network },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-border pb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold">Guardian AI Neural Taxonomy</h1>
                        <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
                            This operational map transforms the research survey into a live engine, allowing you to see the <span className="text-primary font-bold">"brain"</span> of Guardian AI as it actively computes across different security vectors.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation & Core Status */}
                    <div className="space-y-6">
                        <div className="glass-card p-4 border-primary/30 bg-primary/5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 text-center sm:text-left">Neural Core Status</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-2 py-1.5 rounded bg-background/50 border border-border/50">
                                    <span className="text-[9px] text-muted-foreground uppercase">Active Vectors</span>
                                    <span className="text-[10px] font-mono font-bold text-primary">{systemStatus.active_vectors.toString().padStart(2, '0')}/07</span>
                                </div>
                                <div className="flex justify-between items-center px-2 py-1.5 rounded bg-background/50 border border-border/50">
                                    <span className="text-[9px] text-muted-foreground uppercase">Brain Sync</span>
                                    <span className="text-[10px] font-mono font-bold text-success">{systemStatus.brain_sync}%</span>
                                </div>
                                <div className="flex justify-between items-center px-2 py-1.5 rounded bg-background/50 border border-border/50">
                                    <span className="text-[9px] text-muted-foreground uppercase">Latency</span>
                                    <span className="text-[10px] font-mono font-bold text-warning">{systemStatus.latency}ms</span>
                                </div>
                            </div>
                            <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary animate-pulse-glow" style={{ width: '85%' }} />
                            </div>
                        </div>

                        <div className="flex flex-wrap lg:flex-col gap-2">
                            {sections.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    className={cn(
                                        "flex-1 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group min-w-[140px]",
                                        activeSection === s.id
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50"
                                    )}
                                >
                                    <s.icon className={cn("w-4 h-4 transition-colors", activeSection === s.id ? "text-primary-foreground" : "group-hover:text-primary")} />
                                    <span className="whitespace-nowrap">{s.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {taxonomy && taxonomy[activeSection] ? (
                            <div className="animate-fade-in space-y-8">
                                <div className="glass-card p-6 sm:p-8 bg-gradient-to-br from-card to-background border-primary/20 relative overflow-hidden">
                                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                                    <h2 className="text-xl sm:text-2xl font-bold mb-4 capitalize flex items-center gap-3">
                                        {activeSection.replace(/_/g, " ")}
                                    </h2>
                                    <p className="text-muted-foreground mb-8 text-sm italic">
                                        Implementation of technical architectures as described in the survey paper for advanced security operations.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(taxonomy[activeSection]).map(([category, items]: [string, any]) => (
                                            <div key={category} className="p-5 rounded-2xl bg-secondary/30 border border-border/50 space-y-4 hover:border-primary/30 transition-all">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">{category.replace(/_/g, " ")}</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {items.map((item: string) => (
                                                        <span key={item} className="px-3 py-1.5 bg-background/50 rounded-lg text-xs font-mono font-bold border border-border/50 hover:border-primary/50 transition-colors shadow-sm">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card p-6 bg-secondary/20 border-border/50">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                        <h3 className="text-sm font-bold flex items-center gap-2">
                                            <Search className="w-4 h-4 text-primary" />
                                            Technical Implementation Notes
                                        </h3>
                                        {activity && (
                                            <div className="flex items-center gap-2 px-2 py-1 rounded bg-background/50 border border-border/50">
                                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                                <span className="text-[9px] font-mono text-muted-foreground">REAL-TIME SYNC</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Guardian AI utilizes a modular engine to swap between these architectures based on real-time computational needs and threat context. For example, during high-volume DDoS detection, the system shifts from basic MLP models to GAN-based threat detection for adaptive defense.
                                        </p>

                                        {activity && (
                                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black uppercase text-primary/70 tracking-widest whitespace-nowrap overflow-hidden text-ellipsis mr-2">Active Process ({activeSection.replace(/_/g, " ")})</span>
                                                    <span className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-sm font-mono text-foreground font-medium italic">
                                                    "{activity.activity}"
                                                </p>
                                                <div className="flex items-center gap-4 pt-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-1 w-12 bg-secondary rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary" style={{ width: `${activity.confidence}%` }} />
                                                        </div>
                                                        <span className="text-[8px] font-mono text-muted-foreground">CONF: {activity.confidence}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 mt-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                            <Brain className="w-3 h-3 text-primary animate-pulse" />
                                            <span className="text-[10px] font-bold text-primary uppercase">Neural Logic: Fully Operational across all vectors</span>
                                        </div>
                                    </div>
                                </div>

                                {activeSection === 'crosint' && signals.length > 0 && (
                                    <div className="glass-card p-6 border-primary/30 bg-primary/5 animate-fade-in">
                                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                            <Network className="w-4 h-4 text-primary" />
                                            Global Signal Stream (Real-Time)
                                        </h3>
                                        <div className="space-y-3">
                                            {signals.map((s, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg bg-background/50 border border-border/50 group hover:border-primary/30 transition-all gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.verified ? 'bg-success' : 'bg-warning animate-pulse'}`} />
                                                        <div>
                                                            <p className="text-xs font-bold">{s.event}</p>
                                                            <p className="text-[9px] text-muted-foreground uppercase">{s.location} • {s.impact} Impact</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[8px] font-mono p-1 bg-secondary rounded text-muted-foreground sm:ml-auto">ID: {s.id}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 opacity-50 space-y-4">
                                <Brain className="w-12 h-12 animate-pulse text-primary" />
                                <p className="italic text-sm font-mono">Loading Neural Taxonomy Buffers...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Taxonomy;
