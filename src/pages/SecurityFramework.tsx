import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import {
    Brain, Shield, Zap, Search, Globe, Filter, Layers,
    Network, Target, Info, CheckCircle2, AlertTriangle,
    ChevronRight, ArrowRight, Activity, Database, Cpu,
    GitBranch, Beaker, FileSearch, Users, RefreshCw
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SecurityFramework = () => {
    const [activeTab, setActiveTab] = useState<'architecture' | 'decision' | 'pipelines' | 'matrix'>('architecture');
    const [scenario, setScenario] = useState<string | null>(null);

    const PIPELINES = [
        {
            id: 'predictive',
            title: '1. Predictive Analytics Pipeline',
            steps: [
                { label: 'Historical Data', desc: 'Attack patterns 1970-2025', icon: Database },
                { label: 'Feature Engineering', desc: 'Location, time, target type', icon: Filter },
                { label: 'Model Training', desc: 'XGBoost + PSO optimization', icon: Cpu },
                { label: 'Prediction', desc: '96.6% accuracy threshold', icon: Target }
            ]
        },
        {
            id: 'nlp',
            title: '2. NLP Extremism Detection Pipeline',
            steps: [
                { label: 'Text Input', desc: 'Social media / Encrypted logs', icon: Search },
                { label: 'Preprocessing', desc: 'Tokenization, cleaning', icon: Filter },
                { label: 'BERT Encoding', desc: 'Contextual embeddings', icon: Brain },
                { label: 'Classification', desc: 'Extremist/Normal mapping', icon: Shield }
            ],
            logic: [
                'Bidirectional context understanding',
                'Attention mechanism highlights key phrases',
                'Fine-tuned on extremist content datasets'
            ]
        },
        {
            id: 'disruption',
            title: '3. Social Network Disruption Logic',
            steps: [
                { label: 'Step 1: Mapping', desc: 'GNN extracts relationships', icon: Network },
                { label: 'Step 2: Analysis', desc: 'Calculate betweenness centrality', icon: Activity },
                { label: 'Step 3: Disruption', desc: 'Target high-centrality nodes', icon: Zap }
            ],
            metrics: [
                { node: 'Node A', val: 0.85, star: true },
                { node: 'Node B', val: 0.72, star: false },
                { node: 'Node C', val: 0.43, star: false }
            ]
        }
    ];

    const MATRIX_DATA = [
        { scenario: 'Predict attack location', type: 'Historical events', method: 'XGBoost + PSO', logic: 'Spatial-temporal patterns' },
        { scenario: 'Detect hate speech', type: 'Text posts', method: 'BERT + BiLSTM', logic: 'Contextual semantics' },
        { scenario: 'Network intrusion', type: 'Traffic logs', method: 'LSTM-Autoencoder', logic: 'Anomaly from normal' },
        { scenario: 'Map terror network', type: 'Relationships', method: 'GNN + Centrality', logic: 'Graph structure analysis' },
        { scenario: 'Verify fake news', type: 'Articles + metadata', method: 'FakeBERT + HITL', logic: 'Semantic + human check' }
    ];

    const renderArchitecture = () => (
        <div className="space-y-8 animate-fade-in py-4">
            <div className="grid grid-cols-1 gap-12 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden md:block" />

                <div className="space-y-4 relative">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest">01 Data Collection Layer</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {['OSINT', 'SIGINT', 'HUMINT', 'IMINT', 'CROSINT', 'IoT'].map(d => (
                            <div key={d} className="p-4 glass-card bg-secondary/30 border-border/50 text-center hover:border-primary/50 transition-all cursor-default group">
                                <p className="text-xs font-bold group-hover:text-primary transition-colors">{d}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 relative">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest">02 Fusion & Preprocessing</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { title: 'Cleaning', items: ['Remove noise', 'Handle missing', 'Normalize'] },
                            { title: 'Integration', items: ['MSDF', 'Timestamp align', 'Entity matching'] },
                            { title: 'Feature Extract', items: ['NLP embeddings', 'Image features', 'Graph metrics'] },
                            { title: 'Verification', items: ['Cross-reference', 'Reliability score', 'Bias detection'] }
                        ].map(l => (
                            <div key={l.title} className="p-4 glass-card border-primary/10 bg-primary/5">
                                <h4 className="text-[10px] font-black uppercase text-primary mb-3">{l.title}</h4>
                                <ul className="space-y-1">
                                    {l.items.map(i => <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-1"><ChevronRight className="w-2 h-2" /> {i}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 relative">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest">03 AI Processing & Analysis</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 glass-card border-glow bg-card/50">
                            <h4 className="text-xs font-bold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Predictive Models</h4>
                            <div className="space-y-2 text-[10px] font-mono text-muted-foreground">
                                <p><span className="text-foreground font-bold">XGBoost:</span> Attack prediction</p>
                                <p><span className="text-foreground font-bold">LSTM:</span> Sequence analysis</p>
                                <p><span className="text-foreground font-bold">Random Forest:</span> Risk scoring</p>
                            </div>
                        </div>
                        <div className="p-6 glass-card border-glow bg-card/50">
                            <h4 className="text-xs font-bold mb-4 flex items-center gap-2"><Search className="w-4 h-4 text-primary" /> Detection Models</h4>
                            <div className="space-y-2 text-[10px] font-mono text-muted-foreground">
                                <p><span className="text-foreground font-bold">BERT:</span> Text classification</p>
                                <p><span className="text-foreground font-bold">CNN:</span> Image analysis</p>
                                <p><span className="text-foreground font-bold">Autoencoder:</span> Anomalies</p>
                            </div>
                        </div>
                        <div className="p-6 glass-card border-glow bg-card/50">
                            <h4 className="text-xs font-bold mb-4 flex items-center gap-2"><Network className="w-4 h-4 text-primary" /> Network Analysis</h4>
                            <div className="space-y-2 text-[10px] font-mono text-muted-foreground">
                                <p><span className="text-foreground font-bold">GNN:</span> Relationship map</p>
                                <p><span className="text-foreground font-bold">STGCN:</span> Spread predict</p>
                                <p><span className="text-foreground font-bold">Centrality:</span> Key nodes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDecision = () => (
        <div className="max-w-4xl mx-auto py-10 space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Decision Logic Support</h2>
                <p className="text-muted-foreground uppercase text-[10px] font-mono tracking-widest font-black">Method Selection Wizard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { id: 'text', title: 'Text-Based Threats', icon: Search, desc: 'Extremist content, phishing' },
                    { id: 'network', title: 'Network Threats', icon: Shield, desc: 'Intrusions, malware' },
                    { id: 'org', title: 'Organizational Threats', icon: Users, desc: 'Terrorist networks' }
                ].map(s => (
                    <button
                        key={s.id}
                        onClick={() => setScenario(s.id)}
                        className={cn(
                            "p-6 rounded-2xl border transition-all text-left group",
                            scenario === s.id ? "bg-primary/10 border-primary shadow-lg" : "bg-card hover:border-primary/50"
                        )}
                    >
                        <s.icon className={cn("w-8 h-8 mb-4", scenario === s.id ? "text-primary" : "text-muted-foreground")} />
                        <h3 className="font-bold mb-1">{s.title}</h3>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </button>
                ))}
            </div>

            {scenario && (
                <div className="p-8 glass-card border-primary/20 bg-primary/5 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-start gap-6">
                        <div className="w-px h-32 bg-primary/30 relative">
                            <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-primary" />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-black uppercase text-primary mb-2">Recommended Method: {
                                    scenario === 'text' ? 'NLP Pipeline' :
                                        scenario === 'network' ? 'Deep Learning Anomaly' :
                                            'Graph Neural Analysis'
                                }</h4>
                                <ul className="space-y-2">
                                    {scenario === 'text' && ['BERT for context', 'Sentiment analysis', 'Topic modeling'].map(i => <li key={i} className="text-sm font-mono flex items-center gap-2"><ArrowRight className="w-3 h-3" /> {i}</li>)}
                                    {scenario === 'network' && ['LSTM-Autoencoder', 'Anomaly detection', 'Real-time monitoring'].map(i => <li key={i} className="text-sm font-mono flex items-center gap-2"><ArrowRight className="w-3 h-3" /> {i}</li>)}
                                    {scenario === 'org' && ['GNN mapping', 'Centrality metrics', 'STGCN prediction'].map(i => <li key={i} className="text-sm font-mono flex items-center gap-2"><ArrowRight className="w-3 h-3" /> {i}</li>)}
                                </ul>
                            </div>

                            <div className="pt-4 border-t border-primary/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Explainability Check</p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded bg-success" />
                                                <span className="text-xs font-bold">XAI Required (SHAP)</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground italic">High-stakes decision logic active.</span>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow-glow hover:scale-105 transition-all">Initialize Pipeline</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">AI Security Framework</h1>
                            <p className="text-muted-foreground">Comprehensive system architecture and logic flow (Research Context Reference).</p>
                        </div>

                        <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl w-fit">
                            {[
                                { id: 'architecture', label: 'Architecture', icon: Layers },
                                { id: 'decision', label: 'Decision Logic', icon: GitBranch },
                                { id: 'pipelines', label: 'Logic Pipelines', icon: Beaker },
                                { id: 'matrix', label: 'Method Matrix', icon: FileSearch }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id as any)}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
                                        activeTab === t.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-background/30"
                                    )}
                                >
                                    <t.icon className="w-4 h-4" />
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'architecture' && renderArchitecture()}
                        {activeTab === 'decision' && renderDecision()}

                        {activeTab === 'pipelines' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4 animate-fade-in">
                                {PIPELINES.map(p => (
                                    <div key={p.id} className="glass-card p-6 border-primary/20">
                                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                                            <Zap className="w-5 h-5" />
                                            {p.title}
                                        </h3>
                                        <div className="space-y-8 relative">
                                            {p.steps.map((s, i) => (
                                                <div key={s.label} className="flex gap-4 group">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center relative z-10 group-hover:border-primary transition-colors">
                                                            <s.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                        </div>
                                                        {i < p.steps.length - 1 && <div className="w-px flex-1 bg-border/50 my-1" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold mb-0.5">{s.label}</h4>
                                                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {p.metrics && (
                                            <div className="mt-8 p-4 bg-secondary/20 rounded-xl space-y-3">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Node Centrality Snapshot</p>
                                                {p.metrics.map(m => (
                                                    <div key={m.node} className="flex items-center justify-between">
                                                        <span className="text-xs font-mono">{m.node} {m.star && '⭐'}</span>
                                                        <span className="text-xs font-mono font-bold text-primary">{m.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {p.id === 'predictive' && (
                                            <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-primary">Model Performance</span>
                                                    <span className="text-xs font-mono font-bold text-primary">96.6% Accuracy</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary animate-pulse" style={{ width: '96.6%' }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="glass-card p-6 border-success/20 bg-success/5 lg:col-span-2">
                                    <div className="flex items-start justify-between mb-8">
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center gap-2 text-success">
                                                <Beaker className="w-5 h-5" />
                                                4. Explainable AI (XAI) Layer
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">SHAP Method Implementation : Feature Importance Scores</p>
                                        </div>
                                        <div className="px-3 py-1 bg-success/20 text-success border border-success/30 rounded-full text-[9px] font-mono">MODEL_AGNOSTIC_ACTIVE</div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            {[
                                                { label: 'Keyword: "attack"', val: 0.8, color: 'bg-destructive' },
                                                { label: 'Post frequency', val: 0.6, color: 'bg-warning' },
                                                { label: 'Network size', val: 0.4, color: 'bg-primary' }
                                            ].map(f => (
                                                <div key={f.label} className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span>{f.label}</span>
                                                        <span>{f.val}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                        <div className={cn("h-full rounded-full transition-all duration-1000", f.color)} style={{ width: `${f.val * 100}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-background/50 p-6 rounded-2xl border border-success/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Info className="w-12 h-12 text-success" />
                                            </div>
                                            <h4 className="text-xs font-black uppercase text-success mb-4 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" /> Analyst Interpretation
                                            </h4>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                                                "High-risk classification driven primarily by violent language patterns. Network connections suggest coordination. Recommend further investigation."
                                            </p>
                                            <div className="mt-6 flex items-center gap-2 px-3 py-2 bg-success text-success-foreground rounded-lg text-[10px] font-bold uppercase tracking-widest w-fit">
                                                Decision Validated
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'matrix' && (
                            <div className="glass-card overflow-hidden animate-fade-in py-4">
                                <div className="p-6 border-b border-border bg-secondary/20">
                                    <h3 className="text-lg font-bold">Method Selection Matrix</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Optimization guide for scenario-specific AI deployment</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-secondary/30 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                            <tr>
                                                <th className="px-6 py-4">Scenario</th>
                                                <th className="px-6 py-4">Data Type</th>
                                                <th className="px-6 py-4">Recommended Method</th>
                                                <th className="px-6 py-4">Key Logic</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {MATRIX_DATA.map((row, i) => (
                                                <tr key={i} className="hover:bg-primary/5 transition-colors group">
                                                    <td className="px-6 py-4 text-sm font-bold">{row.scenario}</td>
                                                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{row.type}</td>
                                                    <td className="px-6 py-4 text-xs font-mono text-primary font-bold">{row.method}</td>
                                                    <td className="px-6 py-4 text-xs italic text-muted-foreground">{row.logic}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="p-8 rounded-3xl bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 relative overflow-hidden group">
                            <div className="absolute inset-0 cyber-grid opacity-10" />
                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-glow animate-pulse">
                                    <RefreshCw className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <h3 className="text-xl font-bold font-mono tracking-widest uppercase">Continuous Feedback Loop</h3>
                                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                    Results feed back to improve models • Human corrections update training data • New threats trigger automated retraining.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SecurityFramework;
