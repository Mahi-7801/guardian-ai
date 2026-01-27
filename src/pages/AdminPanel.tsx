import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Shield, Users, Lock, FileText, AlertTriangle, CheckCircle2, XCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFullLedger, setShowFullLedger] = useState(false);

    const fetchData = async () => {
        try {
            const [usersRes, logsRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/users'),
                fetch('http://localhost:5000/api/admin/logs')
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (logsRes.ok) setLogs(await logsRes.json());
        } catch (e) {
            console.error("Failed to fetch admin data", e);
        }
    };

    const handleLockdown = async () => {
        if (!confirm("WARNING: This will disrupt all active sessions. Confirm execution?")) return;

        try {
            const res = await fetch('http://localhost:5000/api/admin/lockdown', { method: 'POST' });
            if (res.ok) {
                toast.error("SYSTEM WIDE LOCKDOWN INITIATED", {
                    description: "All non-admin protocols suspended.",
                    duration: 5000
                });
                fetchData();
            }
        } catch (e) {
            toast.error("Command failed");
        }
    };

    // ... (useEffect and other handlers remain same)

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'admin') {
            toast.error("UNAUTHORIZED ACCESS DETECTED. Redirecting...");
            setTimeout(() => navigate('/dashboard'), 1000);
        } else {
            fetchData();
            const interval = setInterval(fetchData, 5000); // Live poll
            return () => clearInterval(interval);
        }
    }, [navigate]);

    const handleBan = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${id}/ban`, { method: 'POST' });
            if (res.ok) {
                toast.success("User access revoked via central command.");
                fetchData();
            } else {
                toast.error("Failed to ban user.");
            }
        } catch (e) {
            toast.error("Network error executing command.");
        }
    };

    const handleApprove = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${id}/approve`, { method: 'POST' });
            if (res.ok) {
                toast.success("User clearance level upgraded.");
                fetchData();
            } else {
                toast.error("Failed to approve user.");
            }
        } catch (e) {
            toast.error("Network error executing command.");
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Shield className="w-8 h-8 text-destructive" />
                            Command Center
                        </h1>
                        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs">
                            Top Secret // Level 5 Clearance Only
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                        <Lock className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-bold text-destructive">ADMIN MODE ACTIVE</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Management */}
                    <div className="glass-card p-6 border-primary/20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Personnel Management
                            </h2>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    className="bg-secondary/50 rounded-full pl-9 pr-4 py-1 text-xs border border-border w-32 focus:w-48 transition-all"
                                    placeholder="Search unclassified..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {users.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                                    <p className="text-xs font-mono animate-pulse">Establishing secure handshake with personnel database...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                                    <p className="text-xs font-mono text-warning">No personnel found matching classified query.</p>
                                </div>
                            ) : (
                                filteredUsers.map(user => (
                                    <div key={user.id} className="p-3 rounded-lg bg-secondary/20 border border-border flex items-center justify-between group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-success' : user.status === 'Banned' ? 'bg-destructive' : 'bg-warning animate-pulse'}`} />
                                            <div>
                                                <p className="text-sm font-bold">{user.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleApprove(user.id)} className="p-1.5 hover:bg-success/20 rounded text-success" title="Approve">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleBan(user.id)} className="p-1.5 hover:bg-destructive/20 rounded text-destructive" title="Revoke">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-right ml-4">
                                            <span className="block text-[10px] font-black uppercase tracking-wider">{user.role}</span>
                                            <span className="block text-[9px] text-muted-foreground">{user.lastActive}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Audit Logs */}
                    <div className="glass-card p-6 border-warning/20 relative">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <FileText className="w-5 h-5 text-warning" />
                            System Audit Logs
                        </h2>
                        <div className="space-y-2 font-mono text-xs max-h-[300px] overflow-hidden relative">
                            {logs.slice(0, 5).map(log => (
                                <div key={log.id} className="flex justify-between items-center p-2 border-b border-border/50 hover:bg-secondary/30 transition-colors">
                                    <span className="text-muted-foreground">{log.time}</span>
                                    <span className="font-bold">{log.action}</span>
                                    <span className={log.status === 'Blocked' ? 'text-destructive font-bold' : 'text-success'}>{log.status}</span>
                                </div>
                            ))}
                            <div className="pt-2 text-center">
                                <button
                                    onClick={() => setShowFullLedger(true)}
                                    className="text-[10px] text-primary hover:underline"
                                >
                                    View Full Encrypted Ledger
                                </button>
                            </div>
                        </div>

                        {/* Full Ledger Modal */}
                        {showFullLedger && (
                            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                                <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl flex flex-col max-h-[80vh]">
                                    <div className="p-4 border-b border-border flex justify-between items-center">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-primary" />
                                            ENCRYPTED AUDIT LEDGER (LEVEL 5)
                                        </h3>
                                        <button onClick={() => setShowFullLedger(false)} className="p-1 hover:bg-secondary rounded">
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-auto p-4 space-y-1 font-mono text-xs">
                                        {logs.map(log => (
                                            <div key={log.id} className="grid grid-cols-4 p-2 border-b border-border/50 hover:bg-secondary/20">
                                                <span className="text-muted-foreground">{log.time}</span>
                                                <span className="col-span-2 font-bold">{log.action}</span>
                                                <span className={`text-right ${log.status === 'Blocked' || log.status.includes('LOCKDOWN') ? 'text-destructive font-black' : 'text-success'}`}>{log.status}</span>
                                                <span className="col-span-4 text-[9px] text-muted-foreground uppercase opacity-50 mt-1">USER: {log.user} | ID: {log.id}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-border mt-auto bg-secondary/20">
                                        <p className="text-[10px] text-center text-muted-foreground">END OF RECORDS // GUARDIAN AI SECURE STORAGE</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                            <h3 className="text-sm font-bold text-destructive mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Global Override
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Initiate system-wide lockdown protocols. This action will terminate all non-admin sessions immediately.
                            </p>
                            <button
                                onClick={handleLockdown}
                                className="w-full py-2 bg-destructive text-destructive-foreground font-black uppercase tracking-widest text-xs rounded hover:bg-destructive/90 transition-all"
                            >
                                Execute Lockdown
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminPanel;
