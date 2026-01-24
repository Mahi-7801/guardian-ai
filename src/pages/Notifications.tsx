import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Bell, AlertTriangle, Shield, CheckCircle2, Trash2, MoreVertical, Filter, Terminal, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notification {
    id: number;
    title: string;
    description: string;
    time: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    read: boolean;
}

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSignals = async () => {
        setLoading(true);
        try {
            // Fetch threats
            const resAlerts = await fetch('http://localhost:5000/api/alerts/history');
            const alerts = await resAlerts.json();

            // Map alerts to notifications
            const alertNotes: Notification[] = alerts.map((a: any) => ({
                id: a.id,
                title: a.type,
                description: `Source: ${a.source_ip} | Location: ${a.location}`,
                time: new Date(a.timestamp).toLocaleTimeString(),
                type: a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info',
                read: false
            }));

            setNotifications(alertNotes);
        } catch (e) {
            console.error("Failed to sync notification buffers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSignals();
        const interval = setInterval(fetchSignals, 10000);
        return () => clearInterval(interval);
    }, []);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success("All security alerts marked as reviewed.");
    };

    const clearAll = () => {
        setNotifications([]);
        toast.info("Notification log cleared.");
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">System Notifications</h1>
                                <p className="text-muted-foreground text-sm">Review critical security events and system status updates.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={markAllRead}
                                    className="px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-all"
                                >
                                    Mark all as Read
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                    title="Clear all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {loading && notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-sm text-muted-foreground animate-pulse font-mono tracking-widest uppercase">Syncing Neural Signal Logs...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="glass-card p-12 text-center space-y-4 border-dashed">
                                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto opacity-50">
                                    <Bell className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">No active alerts</h3>
                                    <p className="text-sm text-muted-foreground">The system is currently operating within baseline parameters.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <NotificationCard key={notification.id} notification={notification} />
                                ))}
                            </div>
                        )}

                        <div className="glass-card p-6 border-primary/20 bg-primary/5 mt-8">
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-primary" />
                                Alert Routing Preferences
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">Critical alerts are currently routed via Encrypted SMS and Secure Push.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 rounded bg-secondary/50 border border-border text-center">
                                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">SMS</p>
                                    <p className="text-xs font-bold text-success font-mono">ACTIVE</p>
                                </div>
                                <div className="p-3 rounded bg-secondary/50 border border-border text-center">
                                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">Email</p>
                                    <p className="text-xs font-bold text-success font-mono">ACTIVE</p>
                                </div>
                                <div className="p-3 rounded bg-secondary/50 border border-border text-center">
                                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">Slack</p>
                                    <p className="text-xs font-bold text-muted-foreground font-mono">DISABLED</p>
                                </div>
                                <div className="p-3 rounded bg-secondary/50 border border-border text-center">
                                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">UHF Link</p>
                                    <p className="text-xs font-bold text-warning font-mono">STANDBY</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

function NotificationCard({ notification }: { notification: Notification }) {
    const icons = {
        critical: <AlertTriangle className="w-5 h-5 text-destructive" />,
        warning: <AlertTriangle className="w-5 h-5 text-warning" />,
        info: <Bell className="w-5 h-5 text-primary" />,
        success: <CheckCircle2 className="w-5 h-5 text-success" />,
    };

    const bgColors = {
        critical: 'border-destructive/30 bg-destructive/5',
        warning: 'border-warning/30 bg-warning/5',
        info: 'border-primary/30 bg-primary/5',
        success: 'border-success/30 bg-success/5',
    };

    return (
        <div className={cn(
            "glass-card p-5 group flex items-start gap-4 transition-all hover:translate-x-1",
            bgColors[notification.type],
            !notification.read && "border-l-4 border-l-primary"
        )}>
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                notification.type === 'critical' && 'bg-destructive/10',
                notification.type === 'warning' && 'bg-warning/10',
                notification.type === 'info' && 'bg-primary/10',
                notification.type === 'success' && 'bg-success/10',
            )}>
                {icons[notification.type]}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        {notification.title}
                        {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </h3>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{notification.time}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{notification.description}</p>
                <div className="mt-3 flex items-center gap-2">
                    <button
                        onClick={() => toast.info(`Accessing forensic data for ${notification.id}...`)}
                        className="text-[10px] uppercase font-bold text-primary hover:underline"
                    >
                        View Forensic Details
                    </button>
                    <span className="text-muted-foreground text-[10px]">•</span>
                    <button
                        onClick={() => toast.warning(`Node from ${notification.time} added to ignore list.`)}
                        className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground"
                    >
                        Ignore Node
                    </button>
                </div>
            </div>
            <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
        </div>
    );
}

export default Notifications;
