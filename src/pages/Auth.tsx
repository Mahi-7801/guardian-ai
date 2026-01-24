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
                toast.success("Successfully logged in!");
                // Small delay to ensure App.tsx session state is synchronized
                setTimeout(() => navigate("/dashboard", { replace: true }), 100);
            } else {
                const { data, error } = await insforge.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("Signup successful! Please check your email.");
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="analyst@guardian-ai.com"
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
                            className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all",
                            loading
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:glow-primary"
                        )}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : isLogin ? (
                            <>
                                <LogIn className="w-5 h-5" /> Sign In
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" /> Sign Up
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
