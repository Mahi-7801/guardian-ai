import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Download, Filter, Search, MoreVertical, Eye, Trash2, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";

interface IntelReport {
    id: string;
    description: string;
    location: string;
    timestamp: string;
    status: 'pending' | 'verified' | 'rejected' | 'investigating';
    source: string;
    anonymous: boolean;
}

const Reports = () => {
    const [reports, setReports] = useState<IntelReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/crosint/events`);
            const data = await res.json();

            // Transform crosint events into reports for visualization
            const mappedReports: IntelReport[] = data.map((item: any) => ({
                id: item.id.toString(),
                description: item.event,
                location: item.location,
                timestamp: new Date().toISOString(), // Mock timestamp
                status: item.verified ? 'verified' : 'pending',
                source: item.source || 'WEB_PORTAL',
                anonymous: true
            }));

            setReports(mappedReports);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            // Mock data if backend fails
            setReports([
                { id: "REP-1024", description: "Suspicious network pattern detected in Sector 7", location: "Global / Digital", timestamp: new Date().toISOString(), status: 'investigating', source: 'IDS_SYSTEM', anonymous: false },
                { id: "REP-1025", description: "Unusual social media activity targeting national infra", location: "Social Mesh", timestamp: new Date().toISOString(), status: 'verified', source: 'NLP_BETA', anonymous: true },
                { id: "REP-1026", description: "Possible phishing campaign identified", location: "Corporate Mail Server", timestamp: new Date().toISOString(), status: 'pending', source: 'USER_REPORT', anonymous: true }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'investigating'>('all');

    const filteredReports = reports.filter(r => {
        const matchesSearch =
            r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleExport = () => {
        const dataStr = JSON.stringify(filteredReports, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `guardian_intel_reports_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${filteredReports.length} reports successfully.`);
    };

    const handlePDFExport = () => {
        const printContent = document.createElement("div");
        printContent.innerHTML = `
            <style>body{font-family:sans-serif;padding:20px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:12px} th{background:#f0f0f0} h1{font-size:18px}</style>
            <h1>Guardian AI — Intelligence Reports</h1>
            <p style="font-size:11px;color:#666">Generated: ${new Date().toLocaleString()} | Total: ${filteredReports.length} reports</p>
            <table>
                <thead><tr><th>ID</th><th>Description</th><th>Location</th><th>Source</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>${filteredReports.map(r => `<tr><td>${r.id}</td><td>${r.description}</td><td>${r.location}</td><td>${r.source}</td><td>${r.status.toUpperCase()}</td><td>${new Date(r.timestamp).toLocaleDateString()}</td></tr>`).join('')}</tbody>
            </table>`;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.body.appendChild(printContent);
            printWindow.print();
            toast.success("PDF export dialog opened.");
        }
    };


    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Intelligence Reports</h1>
                    <p className="text-muted-foreground text-sm">Archived and active intelligence submissions from all vectors.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePDFExport}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                        <Download className="w-4 h-4" />
                        PDF Export
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:glow-primary transition-all"
                    >
                        <Download className="w-4 h-4" />
                        JSON Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-xl border border-border">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by ID, content, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 h-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="bg-background border border-border rounded-lg text-xs font-bold px-3 py-2 outline-none focus:border-primary cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending</option>
                                <option value="investigating">Investigating</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 space-y-4 glass-card">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground font-mono animate-pulse">Querying Intelligence Archives...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredReports.length > 0 ? filteredReports.map((report) => (
                                <div key={report.id} className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:border-primary/50 transition-all border-border/50">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                        report.status === 'verified' && 'bg-success/10 text-success',
                                        report.status === 'investigating' && 'bg-warning/10 text-warning',
                                        report.status === 'pending' && 'bg-primary/10 text-primary',
                                        report.status === 'rejected' && 'bg-destructive/10 text-destructive',
                                    )}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="text-xs font-mono font-bold text-primary">{report.id}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-bold uppercase tracking-tighter">{report.source}</span>
                                            {report.anonymous && <span className="text-[9px] text-muted-foreground italic font-medium px-1.5 border border-border rounded-full">Anonymous Submission</span>}
                                        </div>
                                        <p className="text-sm font-medium text-foreground line-clamp-1">{report.description}</p>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(report.timestamp).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Search className="w-3 h-3" /> {report.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                            report.status === 'verified' && 'bg-success/20 text-success border border-success/30',
                                            report.status === 'investigating' && 'bg-warning/20 text-warning border border-warning/30',
                                            report.status === 'pending' && 'bg-primary/20 text-primary border border-primary/30',
                                            report.status === 'rejected' && 'bg-destructive/20 text-destructive border border-destructive/30',
                                        )}>
                                            {report.status}
                                        </div>
                                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => toast.info(`Accessing encrypted payload for ${report.id}...`)}
                                                className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toast.error("Admin clearance required for deletion.")}
                                                className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center glass-card border-dashed">
                                    <p className="text-muted-foreground italic">No matching reports identified in current tactical view.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 border-warning/30 bg-warning/5">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-warning uppercase tracking-widest">
                            <AlertTriangle className="w-4 h-4" /> Priority Alerts
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-background/50 border border-warning/20">
                                <p className="text-[10px] font-mono text-warning mb-1 uppercase tracking-tighter">Immediate Attention</p>
                                <p className="text-xs font-bold leading-tight">3 Pending verifications in Southeast corridor.</p>
                            </div>
                            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                                <p className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-tighter">Baseline Update</p>
                                <p className="text-xs font-medium leading-tight text-muted-foreground">Neural sync complete for Historical Archives.</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <CheckCircle2 className="w-4 h-4 text-success" /> Quality Control
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-widest">
                                    <span className="text-muted-foreground">Verified vs Total</span>
                                    <span>84%</span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-success" style={{ width: '84%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-widest">
                                    <span className="text-muted-foreground">Investigative Speed</span>
                                    <span>Fast</span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: '92%' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Reports;
