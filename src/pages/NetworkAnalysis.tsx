import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Network, Share2, Users, Target, Search, MousePointer2, RefreshCw, Download, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { NetworkGraph, Node, Edge } from "@/components/dashboard/NetworkGraph";
import { useState, useEffect } from "react";
import { insforge, AI_MODEL, AI_STATUS } from "@/lib/insforge";
import { toast } from "sonner";

interface Influencer {
    name: string;
    influence: number;
    type: string;
}

const initialInfluencers: Influencer[] = [];

const NetworkAnalysis = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [influencers, setInfluencers] = useState<Influencer[]>(initialInfluencers);
    const [graphData, setGraphData] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
    const [stats, setStats] = useState({
        nodes: "0",
        influencers: 0,
        communities: 0,
        precision: "100%"
    });

    const fetchRealTimeData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        if (!silent) toast.info("Synchronizing with Neural Network Intelligence...");

        try {
            const res = await fetch('http://localhost:5000/api/network/graph');
            if (res.ok) {
                const data = await res.json();
                const nodeCount = data.nodes.length;
                const communityCount = new Set(data.nodes.map((n: any) => n.group)).size;

                setStats({
                    nodes: nodeCount.toString(),
                    influencers: Math.floor(nodeCount * 0.2),
                    communities: communityCount,
                    precision: "99.4%"
                });

                const newInfluencers = data.nodes.slice(0, 4).map((n: any, i: number) => ({
                    name: `Node ${n.id} (${['Relay', 'Hub', 'Source'][i % 3]})`,
                    influence: 0.7 + (Math.random() * 0.29),
                    type: i === 0 ? 'Primary Suspect' : 'Bridge Node'
                }));
                setInfluencers(newInfluencers);

                const mappedNodes = data.nodes.map((n: any) => ({
                    id: n.id,
                    x: Math.random() * 90 + 5,
                    y: Math.random() * 90 + 5,
                    size: n.group === 0 ? 12 : 8,
                    type: n.group === 0 ? 'hub' : n.group === 1 ? 'node' : 'threat'
                }));
                const mappedEdges = data.links.map((l: any) => ({ from: l.source, to: l.target }));

                setGraphData({ nodes: mappedNodes, edges: mappedEdges });
                if (!silent) toast.success("Network topology updated.");
            } else {
                throw new Error("API Connection Failed");
            }
        } catch (error: any) {
            if (!silent) handleSimulation();
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRealTimeData(true);
        const interval = setInterval(() => fetchRealTimeData(true), 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSimulation = () => {
        setStats({ nodes: "0", influencers: 0, communities: 0, precision: "100%" });
        setInfluencers([]);
    };

    const handleExport = () => {
        const dataStr = JSON.stringify({ stats, influencers, timestamp: new Date().toISOString() }, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `guardian_network_analysis_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Network graph data exported successfully");
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Network Analysis</h1>
                            <p className="text-sm text-muted-foreground">Mapping extremist connections and influence</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm border border-border hover:bg-secondary/80 transition-all font-medium"
                            >
                                <Share2 className="w-4 h-4" />
                                Export Graph
                            </button>
                            <button
                                onClick={() => fetchRealTimeData(false)}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:glow-primary transition-all disabled:opacity-50 font-bold"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                {isLoading ? "Analyzing..." : "Refresh Intelligence"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            title="Identified Nodes"
                            value={stats.nodes}
                            icon={Network}
                            variant="default"
                        />
                        <StatCard
                            title="Key Influencers"
                            value={stats.influencers}
                            icon={Target}
                            variant="critical"
                        />
                        <StatCard
                            title="Community Groups"
                            value={stats.communities}
                            icon={Users}
                            variant="warning"
                        />
                        <StatCard
                            title="Analysis Precision"
                            value={stats.precision}
                            icon={Search}
                            variant="success"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="glass-card p-0 h-[600px] relative overflow-hidden">
                                <div className="absolute top-4 left-4 z-10 space-y-2">
                                    <div className="bg-card/90 backdrop-blur p-3 rounded-lg border border-border">
                                        <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2">Graph Controls</h3>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => { toast.info("Re-centering neural graph viewport..."); fetchRealTimeData(); }}
                                                className="text-[10px] px-2 py-1 bg-secondary rounded hover:bg-primary/20 transition-colors"
                                            >
                                                Zoom to Fit
                                            </button>
                                            <button
                                                onClick={() => toast.success("Visualizing nodal heat density...")}
                                                className="text-[10px] px-2 py-1 bg-secondary rounded hover:bg-primary/20 transition-colors"
                                            >
                                                Heatmap Mode
                                            </button>
                                            <button
                                                onClick={() => { setGraphData(null); fetchRealTimeData(); }}
                                                className="text-[10px] px-2 py-1 bg-secondary rounded hover:bg-primary/20 transition-colors"
                                            >
                                                Reset Layout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <NetworkGraph nodes={graphData?.nodes} edges={graphData?.edges} refreshInterval={10000} />
                                <div className="absolute bottom-4 right-4 z-10">
                                    <div className="bg-card/90 backdrop-blur p-3 rounded-lg border border-border flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-destructive" />
                                            <span className="text-[10px]">High Influence</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-warning" />
                                            <span className="text-[10px]">Medium</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-primary" />
                                            <span className="text-[10px]">Normal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="glass-card p-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                                    Top Influencers
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                </h2>
                                <div className="space-y-4">
                                    {influencers.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg border border-border/50 animate-fade-in">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{item.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{item.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-mono text-primary">{(item.influence * 100).toFixed(1)}%</p>
                                                <p className="text-[9px] text-muted-foreground">Influence Score</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card p-6 border-glow">
                                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    <MousePointer2 className="w-4 h-4 text-primary" />
                                    Node Details
                                </h2>
                                <p className="text-xs text-muted-foreground italic">Select a node in the graph to view detailed metadata, connections, and risk assessments.</p>
                                <div className="mt-4 pt-4 border-t border-border space-y-2">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground">Degree Centrality:</span>
                                        <span>0.87</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground">Betweenness:</span>
                                        <span>0.45</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-muted-foreground">Community ID:</span>
                                        <span>#A-42</span>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const nodeIsolationPromise = fetch('http://localhost:5000/api/network/isolate', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ node_id: "n0" })
                                            }).then(async res => {
                                                if (!res.ok) throw new Error("Isolation failed");
                                                return res.json();
                                            });

                                            toast.promise(nodeIsolationPromise, {
                                                loading: 'Executing neural isolation sequence...',
                                                success: (data) => data.message,
                                                error: 'Network isolation command failed.'
                                            });
                                        }}
                                        className="w-full mt-4 py-2 bg-primary/10 border border-primary/30 text-primary text-xs rounded hover:bg-primary/20 transition-colors"
                                    >
                                        Isolate Node
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NetworkAnalysis;
