import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AlertTriangle, Shield, Activity, Lock, Terminal, Filter, Mail, RefreshCw, Loader2, Download, Zap, MapPin } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";
import { sendAlertEmail } from "@/lib/emailService";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api-config";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { insforge, AI_MODEL, AI_STATUS } from "@/lib/insforge";

interface Alert {
    id: number;
    type: string;
    severity: 'critical' | 'warning' | 'info';
    source: string;
    location: string;
    timestamp: string;
    status: string;
}

const IntrusionDetection = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search')?.toLowerCase() || "";
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
    const emailedAlerts = useRef<Set<number>>(new Set());
    const lastAlertTime = useRef<number>(0);
    const [stats, setStats] = useState({
        active: 0,
        packets: "0",
        vulns: 0,
        shielded: "0"
    });

    // Auto-alerting Logic
    useEffect(() => {
        const sendAutoAlert = async () => {
            const { data: sessionData } = await insforge.auth.getCurrentSession();
            const userEmail = sessionData?.session?.user?.email;

            if (!userEmail) return;

            const criticalAlerts = alerts.filter(a => a.severity === 'critical');
            const now = Date.now();
            const TWENTY_FOUR_MINUTES = 24 * 60 * 1000;

            if (criticalAlerts.length > 0 && (now - lastAlertTime.current) >= TWENTY_FOUR_MINUTES) {
                const latestAlert = criticalAlerts[0];
                if (!emailedAlerts.current.has(latestAlert.id)) {
                    emailedAlerts.current.add(latestAlert.id);
                    lastAlertTime.current = now;
                    sendAlertEmail(latestAlert);
                    toast.error(`AUTONOMOUS DEFENSE: Intelligence cycle completed. Critical alert dispatched to ${userEmail}. Next update in 24m.`, {
                        style: { background: '#7f1d1d', color: 'white' }
                    });
                }
            }
        };
        sendAutoAlert();
    }, [alerts]);

    const fetchSystemAudit = async () => {
        if (alerts.length === 0) setLoading(true);

        try {
            const [threatsRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/threats`),
                fetch(`${API_BASE_URL}/api/dashboard/stats`)
            ]);

            if (threatsRes.ok && statsRes.ok) {
                const threats = await threatsRes.json();
                const statsData = await statsRes.json();

                setAlerts(threats.map((t: any) => ({
                    id: t.id,
                    type: t.type,
                    severity: t.severity,
                    source: t.source_ip,
                    location: t.location || "Unknown Node",
                    timestamp: new Date(t.timestamp).toLocaleTimeString(),
                    status: t.status === 'active' ? 'detected' : t.status
                })));

                setStats({
                    active: threats.length,
                    packets: `${statsData.blockedAttacks}M`,
                    vulns: statsData.networkAnomalies,
                    shielded: "100%"
                });
            }
        } catch (error: any) {
            console.error("Backend offline", error);
            handleSimulation();
        } finally {
            setLoading(false);
        }
    };

    const handleSimulation = () => {
        setStats({ active: 0, packets: "0", vulns: 0, shielded: "0" });
        setAlerts([]);
    };

    useEffect(() => {
        fetchSystemAudit();
        const interval = setInterval(fetchSystemAudit, 300000); // Fetch data every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const handleAlert = async (alert: any) => {
        const { data: sessionData } = await insforge.auth.getCurrentSession();
        const userEmail = sessionData?.session?.user?.email || "registered protocol contact";

        toast.promise(sendAlertEmail(alert), {
            loading: 'Informing security response team...',
            success: (res: any) => `Emergency alert dispatched to ${userEmail} (via ${res.method})`,
            error: 'Uplink failure. Manual intervention required.'
        });
    };

    const handleDownloadLogs = () => {
        if (alerts.length === 0) {
            toast.error("No intelligence records available for export.");
            return;
        }

        const headers = ["ID", "Type", "Severity", "Source IP", "Location", "Timestamp", "Status"];
        const csvContent = [
            headers.join(","),
            ...alerts.map(a => [
                a.id,
                a.type,
                a.severity,
                a.source,
                `"${a.location}"`,
                a.timestamp,
                a.status
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `guardian_security_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Security log bundle generated and downloaded successfully.");
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesFilter = filter === 'all' || alert.severity === filter;
        const matchesSearch = !searchQuery ||
            alert.location.toLowerCase().includes(searchQuery) ||
            alert.type.toLowerCase().includes(searchQuery) ||
            alert.source.toLowerCase().includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Intrusion Detection System</h1>
                    <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">Real-time Perimeter Defense</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleDownloadLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm border border-border hover:bg-secondary/80 transition-all font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Export Logs
                    </button>
                    <button
                        onClick={fetchSystemAudit}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:glow-primary transition-all disabled:opacity-50 font-bold"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Refresh Logs
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Active Infiltrations"
                    value={stats.active}
                    change={stats.active > 0 ? "+" + stats.active : "0"}
                    changeType={stats.active > 0 ? "increase" : "neutral"}
                    icon={AlertTriangle}
                    variant="critical"
                />
                <StatCard
                    title="Traffic Volume"
                    value={stats.packets}
                    change="Live Scan"
                    changeType="increase"
                    icon={Activity}
                    variant="default"
                />
                <StatCard
                    title="Exposed Vectors"
                    value={stats.vulns}
                    icon={Lock}
                    variant="warning"
                />
                <StatCard
                    title="Fortified Nodes"
                    value={stats.shielded}
                    icon={Shield}
                    variant="success"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-primary" />
                                Live Intrusion Log
                            </h2>
                            <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg border border-border">
                                {['all', 'critical', 'warning'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f as any)}
                                        className={cn(
                                            "px-3 py-1 text-[10px] rounded uppercase font-bold transition-all",
                                            filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-sm text-muted-foreground animate-pulse text-center font-mono">Intercepting deep-packet metadata...</p>
                            </div>
                        ) : filteredAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 opacity-50 italic text-sm text-center">
                                No threats detected for the selected filter.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredAlerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={cn(
                                            "p-3 rounded-lg border-l-4 flex justify-between items-center animate-fade-in group hover:bg-secondary/20 transition-all",
                                            alert.severity === 'critical' ? "bg-destructive/5 border-destructive shadow-[0_0_10px_rgba(220,38,38,0.1)]" :
                                                alert.severity === 'warning' ? "bg-warning/5 border-warning" : "bg-primary/5 border-primary"
                                        )}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-sm text-foreground">{alert.type}</p>
                                                <span className={cn(
                                                    "text-[8px] px-1.5 py-0.5 rounded font-black uppercase",
                                                    alert.severity === 'critical' ? "bg-destructive text-destructive-foreground" :
                                                        alert.severity === 'warning' ? "bg-warning text-warning-foreground" : "bg-primary text-primary-foreground"
                                                )}>
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/dashboard?search=${encodeURIComponent(alert.location)}`)}
                                                    className="flex items-center gap-1 text-primary/70 hover:text-primary hover:underline transition-all cursor-pointer"
                                                    title="Track on Global Threat Map"
                                                >
                                                    <MapPin className="w-3 h-3" /> {alert.location}
                                                </button>
                                                <span className="opacity-30">|</span>
                                                {alert.source} • <span className="opacity-70">{alert.timestamp}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={cn(
                                                    "text-[9px] px-2 py-1 rounded-md uppercase font-bold border",
                                                    alert.status === 'blocked' ? "bg-success/10 text-success border-success/30" :
                                                        alert.status === 'mitigating' ? "bg-warning/10 text-warning border-warning/30" : "bg-secondary text-muted-foreground border-border"
                                                )}>
                                                    {alert.status}
                                                </span>
                                                {alert.severity === 'critical' && (
                                                    <button
                                                        onClick={() => handleAlert(alert)}
                                                        className="text-[9px] text-primary hover:text-primary/70 transition-colors flex items-center gap-1 font-bold underline underline-offset-2"
                                                    >
                                                        <Mail className="w-3 h-3" /> ESCALATE
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold mb-4 text-destructive flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Vulnerability Map
                        </h2>
                        <div className="space-y-4">
                            {[
                                { label: "Injection Vectors", value: stats.active > 0 ? Math.min(stats.vulns * 5, 85) : 12, color: "bg-destructive" },
                                { label: "Auth Bypass", value: stats.active > 5 ? 42 : 18, color: "bg-warning" },
                                { label: "Cross-Site Scripting", value: stats.active > 2 ? 65 : 24, color: "bg-destructive" },
                                { label: "API Exposure", value: Math.min(stats.vulns * 2, 40), color: "bg-warning" },
                            ].map((item) => (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span>{item.label}</span>
                                        <span className="font-mono">{item.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${item.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6 border-glow relative overflow-hidden group">
                        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" />
                            Sentinel Neural Node
                        </h2>
                        <p className="text-xs text-muted-foreground mb-4">Neural engine performing heuristic analysis on live ingress traffic.</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all cursor-help" onClick={() => toast.info("Neural node is operating at 99.4% efficiency.")}>
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),1)]" />
                                <span className="text-[10px] font-bold text-primary font-mono tracking-tighter uppercase">Model: {AI_MODEL}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-secondary/50 rounded border border-border text-center">
                                    <p className="text-[8px] text-muted-foreground uppercase font-bold">SVM Classifier</p>
                                    <p className="text-[10px] font-mono text-success">ACTIVE</p>
                                </div>
                                <div className="p-2 bg-secondary/50 rounded border border-border text-center">
                                    <p className="text-[8px] text-muted-foreground uppercase font-bold">LSTM Predictor</p>
                                    <p className="text-[10px] font-mono text-success">ACTIVE</p>
                                </div>
                            </div>
                            <p className="text-[9px] text-muted-foreground italic leading-tight">
                                Hybrid methodology integrating Support Vector Machines for anomaly detection and Long Short-Term Memory for sequential threat modeling.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch(`${API_BASE_URL}/api/settings/update`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ lockdown: true, severity: 'CRITICAL' })
                                });
                                if (res.ok) {
                                    toast.error("PROTOCOL: SYSTEM LOCKDOWN INITIATED. ALL OUTBOUND TRAFFIC QUARANTINED.", {
                                        duration: 10000,
                                        style: { background: '#991b1b', color: 'white', fontWeight: 'bold' }
                                    });
                                }
                            } catch (e) {
                                toast.error("Lockdown command failed to sync.");
                            }
                        }}
                        className="w-full py-4 bg-destructive text-destructive-foreground rounded-xl font-black text-sm tracking-widest uppercase hover:brightness-110 transition-all shadow-lg shadow-destructive/20 border border-destructive/30"
                    >
                        SYSTEM LOCKDOWN
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default IntrusionDetection;
