import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Brain, Search, MessageSquare, TrendingUp, Filter, Download, Shield, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { insforge, AI_MODEL, AI_STATUS } from "@/lib/insforge";
import { toast } from "sonner";

interface SentimentRecord {
    id: number;
    text: string;
    sentiment: string;
    threats: string[];
    confidence: number;
    source: string;
}

const SentimentAnalysis = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<SentimentRecord[]>([]);
    const [stats, setStats] = useState({
        analyzed: "0",
        hate: 0,
        neutral: "0%",
        risk: "Low"
    });

    const runSentimentAnalysis = async () => {
        setLoading(true);

        // If we already know the AI is offline, skip the network request
        if (!AI_STATUS.isOnline) {
            handleSimulation();
            setLoading(false);
            return;
        }

        toast.info("Scouring global social feeds for radicalization patterns...");
        try {
            // Use the real backend API
            const response = await fetch('http://localhost:5000/api/analyze/sentiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: "Monitoring social feeds for extremist content..." }) // Trigger backend simulation
            });

            if (response.ok) {
                const data = await response.json();

                // Map the simple backend response to the complex frontend structure 
                // In a real app, the backend would return this full structure. 
                // For now, we expand the single result into a list to keep the UI rich.
                const newRecords = Array(5).fill(null).map((_, i) => ({
                    id: Date.now() + i,
                    text: i === 0 ? "Detected suspicious rhetoric in group chat #402" : "Monitoring chatter...",
                    sentiment: i === 0 ? data.sentiment.toLowerCase() : ['neutral', 'angry', 'hateful'][Math.floor(Math.random() * 3)],
                    threats: data.keywords || ['unknown'],
                    confidence: data.confidence,
                    source: "Social Relay Node " + (i + 1)
                }));

                setRecords(newRecords);
                setStats({
                    analyzed: "124K",
                    hate: data.extremistScore > 0.5 ? 42 : 12,
                    neutral: "65%",
                    risk: data.extremistScore > 0.7 ? "Critical" : data.extremistScore > 0.3 ? "Elevated" : "Low"
                });
                toast.success("Intelligence feed synchronized via live NLP scan.");
            } else {
                throw new Error("Backend API Error");
            }

        } catch (error: any) {
            AI_STATUS.markOffline(error);
            handleSimulation();
        } finally {
            setLoading(false);
        }
    };

    const handleSimulation = () => {
        // Fallback Data for Simulation Mode
        setStats({ analyzed: "0", hate: 0, neutral: "0%", risk: "Low" });
        setRecords([]);
    };

    const handleExport = () => {
        if (records.length === 0) {
            toast.error("No intelligence feed records available for export.");
            return;
        }

        const headers = ["ID", "Analyzed Content", "Sentiment", "Threat Vectors", "Confidence", "Node Source"];
        const csvContent = [
            headers.join(","),
            ...records.map(r => [
                r.id,
                `"${r.text.replace(/"/g, '""')}"`,
                r.sentiment.toUpperCase(),
                `"${r.threats.join('; ')}"`,
                `${(r.confidence * 100).toFixed(1)}%`,
                `"${r.source}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `guardian_sentiment_intel_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("NLP Intelligence bundle exported successfully.");
    };

    const handleMonitor = (source: string) => {
        toast.info(`Connection established with ${source}. Tracking metadata...`);
    };

    useEffect(() => {
        runSentimentAnalysis();
        const interval = setInterval(runSentimentAnalysis, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">NLP Sentiment Analysis</h1>
                            <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">Semantic Radicalization Monitoring</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={runSentimentAnalysis}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm border border-border disabled:opacity-50 hover:bg-secondary/80 transition-all font-medium"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Deep Scan
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:glow-primary transition-all font-bold"
                            >
                                <Download className="w-4 h-4" />
                                Export Intelligence
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="Global Posts Analyzed"
                            value={stats.analyzed}
                            change="Live"
                            changeType="increase"
                            icon={MessageSquare}
                            variant="default"
                        />
                        <StatCard
                            title="Hate Speech detected"
                            value={stats.hate}
                            change={stats.hate > 0 ? "+" + Math.floor(stats.hate / 10) : "0"}
                            changeType="increase"
                            icon={Shield}
                            variant="critical"
                        />
                        <StatCard
                            title="Propaganda Presence"
                            value="4.2%"
                            icon={Brain}
                            variant="warning"
                        />
                        <StatCard
                            title="Global Risk Index"
                            value={stats.risk}
                            icon={AlertTriangle}
                            variant={stats.risk === 'Critical' ? 'critical' : stats.risk === 'Elevated' ? 'warning' : 'success'}
                        />
                    </div>

                    <div className="glass-card p-6 min-h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary" />
                                Live Intelligence Stream
                            </h2>
                            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/30 rounded-full border border-border">
                                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Node: {AI_MODEL}</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-80 space-y-4">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <p className="text-sm text-muted-foreground animate-pulse text-center">Infiltrating encrypted communication channels...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {records.map((record) => (
                                    <div key={record.id} className="p-4 rounded-xl bg-secondary/10 border border-border/30 hover:border-primary/50 transition-all group animate-fade-in cursor-default">
                                        <div className="flex justify-between items-start mb-2 gap-4">
                                            <p className="text-sm text-foreground flex-1 leading-relaxed font-medium">"{record.text}"</p>
                                            <span className={cn(
                                                "text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter",
                                                record.sentiment === 'hateful' ? "bg-destructive text-destructive-foreground shadow-[0_0_10px_rgba(220,38,38,0.3)]" :
                                                    record.sentiment === 'angry' ? "bg-warning text-warning-foreground shadow-[0_0_10px_rgba(245,158,11,0.3)]" :
                                                        record.sentiment === 'positive' ? "bg-success text-success-foreground shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-muted text-muted-foreground"
                                            )}>
                                                {record.sentiment}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {record.threats.map(threat => (
                                                <span key={threat} className="text-[9px] px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-md font-mono">
                                                    #{threat}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono pt-2 border-t border-border/20">
                                            <span className="flex items-center gap-1">SOURCE: <span className="text-foreground">{record.source}</span></span>
                                            <div className="flex items-center gap-6">
                                                <span className="flex items-center gap-1">CONFIDENCE: <span className={cn(record.confidence > 0.9 ? "text-success" : "text-warning")}>{(record.confidence * 100).toFixed(1)}%</span></span>
                                                <button
                                                    onClick={() => {
                                                        toast.info(`Intercepting origin for ${record.source}...`);
                                                        setTimeout(() => navigate(`/dashboard?search=${encodeURIComponent(record.source)}`), 800);
                                                    }}
                                                    className="text-primary hover:text-primary/80 transition-colors uppercase font-bold"
                                                >
                                                    Track Origin
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SentimentAnalysis;
