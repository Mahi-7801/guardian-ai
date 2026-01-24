import { Shield, Lock, Map, Zap, Terminal, Brain, ChevronRight, Globe, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Landing = () => {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
            {/* Decorative Blur Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Guardian AI</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
                        <a href="#technology" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Technology</a>
                        <Link to="/auth" className="text-sm font-medium px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:glow-primary transition-all">
                            Initialize Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center overflow-hidden">
                <div className="animate-fade-in space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                        <Zap className="w-3 h-3" /> Next-Gen Defense System
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                        Defense for the <br />
                        <span className="text-gradient-cyber">Digital Frontier</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Guardian AI is an advanced security operation platform designed to detect, analyze, and neutralize cyber threats using real-time intelligence and neural connection mapping.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <Link to="/auth" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/20">
                            Get Started <ChevronRight className="w-5 h-5" />
                        </Link>
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-secondary border border-border font-bold rounded-xl hover:bg-secondary/80 transition-all">
                            <Globe className="w-5 h-5" /> Global Intel Feed
                        </button>
                    </div>
                </div>

                {/* Floating Interactive Elements Simulation */}
                <div className="mt-20 relative px-4">
                    <div className="glass-card border-primary/20 p-2 rounded-2xl shadow-2xl animate-float">
                        <div className="bg-background/40 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border border-border/50">
                            <div className="absolute inset-0 cyber-grid opacity-30" />
                            <img
                                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200"
                                alt="Cyber Interface"
                                className="opacity-50 object-cover w-full h-full"
                            />
                            <Shield className="w-24 h-24 text-primary absolute animate-pulse-glow" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={Map}
                        title="Global Threat Map"
                        description="Real-time visualization of cyber-attacks worldwide using OpenStreetMap data integration."
                    />
                    <FeatureCard
                        icon={Terminal}
                        title="Intrusion Detection"
                        description="Advanced IDS monitoring packets and sniffing vulnerabilities with AI-driven explainability."
                    />
                    <FeatureCard
                        icon={Brain}
                        title="Neural Intelligence"
                        description="Map extremist connection networks and community clusters with graph theory algorithms."
                    />
                </div>
            </section>

            {/* Tech Stack Section */}
            <section id="technology" className="py-24 bg-secondary/30 border-y border-border/40">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-12">Built with Advanced Infrastructure</h2>
                    <div className="flex flex-wrap justify-center gap-12 text-muted-foreground opacity-70">
                        <div className="flex items-center gap-2">
                            <Github className="w-6 h-6" />
                            <span className="font-mono text-sm tracking-widest uppercase">Open Source</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-6 h-6" />
                            <span className="font-mono text-sm tracking-widest uppercase">InsForge SDK</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Lock className="w-6 h-6" />
                            <span className="font-mono text-sm tracking-widest uppercase">AES-256 Auth</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-border/40 text-center">
                <div className="flex items-center justify-center gap-3 mb-6 opacity-60">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-bold">Guardian AI</span>
                </div>
                <p className="text-sm text-muted-foreground">
                    © 2026 Guardian AI Security. All rights reserved.
                    <br />Developed for specialized cyber-defense and intelligence operations.
                </p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="glass-card p-8 group hover:border-primary/40 transition-all duration-500 border-glow">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
);

export default Landing;
