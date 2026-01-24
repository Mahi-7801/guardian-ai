import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Users, Search, Filter, ShieldCheck, Globe, Clock, MessageSquare, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Report {
    id: string;
    data: {
        description: string;
        location: string;
        timestamp: string;
        isAnonymous: boolean;
        source: string;
    };
    status: string;
    timestamp: string;
}

const CrosintPortal = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        pending: 0,
        nodes: "Global"
    });

    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/reports');
            if (response.ok) {
                const data = await response.json();
                setReports(data.reverse()); // Show latest first

                setStats({
                    total: data.length,
                    verified: data.filter((r: any) => r.status === 'verified').length,
                    pending: data.filter((r: any) => r.status === 'pending').length,
                    nodes: "Active"
                });
            }
        } catch (error) {
            console.error("CROSINT Sink Offline");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
        const interval = setInterval(fetchReports, 5000); // Poll every 5s for real-time feel
        return () => clearInterval(interval);
    }, []);

    const handleVerify = (id: string) => {
        toast.success(`Intelligence ID ${id} sent to neural verification node.`);
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">CROSINT Intelligence Portal</h1>
                            <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">Crowdsourced Threat Verification & Analysis</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={fetchReports} className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-xs font-bold border border-border hover:bg-secondary/80 transition-all">
                                <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} /> Refresh Feed
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard title="Total Intel Intake" value={stats.total.toString()} icon={MessageSquare} variant="default" />
                        <StatCard title="Verified Signals" value={stats.verified.toString()} icon={ShieldCheck} variant="success" />
                        <StatCard title="Pending Validation" value={stats.pending.toString()} icon={Clock} variant="warning" />
                        <StatCard title="Active Network" value={stats.nodes} icon={Globe} variant="default" />
                    </div>

                    <div className="glass-card p-6 min-h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Real-time Intelligence Stream
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64 italic text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin mr-3 text-primary" /> Synchronizing intelligence buffers...
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 opacity-50">
                                <AlertCircle className="w-12 h-12 text-muted-foreground" />
                                <p className="text-sm">No crowdsourced intelligence signals detected in current cycle.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reports.map((report) => (
                                    <div key={report.id} className="p-5 rounded-xl bg-secondary/10 border border-border/30 hover:border-primary/50 transition-all group animate-fade-in relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all" />

                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    report.status === 'verified' ? "bg-success" : report.status === 'flagged' ? "bg-destructive" : "bg-warning animate-pulse"
                                                )} />
                                                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">{report.id}</span>
                                                <span className="text-[10px] px-2 py-0.5 bg-sidebar-accent rounded border border-sidebar-border text-muted-foreground">SOURCE: {report.data.source.toUpperCase()}</span>
                                                <span className={cn(
                                                    "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border",
                                                    report.status === 'verified' ? "bg-success/10 text-success border-success/20" :
                                                        report.status === 'flagged' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                            "bg-warning/10 text-warning border-warning/20"
                                                )}>
                                                    {report.status}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-muted-foreground font-mono">{new Date(report.timestamp).toLocaleString()}</span>
                                        </div>

                                        <p className="text-sm font-medium leading-relaxed mb-4 line-clamp-2 italic text-foreground/90">
                                            "{report.data.description}"
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-border/20">
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <Globe className="w-3 h-3 text-primary" />
                                                    {report.data.location}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <ShieldCheck className="w-3 h-3 text-success" />
                                                    {report.data.isAnonymous ? "ANONYMOUS UNIT" : "IDENTIFIED OPS"}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleVerify(report.id)}
                                                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                                            >
                                                [ Begin Verification ]
                                            </button>
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

export default CrosintPortal;
