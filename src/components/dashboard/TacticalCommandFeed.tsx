import { useState, useEffect } from "react";
import { Terminal, Shield, MessageSquare, Globe, Zap, AlertTriangle, Search, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";

interface TacticalLog {
    id: string;
    type: 'cyber' | 'social' | 'crosint' | 'propaganda' | 'system';
    title: string;
    message: string;
    timestamp: string;
    critical: boolean;
}

export const TacticalCommandFeed = () => {
    const [logs, setLogs] = useState<TacticalLog[]>([]);

    useEffect(() => {
        const fetchSystemLogs = async () => {
            try {
                // Fetch current simulation state from backend
                const response = await fetch(`${API_BASE_URL}/api/alerts/history`);
                const threats = await response.json();

                const formattedLogs: TacticalLog[] = threats.slice(0, 8).map((t: any) => ({
                    id: t.id.toString(),
                    type: t.type.toLowerCase().includes('ddos') || t.type.toLowerCase().includes('intrusion') ? 'cyber' : 'system',
                    title: t.type,
                    message: `Origin: ${t.source_ip} | Location: ${t.location}`,
                    timestamp: new Date(t.timestamp).toLocaleTimeString(),
                    critical: t.severity === 'critical'
                }));

                // Add some diversity from other modules
                const modulesLog: TacticalLog[] = [
                    {
                        id: 'social-1',
                        type: 'social',
                        title: 'Sentiment Shift',
                        message: 'Neutral narratives in Sector Delta trending negative.',
                        timestamp: new Date().toLocaleTimeString(),
                        critical: false
                    },
                    {
                        id: 'prop-1',
                        type: 'propaganda',
                        title: 'Narrative Injection',
                        message: 'Coordinated bot cluster BOT-Alpha active on Telegram.',
                        timestamp: new Date().toLocaleTimeString(),
                        critical: true
                    }
                ];

                setLogs([...modulesLog, ...formattedLogs].slice(0, 10));
            } catch (e) {
                console.error("Tactical feed sync failed");
            }
        };

        fetchSystemLogs();
        const interval = setInterval(fetchSystemLogs, 8000);
        return () => clearInterval(interval);
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'cyber': return <Shield className="w-3 h-3 text-destructive" />;
            case 'social': return <MessageSquare className="w-3 h-3 text-primary" />;
            case 'crosint': return <Globe className="w-3 h-3 text-success" />;
            case 'propaganda': return <Search className="w-3 h-3 text-warning" />;
            default: return <Zap className="w-3 h-3 text-muted-foreground" />;
        }
    };

    return (
        <div className="glass-card flex flex-col h-full min-h-[500px] border-primary/20 bg-background/40">
            <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Tactical Command Stream</h3>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-mono text-muted-foreground">LIVE_UPLINK</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-30 italic text-xs">
                        Awaiting neural telemetry...
                    </div>
                ) : (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            className={cn(
                                "p-3 rounded-lg border transition-all animate-in slide-in-from-right-2",
                                log.critical
                                    ? "bg-destructive/5 border-destructive/20 hover:border-destructive/40"
                                    : "bg-secondary/20 border-border/50 hover:border-primary/20"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    {getTypeIcon(log.type)}
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-tighter",
                                        log.critical ? "text-destructive" : "text-muted-foreground"
                                    )}>
                                        {log.type} // {log.title}
                                    </span>
                                </div>
                                <span className="text-[8px] font-mono opacity-50">{log.timestamp}</span>
                            </div>
                            <p className="text-xs font-mono leading-snug">
                                <span className="text-primary mr-1">&gt;</span>
                                {log.message}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="p-3 border-t border-border bg-secondary/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground font-bold">CORE_PROCESSOR_LOAD</span>
                    <span className="text-[10px] font-mono text-primary">42%</span>
                </div>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" style={{ width: '42%' }} />
                </div>
            </div>
        </div>
    );
};
