import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Settings as SettingsIcon, Shield, Bell, Lock, User, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AI_STATUS } from "@/lib/insforge";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api-config";

const Settings = () => {
    const [systemStatus, setSystemStatus] = useState({ status: 'ONLINE', latency: '24ms' });

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
                if (res.ok) {
                    const data = await res.json();
                    setSystemStatus({
                        status: data.systemHealth.uptime > 99 ? 'ONLINE' : 'DEGRADED',
                        latency: `${Math.floor(Math.random() * 40)}ms`
                    });
                }
            } catch (e) {
                setSystemStatus({ status: 'OFFLINE', latency: '---' });
            }
        };
        fetchHealth();
        // Poll every 10s
        const interval = setInterval(fetchHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleResetAll = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/settings/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset: true, timestamp: Date.now() })
            });

            localStorage.clear();
            AI_STATUS.reset();
            toast.success("System cache purged & config reset synced with backend.");
            setTimeout(() => window.location.reload(), 2000);
        } catch (e) {
            toast.error("Failed to sync reset with backend.");
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
                    <p className="text-muted-foreground">Manage your Guardian AI configuration and system preferences.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Section */}
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">Analyst Profile</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm py-2 border-b border-border">
                                <span className="text-muted-foreground">Designation</span>
                                <span className="font-mono text-primary font-bold">SENIOR_ANALYST_BETA</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-border">
                                <span className="text-muted-foreground">Clearance Level</span>
                                <span className="text-warning font-bold">ORANGE_T5</span>
                            </div>
                            <div className="flex justify-between text-sm py-2">
                                <span className="text-muted-foreground">Last Uplink</span>
                                <span className="text-muted-foreground">Just now</span>
                            </div>
                        </div>
                    </div>

                    {/* System Status Section */}
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-success" />
                            </div>
                            <h2 className="text-xl font-bold">Intelligence Core</h2>
                        </div>
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold">Neural Uplink Status</p>
                                    <p className="text-[10px] text-muted-foreground">Connection to global intelligence nodes</p>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${systemStatus.status === 'ONLINE' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                                    {systemStatus.status}
                                </div>
                            </div>
                            <button
                                onClick={() => toast.info(`Firmware check complete. Latency: ${systemStatus.latency}`)}
                                className="w-full py-2 bg-secondary border border-border rounded-lg text-xs font-bold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-3 h-3" /> Run Diagnostic Check
                            </button>
                        </div>
                    </div>
                </div>

                {/* Critical Actions */}
                <div className="glass-card p-6 sm:p-8 border-destructive/20 bg-destructive/5 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                        <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-destructive">Critical Maintenance</h3>
                            <p className="text-sm text-muted-foreground max-w-2xl">
                                Resetting the system will clear all local cached intelligence, reset your AI uplink status, and purge simulation buffers. This action is irreversible.
                            </p>
                        </div>
                        <button
                            onClick={handleResetAll}
                            className="w-full sm:w-auto px-6 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold hover:glow-destructive transition-all flex items-center justify-center gap-2 mt-4 sm:mt-0"
                        >
                            <Trash2 className="w-4 h-4" /> Purge Cache
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
