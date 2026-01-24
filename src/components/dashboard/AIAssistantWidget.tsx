import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Shield, Zap, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { insforge, AI_MODEL } from "@/lib/insforge";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    type?: 'text' | 'alert' | 'action';
}

export function AIAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Systems initialized. I am Guardian AI, your security co-pilot. How can I assist with threat analysis today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Using openai/gpt-4o-mini as it is the standard stable model for InsForge deployments
            const modelToUse = "openai/gpt-4o-mini";

            const response = await insforge.ai.chat.completions.create({
                model: modelToUse,
                messages: [
                    {
                        role: 'system',
                        content: 'You are Guardian AI, a specialized cybersecurity and counter-terrorism analyst. Be professional, concise, and technical. You help monitor threats, analyze network patterns, and detect misinformation. You are currently operating in the Command Center.'
                    },
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                    { role: 'user', content: userMessage }
                ]
            });

            const content = response.choices[0]?.message?.content || "Neural uplink stable but no data received. Systems are on standby.";
            setMessages(prev => [...prev, { role: 'assistant', content }]);
        } catch (error: any) {
            console.error("AI Assistant error:", error);

            // Helpful error mapping
            let errorMessage = "Emergency Override: Uplink failed. I am having trouble connecting to the live intel feed.";
            if (error?.message?.includes('model')) {
                errorMessage = "Configuration Error: Security model 'gpt-4o-mini' is not initialized in this environment.";
            }

            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-10 lg:left-10 z-[100]">
            {/* Chat Window */}
            <div className={cn(
                "absolute bottom-16 sm:bottom-20 left-0 w-[calc(100vw-2rem)] sm:w-[350px] h-[450px] sm:h-[500px] max-h-[calc(100vh-120px)] flex flex-col glass-card border-glow transition-all duration-500 origin-bottom-left shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]",
                isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-10 pointer-events-none"
            )}>
                {/* Header */}
                <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between bg-primary/5 rounded-t-2xl shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                                Guardian AI
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Tactical Co-Pilot</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors group"
                    >
                        <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin bg-card/30 min-h-0">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn(
                            "flex max-w-[85%] animate-fade-in",
                            msg.role === 'user' ? "ml-auto" : "mr-auto"
                        )}>
                            <div className={cn(
                                "p-3.5 rounded-2xl text-[13px] sm:text-sm leading-relaxed shadow-sm",
                                msg.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-[0_4px_15px_rgba(var(--primary),0.3)]"
                                    : "bg-secondary/90 border border-border/50 rounded-tl-none text-foreground backdrop-blur-md"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex mr-auto animate-fade-in">
                            <div className="bg-secondary/90 border border-border/50 p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                <span className="text-xs text-muted-foreground font-mono animate-pulse">Syncing...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-3 bg-secondary/20 flex gap-2 overflow-x-auto scrollbar-hide border-y border-border/50 snap-x mask-fade-sides">
                    {[
                        { label: "THREAT SCAN", icon: Zap, prompt: "Show latest threats", variant: "text-warning" },
                        { label: "RISK XAI", icon: Shield, prompt: "Explain current risk level", variant: "text-primary" },
                        { label: "NET ANALYZE", icon: AlertCircle, prompt: "Analyze network anomalies", variant: "text-destructive" }
                    ].map((act) => (
                        <button
                            key={act.label}
                            onClick={() => { setInput(act.prompt); handleSendMessage(); }}
                            className="snap-start whitespace-nowrap px-3 py-1.5 rounded-full bg-background/50 border border-border text-[10px] font-bold hover:bg-primary/10 hover:border-primary/50 transition-all flex items-center gap-1.5 shrink-0"
                        >
                            <act.icon className={cn("w-3 h-3", act.variant)} /> {act.label}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-card/80 backdrop-blur-md rounded-b-2xl">
                    <div className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Execute command or query AI..."
                            className="w-full bg-secondary border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-12 transition-all placeholder:text-muted-foreground/50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:glow-primary transition-all active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[9px] text-center text-muted-foreground mt-2 uppercase tracking-[0.2em] opacity-50">Authorized Personnel Only</p>
                </form>
            </div>

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative group",
                    isOpen ? "bg-secondary text-foreground rotate-90 scale-110 border border-border" : "bg-primary text-primary-foreground hover:scale-110 glow-primary"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                {!isOpen && (
                    <>
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-bounce z-10">
                            1
                        </span>
                        <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20 group-hover:opacity-40" />
                    </>
                )}
            </button>
        </div>
    );
}
