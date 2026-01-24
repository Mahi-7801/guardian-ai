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
        <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[100]">
            {/* Chat Window */}
            <div className={cn(
                "absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] sm:h-[600px] max-h-[calc(100vh-120px)] flex flex-col glass-card border-glow transition-all duration-500 origin-bottom-right shadow-2xl",
                isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-20 pointer-events-none"
            )}>
                {/* Header */}
                <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                                Guardian AI
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            </h3>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Intel Co-Processor</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 sm:p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn(
                            "flex max-w-[90%] animate-fade-in",
                            msg.role === 'user' ? "ml-auto" : "mr-auto"
                        )}>
                            <div className={cn(
                                "p-2.5 sm:p-3 rounded-2xl text-[12px] sm:text-sm leading-relaxed break-words whitespace-pre-wrap overflow-hidden",
                                msg.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-[0_4px_12px_rgba(var(--primary),0.2)]"
                                    : "bg-secondary/80 border border-border rounded-tl-none text-foreground"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex mr-auto animate-fade-in">
                            <div className="bg-secondary/80 border border-border p-3 rounded-2xl rounded-tl-none flex gap-1">
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions - Scrollable on small screens */}
                <div className="p-2 sm:p-3 bg-secondary/30 flex gap-2 overflow-x-auto no-scrollbar border-t border-border snap-x">
                    <button onClick={() => setInput("Show latest threats")} className="snap-start whitespace-nowrap px-2.5 py-1.5 rounded-full bg-background border border-border text-[9px] sm:text-[10px] font-bold hover:bg-primary/10 hover:border-primary/50 transition-all flex items-center gap-1">
                        <Zap className="w-3 h-3 text-warning" /> THREAT SCAN
                    </button>
                    <button onClick={() => setInput("Explain current risk level")} className="snap-start whitespace-nowrap px-2.5 py-1.5 rounded-full bg-background border border-border text-[9px] sm:text-[10px] font-bold hover:bg-primary/10 hover:border-primary/50 transition-all flex items-center gap-1">
                        <Shield className="w-3 h-3 text-primary" /> RISK XAI
                    </button>
                    <button onClick={() => setInput("Analyze network anomalies")} className="snap-start whitespace-nowrap px-2.5 py-1.5 rounded-full bg-background border border-border text-[9px] sm:text-[10px] font-bold hover:bg-primary/10 hover:border-primary/50 transition-all flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-destructive" /> NET ANALYZE
                    </button>
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-card">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Interface with system..."
                            className="w-full bg-secondary border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10 sm:pr-12 transition-all transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:glow-primary transition-all"
                        >
                            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Floating Bubble */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative group",
                    isOpen ? "bg-card text-foreground rotate-90 scale-110" : "bg-primary text-primary-foreground hover:scale-110 glow-primary"
                )}
            >
                {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-destructive text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-bounce">
                        1
                    </span>
                )}
            </button>
        </div>
    );
}
