import { useState, useEffect } from "react";
import { Brain, Send, User, Clock, Loader2, Sparkles, ExternalLink, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface IntelItem {
    id: string;
    source: string;
    content: string;
    timestamp: string;
    severity: string;
    verified: boolean;
}

export const ThreatIntelFeed = () => {
    const navigate = useNavigate();
    const [feed, setFeed] = useState<IntelItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchFeed = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/intelligence/feed');
            if (res.ok) {
                const data = await res.json();
                setFeed(data);
            }
        } catch (e) {
            console.error("Feed fetch failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
        const interval = setInterval(fetchFeed, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.info("Manual intelligence submission is disabled in viewer mode.");
    };

    const generateIntelligence = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('http://localhost:5000/api/intelligence/generate');
            if (res.ok) {
                const data = await res.json();
                setTitle(data.title);
                setContent(data.content);
                toast.success("AI Intelligence briefing drafted via Neural Uplink.");
            } else throw new Error("Generation failed");
        } catch (error: any) {
            toast.error("Failed to generate briefing. Using local heuristics.");
            // Fallback
            setTitle("Emerging Threat: Quantum Decryption Signals");
            setContent("Intercepted traffic suggests state-level actors are testing post-quantum decryption algorithms against standard RSA-2048 keys. Recommend rotating keys to Curve25519.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Intelligence Feed</h2>
                </div>
                <button
                    onClick={() => navigate("/intelligence")}
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                    View All
                    <ExternalLink className="w-4 h-4" />
                </button>
                <button
                    onClick={generateIntelligence}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold hover:bg-primary/20 transition-all disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Generate Briefing
                </button>
            </div>

            <form onSubmit={handleSubmit} className="mb-6 space-y-3">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Intelligence Subject"
                    className="w-full bg-secondary/30 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Intelligence briefing content..."
                    className="w-full bg-secondary/30 border border-border rounded px-3 py-2 text-sm h-24 focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                    disabled={!title || !content}
                    className="w-full bg-primary text-primary-foreground py-2 rounded text-sm font-bold flex items-center justify-center gap-2 hover:glow-primary disabled:opacity-50 transition-all"
                >
                    <Send className="w-4 h-4" />
                    Publish Briefing
                </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {isLoading && feed.length === 0 ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    feed.map((item: IntelItem) => (
                        <div key={item.id} className="p-4 rounded-lg bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all group animate-fade-in">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${item.severity === 'Critical' ? 'bg-destructive/20 text-destructive' :
                                    item.severity === 'High' ? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                                    }`}>
                                    {item.severity}
                                </span>
                                {item.verified && <ShieldAlert className="w-3 h-3 text-success" />}
                            </div>
                            <p className="text-sm text-foreground line-clamp-3 mb-2 font-medium">{item.content}</p>
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" /> {item.source}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {new Date(item.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
