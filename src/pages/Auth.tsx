import { useState } from "react";
import { insforge } from "@/lib/insforge";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<'admin' | 'user'>('user');
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { data, error } = await insforge.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Save role for UI context (Demo purpose)
                // In production, this would come from user_metadata or claims
                localStorage.setItem('user_role', role);

                toast.success(`Access granted: ${role.toUpperCase()}`);
                // Small delay to ensure App.tsx session state is synchronized
                setTimeout(() => navigate("/dashboard", { replace: true }), 100);
            } else {
                const { data, error } = await insforge.auth.signUp({
                    email,
                    password,
                    // Note: We're not saving metadata here as we don't know the schema support
                });
                if (error) throw error;
                toast.success("Signup successful! Please confirm via email.");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 cyber-grid">
            <div className="w-full max-w-md glass-card p-8 space-y-8 border-glow">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 glow-primary">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        {isLogin
                            ? "Access the Guardian AI Security Platform"
                            : "Register for your analyst credentials"}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg mb-6">
                        <button
                            type="button"
                            onClick={() => { setRole('admin'); setEmail('admin@guardian.com'); }}
                            className={cn(
                                "py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2",
                                role === 'admin' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-background/50"
                            )}
                        >
                            <Shield className="w-3 h-3" /> Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRole('user'); setEmail('analyst@guardian.com'); }}
                            className={cn(
                                "py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2",
                                role === 'user' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-background/50"
                            )}
                        >
                            <UserPlus className="w-3 h-3" /> Analyst
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
                            placeholder={role === 'admin' ? "admin@guardian.com" : "analyst@guardian.com"}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-sm",
                            loading
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:glow-primary"
                        )}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : isLogin ? (
                            <>
                                <LogIn className="w-5 h-5" /> Access {role === 'admin' ? 'Command' : 'Terminal'}
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" /> Register {role === 'admin' ? 'Officer' : 'Analyst'}
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        {isLogin
                            ? "Don't have an account? Register here"
                            : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
