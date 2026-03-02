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
    const [signupDone, setSignupDone] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { data, error } = await insforge.auth.signInWithPassword({ email, password });
                if (error) {
                    if (error.message?.includes('Email not confirmed')) {
                        toast.error("Please confirm your email first. Check your inbox for the verification link.", { duration: 7000 });
                    } else {
                        throw error;
                    }
                    return;
                }
                localStorage.setItem('user_role', role);
                toast.success(`Access granted: ${role.toUpperCase()}`);
                setTimeout(() => navigate("/dashboard", { replace: true }), 100);
            } else {
                const { error } = await insforge.auth.signUp({ email, password });
                if (error) throw error;
                setSignupDone(true);
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    // ── Email confirmation waiting screen ─────────────────────────────────
    if (signupDone) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4 cyber-grid">
                <div className="w-full max-w-md glass-card p-8 space-y-6 border-glow text-center">
                    <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center mx-auto">
                        <Shield className="w-8 h-8 text-success" />
                    </div>
                    <h1 className="text-2xl font-bold">Credentials Registered</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        A verification link has been sent to <strong className="text-foreground">{email}</strong>.
                        Please open that email and click the confirm link before signing in.
                    </p>
                    <p className="text-xs text-muted-foreground font-mono bg-secondary/50 p-3 rounded-lg">
                        📌 Tip: If you don't see it, check your spam/junk folder.
                    </p>
                    <button
                        onClick={() => { setSignupDone(false); setIsLogin(true); }}
                        className="w-full py-3 rounded-lg font-bold bg-primary text-primary-foreground hover:glow-primary transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-4 h-4" /> Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

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
