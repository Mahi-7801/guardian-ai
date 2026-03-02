import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { API_BASE_URL } from "@/lib/api-config";
import {
    Brain, Shield, Zap, Database, Filter, Cpu, Network,
    AlertTriangle, Globe, RefreshCw, ChevronDown, ChevronUp,
    Activity, Target, Eye, Lock, Users, GitBranch, Layers,
    RadioTower, Microscope, BookOpen, ArrowDown, CheckCircle2,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PipelineLayer {
    id: string;
    name: string;
    subtitle: string;
    color: string;
    components: { name: string; detail: string }[];
    status?: string;
    confidence?: number;
    current_activity?: string;
    throughput?: string;
    latency_ms?: number;
}

interface WorkflowLayer {
    id: string;
    step: number;
    title: string;
    items?: string[];
    models?: { model: string; task: string; tech: string }[];
}

interface BackendWorkflow {
    layers: WorkflowLayer[];
    challenges: { icon: string; label: string; desc: string }[];
    tech_stack: Record<string, string>;
    paper_reference: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LAYER_COLORS: Record<string, { bg: string; border: string; text: string; badge: string; glow: string }> = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/40", text: "text-blue-400", badge: "bg-blue-500/20 border-blue-500/30", glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/40", text: "text-purple-400", badge: "bg-purple-500/20 border-purple-500/30", glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/40", text: "text-cyan-400", badge: "bg-cyan-500/20 border-cyan-500/30", glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]" },
    red: { bg: "bg-red-500/10", border: "border-red-500/40", text: "text-red-400", badge: "bg-red-500/20 border-red-500/30", glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]" },
    green: { bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-400", badge: "bg-emerald-500/20 border-emerald-500/30", glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/40", text: "text-orange-400", badge: "bg-orange-500/20 border-orange-500/30", glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]" },
};

const LAYER_ICONS: Record<string, React.ComponentType<any>> = {
    "01": Database,
    "02": Filter,
    "03": Brain,
    "04": Target,
    "05": Eye,
    "06": Shield,
};

const CHALLENGES = [
    { icon: AlertTriangle, label: "Adversarial attacks (evasion & poisoning)", color: "text-red-400" },
    { icon: Lock, label: "Privacy vs. surveillance tension", color: "text-yellow-400" },
    { icon: Activity, label: "False positives & class imbalance", color: "text-orange-400" },
    { icon: Globe, label: "Regulatory fragmentation (EU vs US vs China)", color: "text-blue-400" },
    { icon: Eye, label: "Opaque model decisions (black-box problem)", color: "text-purple-400" },
    { icon: RadioTower, label: "Data quality from OSINT / crowdsourced feeds", color: "text-cyan-400" },
];

const MODEL_TABLE = [
    { model: "SVM + KNN Ensemble", task: "Terrorist zone prediction", tech: "Scikit-learn inference" },
    { model: "Random Forest + XGBoost + PSO", task: "Attack prediction", tech: "Gradient boosting engine" },
    { model: "LSTM + Autoencoder", task: "Network intrusion detection", tech: "Deep learning server" },
    { model: "BiLSTM + CNN", task: "Hate speech / radicalization", tech: "NLP inference pipeline" },
    { model: "BERT / SecurityBERT / FakeBERT", task: "Misinformation, phishing", tech: "Transformer model server" },
    { model: "GPT-4 / LLMs", task: "Threat intelligence / phishing", tech: "LLM API calls" },
    { model: "GNN + STGCN", task: "Extremist network mapping", tech: "Graph neural network engine" },
    { model: "GCPDDQN (RL)", task: "Counter-UAV swarm neutralization", tech: "RL agent runtime" },
    { model: "CNN + RNN", task: "Image/video threat analysis", tech: "Computer vision pipeline" },
    { model: "Bayesian Networks", task: "Probabilistic threat scoring", tech: "Probabilistic inference" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const AIPipeline = () => {
    const [activeTab, setActiveTab] = useState<'pipeline' | 'backend' | 'models' | 'challenges'>('pipeline');
    const [layers, setLayers] = useState<PipelineLayer[]>([]);
    const [workflow, setWorkflow] = useState<BackendWorkflow | null>(null);
    const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
    const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeLayerIdx, setActiveLayerIdx] = useState(0);
    const [animating, setAnimating] = useState(true);

    // Fetch pipeline data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [layersRes, wfRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/pipeline/layers`),
                    fetch(`${API_BASE_URL}/api/backend/workflow`),
                ]);
                if (layersRes.ok) setLayers(await layersRes.json());
                if (wfRes.ok) setWorkflow(await wfRes.json());
            } catch {
                toast.warning("Backend offline — showing static pipeline data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 12000);
        return () => clearInterval(interval);
    }, []);

    // Animate active layer highlight
    useEffect(() => {
        if (!animating) return;
        const id = setInterval(() => {
            setActiveLayerIdx(p => (p + 1) % 6);
        }, 1800);
        return () => clearInterval(id);
    }, [animating]);

    // ── Render helpers ───────────────────────────────────────────────────────

    const renderPipeline = () => (
        <div className="space-y-3 animate-fade-in">
            {/* Header strip */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold tracking-tight">6-Layer AI Counter-Terrorism Pipeline</h2>
                    <p className="text-xs text-muted-foreground font-mono">
                        Frontend Input → Data Fusion → AI Processing → Threat Detection → XAI → Governance
                    </p>
                </div>
                <button
                    onClick={() => setAnimating(v => !v)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all",
                        animating ? "bg-primary/10 border-primary/40 text-primary animate-pulse" : "border-border text-muted-foreground"
                    )}
                >
                    <Activity className="w-3 h-3" />
                    {animating ? "LIVE SCAN" : "PAUSED"}
                </button>
            </div>

            {/* Connector flow line */}
            <div className="relative">
                {(layers.length > 0 ? layers : STATIC_LAYERS).map((layer, idx) => {
                    const colors = LAYER_COLORS[layer.color] ?? LAYER_COLORS.blue;
                    const Icon = LAYER_ICONS[layer.id] ?? Layers;
                    const isOpen = expandedLayer === layer.id;
                    const isActive = idx === activeLayerIdx;
                    return (
                        <div key={layer.id} className="relative mb-1">
                            {/* Connector line */}
                            {idx < 5 && (
                                <div className="absolute left-[2.2rem] top-full w-px h-1 bg-gradient-to-b from-border to-transparent z-0" />
                            )}

                            {/* Layer card */}
                            <div className={cn(
                                "glass-card border transition-all duration-500 cursor-pointer relative overflow-hidden group",
                                colors.border,
                                isActive && colors.glow,
                                isOpen ? colors.bg : "bg-card/30 hover:bg-card/60"
                            )} onClick={() => setExpandedLayer(isOpen ? null : layer.id)}>

                                {/* animated scan line when active */}
                                {isActive && (
                                    <div className={cn("absolute top-0 left-0 h-0.5 animate-pulse w-full", colors.text.replace('text-', 'bg-'))} style={{ opacity: 0.5 }} />
                                )}

                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Step badge */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center border text-xs font-black font-mono shrink-0",
                                            colors.badge, colors.text
                                        )}>
                                            {layer.id}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Icon className={cn("w-4 h-4", colors.text)} />
                                                <h3 className="font-bold text-sm tracking-tight">{layer.name}</h3>
                                                {isActive && (
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded animate-pulse", colors.badge, colors.text)}>
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{layer.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        {layer.confidence && (
                                            <div className="text-right hidden sm:block">
                                                <p className={cn("text-sm font-black", colors.text)}>{layer.confidence}%</p>
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Confidence</p>
                                            </div>
                                        )}
                                        {layer.latency_ms && (
                                            <div className="text-right hidden md:block">
                                                <p className="text-sm font-black text-foreground">{layer.latency_ms}ms</p>
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Latency</p>
                                            </div>
                                        )}
                                        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                </div>

                                {/* Expanded detail */}
                                {isOpen && (
                                    <div className={cn("px-4 pb-5 border-t animate-fade-in", colors.border)}>
                                        {layer.current_activity && (
                                            <div className={cn("mt-3 mb-4 px-3 py-2 rounded-lg border text-xs font-mono flex items-center gap-2", colors.badge, colors.border)}>
                                                <Activity className={cn("w-3 h-3 animate-pulse", colors.text)} />
                                                <span className="text-muted-foreground">Current: </span>
                                                <span className={colors.text}>{layer.current_activity}</span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                                            {layer.components.map((c, i) => (
                                                <div key={i} className={cn("p-3 rounded-lg border transition-all hover:scale-[1.02]", colors.badge, colors.border)}>
                                                    <p className={cn("text-xs font-bold mb-1", colors.text)}>{c.name}</p>
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed">{c.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {layer.throughput && (
                                            <p className="text-[10px] text-muted-foreground mt-3 font-mono">
                                                ⚡ Throughput: <span className={colors.text}>{layer.throughput}</span>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Arrow connector between layers */}
                            {idx < (layers.length > 0 ? layers.length : STATIC_LAYERS.length) - 1 && (
                                <div className="flex justify-center py-1 z-10 relative">
                                    <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Feedback loop card */}
            <div className="mt-4 p-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/5 via-cyan-500/5 to-purple-500/5 relative overflow-hidden">
                <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                        <RefreshCw className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-primary mb-1">🔄 FEEDBACK LOOP — CONTINUOUS LEARNING</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Human analyst corrections → Retraining pipeline → Model updates → Improved accuracy.
                            <strong className="text-foreground"> RADAR framework</strong> + <strong className="text-foreground">federated learning</strong> ensure adversarial robustness without centralized data exposure.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBackend = () => (
        <div className="space-y-4 animate-fade-in">
            <div>
                <h2 className="text-lg font-bold">Backend Workflow — From the Paper</h2>
                <p className="text-xs text-muted-foreground">
                    9-layer server-side pipeline described in Syllaidopoulos et al. · IEEE Access 2025
                </p>
            </div>

            {(workflow?.layers ?? STATIC_WORKFLOW).map((layer) => {
                const isOpen = expandedWorkflow === layer.id;
                return (
                    <div key={layer.id}
                        className={cn("glass-card border transition-all cursor-pointer", isOpen ? "border-primary/40 bg-primary/5" : "border-border/50 hover:border-border")}
                        onClick={() => setExpandedWorkflow(isOpen ? null : layer.id)}>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-black font-mono text-primary">
                                    {String(layer.step).padStart(2, '0')}
                                </div>
                                <h3 className="font-bold text-sm">{layer.title}</h3>
                            </div>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>

                        {isOpen && (
                            <div className="px-4 pb-4 border-t border-border/50 animate-fade-in">
                                {layer.items && (
                                    <ul className="mt-3 space-y-2">
                                        {layer.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {layer.models && (
                                    <div className="mt-3 overflow-x-auto">
                                        <table className="w-full text-left text-[11px]">
                                            <thead>
                                                <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-black text-[9px]">
                                                    <th className="pb-2 pr-4">Model</th>
                                                    <th className="pb-2 pr-4">Task</th>
                                                    <th className="pb-2">Backend Tech</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {layer.models.map((m, i) => (
                                                    <tr key={i} className="hover:bg-primary/5 transition-colors">
                                                        <td className="py-2 pr-4 font-bold text-primary font-mono">{m.model}</td>
                                                        <td className="py-2 pr-4 text-foreground">{m.task}</td>
                                                        <td className="py-2 text-muted-foreground italic">{m.tech}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Tech stack */}
            {workflow?.tech_stack && (
                <div className="glass-card p-5 border-border/50">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-primary" /> Backend Tech Stack (Paper Reference)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(workflow.tech_stack).map(([k, v]) => (
                            <div key={k} className="flex items-start gap-2 text-xs">
                                <span className="text-muted-foreground capitalize min-w-[120px]">{k.replace(/_/g, ' ')}:</span>
                                <span className="text-foreground font-medium">{v}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-[10px] text-muted-foreground italic border-t border-border/50 pt-3">
                        📄 {workflow.paper_reference}
                    </p>
                </div>
            )}
        </div>
    );

    const renderModels = () => (
        <div className="space-y-4 animate-fade-in">
            <div>
                <h2 className="text-lg font-bold">AI Model Serving Backend</h2>
                <p className="text-xs text-muted-foreground">All ML/DL models described in the research paper and their deployment context</p>
            </div>
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/40 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                            <tr>
                                <th className="px-5 py-4">#</th>
                                <th className="px-5 py-4">Model / Algorithm</th>
                                <th className="px-5 py-4">Task</th>
                                <th className="px-5 py-4">Backend Tech</th>
                                <th className="px-5 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {MODEL_TABLE.map((m, i) => (
                                <tr key={i} className="hover:bg-primary/5 transition-colors group">
                                    <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{String(i + 1).padStart(2, '0')}</td>
                                    <td className="px-5 py-3.5 text-sm font-bold text-primary font-mono">{m.model}</td>
                                    <td className="px-5 py-3.5 text-sm text-foreground">{m.task}</td>
                                    <td className="px-5 py-3.5 text-xs text-muted-foreground italic">{m.tech}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            i < 3 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                : i < 7 ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                        )}>
                                            {i < 3 ? "ACTIVE" : i < 7 ? "SIMULATED" : "PLANNED"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MSDF Block */}
            <div className="glass-card p-5 border-cyan-500/30 bg-cyan-500/5">
                <h3 className="font-bold text-sm flex items-center gap-2 text-cyan-400 mb-3">
                    <Network className="w-4 h-4" /> Multi-Sensor Data Fusion (MSDF) — Combining All Models
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {["IMINT", "GEOINT", "OSINT", "HUMINT", "SIGINT", "MASINT"].map(s => (
                        <div key={s} className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <p className="text-xs font-black text-cyan-400">{s}</p>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                    ▶ CNN processes visual/grid-structured data (satellite, CCTV) · RNN processes sequential/temporal data (attack timelines) ·
                    Output: <strong className="text-foreground">unified threat score per entity/event</strong>
                </p>
            </div>
        </div>
    );

    const renderChallenges = () => (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-lg font-bold">⚡ Key System Challenges</h2>
                <p className="text-xs text-muted-foreground">Critical issues flagged in the research paper that affect real-world deployment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHALLENGES.map((c, i) => (
                    <div key={i} className="glass-card p-5 border-border/50 hover:border-primary/30 transition-all group">
                        <c.icon className={cn("w-7 h-7 mb-3 group-hover:scale-110 transition-transform", c.color)} />
                        <p className="font-bold text-sm">{c.label}</p>
                    </div>
                ))}
            </div>

            {/* Governance block */}
            <div className="glass-card p-6 border-orange-500/30 bg-orange-500/5">
                <h3 className="font-bold text-sm flex items-center gap-2 text-orange-400 mb-4">
                    <BookOpen className="w-4 h-4" /> Governance & Compliance Layer
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { title: "EU AI Act / GDPR", desc: "Full audit logging of every AI decision required for high-risk classification systems" },
                        { title: "RBAC", desc: "Role-based access control for classified outputs — analyst vs. officer vs. admin tiers" },
                        { title: "Regulatory Sandbox", desc: "Safe testing environment before live deployment of new models or rules" },
                        { title: "Cross-Agency Protocols", desc: "Europol, FBI, national agencies secure data-sharing frameworks" },
                        { title: "Privacy-Preserving Computation", desc: "Personal data never exposed in model outputs — federated learning approach" },
                        { title: "Adversarial Testing (RADAR)", desc: "Evasion and poisoning attack simulation before every model release" },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3">
                            <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-foreground">{item.title}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Paper citation */}
            <div className="p-4 rounded-xl border border-border/50 bg-secondary/30 flex items-start gap-3">
                <Microscope className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Research Basis:</strong> Syllaidopoulos, I., Ntalianis, K. S., & Salmon, I. (2025).
                    A Comprehensive Survey on AI in Counter-Terrorism and Cybersecurity: Challenges and Ethical Dimensions.
                    <em> IEEE Access, 13</em>, 91740–91780. DOI: 10.1109/ACCESS.2025.3572348
                </p>
            </div>
        </div>
    );

    // ── Static fallback data (used when backend offline) ────────────────────

    const STATIC_LAYERS: PipelineLayer[] = [
        { id: "01", name: "INPUT LAYER", subtitle: "Data Collection & Sources", color: "blue", confidence: 94, throughput: "3200 events/sec", latency_ms: 12, current_activity: "OSINT crawlers syncing...", components: [{ name: "OSINT Feeds", detail: "GTD, dark web crawlers, news APIs" }, { name: "SIGINT/IMINT", detail: "Signals intelligence, satellite imagery" }, { name: "CROSINT", detail: "Crowdsourced citizen intelligence" }, { name: "IoT / CPS", detail: "Sensor networks, industrial systems" }, { name: "Social Media", detail: "Twitter, Telegram, dark forums" }, { name: "HUMINT", detail: "Field reports, confidential sources" }] },
        { id: "02", name: "DATA FUSION LAYER", subtitle: "Multi-Source Integration & Pre-processing", color: "purple", confidence: 91, throughput: "2800 events/sec", latency_ms: 18, current_activity: "Feature-level context integration...", components: [{ name: "Noise Filtering", detail: "Remove bots, troll accounts, sockpuppets" }, { name: "Tokenization", detail: "NLP feature extraction, keyword extraction" }, { name: "Class Balancing", detail: "Fix threat/non-threat imbalance (SMOTE)" }, { name: "IoC Extraction", detail: "IPs, URLs, CVEs, file hashes" }, { name: "MSDF", detail: "Multi-Sensor Data Fusion integration" }, { name: "SAR Despeckling", detail: "Satellite/radar imagery preprocessing" }] },
        { id: "03", name: "AI PROCESSING LAYER", subtitle: "Core ML/DL Models & Analytics", color: "cyan", confidence: 96, throughput: "1800 events/sec", latency_ms: 35, current_activity: "BERT attention-layer analysis...", components: [{ name: "SVM + KNN", detail: "Terrorist zone prediction" }, { name: "XGBoost + PSO", detail: "Attack prediction, weapon classification" }, { name: "LSTM + Autoencoder", detail: "Network intrusion detection" }, { name: "BERT / SecurityBERT", detail: "Misinformation, phishing, IoT threats" }, { name: "GNN + STGCN", detail: "Extremist network mapping" }, { name: "GCPDDQN (RL)", detail: "Counter-UAV swarm neutralization" }] },
        { id: "04", name: "THREAT DETECTION LAYER", subtitle: "Real-Time Analysis & Classification", color: "red", confidence: 93, throughput: "1200 events/sec", latency_ms: 22, current_activity: "Autoencoder reconstruction verification...", components: [{ name: "IDS Engine", detail: "Real-time packet monitoring" }, { name: "Anomaly Detector", detail: "IsolationForest outlier scoring" }, { name: "UEBA", detail: "User/Entity Behavioral Analytics" }, { name: "E2E-RDS", detail: "End-to-end ransomware detection" }, { name: "Severity Ranker", detail: "Critical / High / Medium / Low" }, { name: "Alert Queue", detail: "Real-time alert dispatch pipeline" }] },
        { id: "05", name: "EXPLAINABILITY LAYER (XAI)", subtitle: "Transparency, Bias Mitigation & Auditability", color: "green", confidence: 89, throughput: "800 events/sec", latency_ms: 28, current_activity: "Generating SHAP feature values...", components: [{ name: "SHAP", detail: "Feature contribution scores per prediction" }, { name: "LIME", detail: "Local approximation of decision boundary" }, { name: "TRUST / MetaCluster", detail: "IoT/CPS model-agnostic explanation" }, { name: "Bias Auditor", detail: "Detect discriminatory patterns in training data" }, { name: "Report Generator", detail: "Human-readable analyst reports" }, { name: "Confidence Scorer", detail: "Calibrated probability outputs" }] },
        { id: "06", name: "OUTPUT & GOVERNANCE LAYER", subtitle: "Decision Support, Alerts & Oversight", color: "orange", confidence: 97, throughput: "600 events/sec", latency_ms: 8, current_activity: "Dispatching alert notifications...", components: [{ name: "Analyst Dashboard", detail: "Threat maps, charts, reports" }, { name: "Email / Alert Dispatch", detail: "SMTP alerts for critical events" }, { name: "Audit Log", detail: "Full AI decision trail (EU AI Act)" }, { name: "RBAC", detail: "Role-based access control for classified outputs" }, { name: "Regulatory Sandbox", detail: "Safe testing before live deployment" }, { name: "Cross-Agency Sharing", detail: "Europol, FBI, national agencies protocols" }] },
    ];

    const STATIC_WORKFLOW: WorkflowLayer[] = [
        { id: "ingestion", step: 1, title: "Data Ingestion Backend", items: ["Dark Crawler & Posit Toolkit — social platforms, dark web, news feeds", "Stream processors — IoT sensor data, SIGINT, network traffic", "API connectors — GTD, Europol, border control", "Crowdsource receivers — AlertCorps, Ushahidi"] },
        { id: "storage", step: 2, title: "Data Storage Backend", items: ["Relational DB — historical attack records 1970–2025", "Document stores — social media posts, news, multimedia", "Graph databases — terrorist network nodes/edges", "Time-series stores — SIGINT streams, behavioral logs"] },
        { id: "preprocessing", step: 3, title: "Pre-processing Backend", items: ["Noise filtering — removes bots, sockpuppets", "Tokenization & NLP feature extraction", "Class balancing (SMOTE)", "IoC extraction — IPs, URLs, file hashes, CVEs"] },
        { id: "model_serving", step: 4, title: "AI Model Serving Backend", models: MODEL_TABLE.map(m => ({ model: m.model, task: m.task, tech: m.tech })) },
        { id: "msdf", step: 5, title: "Multi-Sensor Data Fusion (MSDF)", items: ["Combines IMINT + GEOINT + OSINT + HUMINT + SIGINT + MASINT", "CNN for visual/grid-structured data", "RNN for sequential/temporal data", "Output: unified threat score per entity"] },
        { id: "ids", step: 6, title: "Intrusion Detection System (IDS) Backend", items: ["Real-time packet monitoring", "LSTM-AE hybrid detects novel patterns", "Bayesian networks model probabilistic attack chains", "E2E-RDS + AIRaD for ransomware"] },
        { id: "xai", step: 7, title: "Explainability (XAI) Backend", items: ["SHAP — feature contribution scores", "LIME — local decision boundary", "TRUST / MetaCluster — IoT/CPS environments", "Bias auditing pipeline"] },
        { id: "feedback", step: 8, title: "Feedback & Retraining Backend", items: ["Human analyst corrections to training pipeline", "Federated Learning — distributed nodes", "Transfer Learning — new threat domains", "RADAR adversarial robustness testing"] },
        { id: "governance", step: 9, title: "Governance & Compliance Backend", items: ["Full audit logging (EU AI Act / GDPR)", "Role-based access control", "Regulatory sandbox for testing", "Cross-agency sharing protocols"] },
    ];

    // ── Main render ──────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            <Brain className="w-7 h-7 text-primary" />
                            AI Counter-Terrorism & Cybersecurity Pipeline
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Full system architecture from the IEEE Access 2025 research paper — visualized live
                        </p>
                    </div>
                    {loading && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" /> Syncing with backend...
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1 p-1 bg-secondary/40 rounded-xl w-fit">
                    {[
                        { id: 'pipeline', label: 'AI Pipeline', icon: Layers },
                        { id: 'backend', label: 'Backend Workflow', icon: Database },
                        { id: 'models', label: 'ML Model Table', icon: Brain },
                        { id: 'challenges', label: 'Challenges', icon: AlertTriangle },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all",
                                activeTab === t.id
                                    ? "bg-background text-primary shadow-sm"
                                    : "text-muted-foreground hover:bg-background/30"
                            )}
                        >
                            <t.icon className="w-3.5 h-3.5" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'pipeline' && renderPipeline()}
                {activeTab === 'backend' && renderBackend()}
                {activeTab === 'models' && renderModels()}
                {activeTab === 'challenges' && renderChallenges()}
            </div>
        </DashboardLayout>
    );
};

export default AIPipeline;
