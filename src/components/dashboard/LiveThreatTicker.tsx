import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api-config";
import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

const SEV_COLOR: Record<string, string> = {
    critical: "text-red-400 border-red-500/40 bg-red-500/10",
    high: "text-orange-400 border-orange-500/40 bg-orange-500/10",
    medium: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
    low: "text-blue-400 border-blue-500/40 bg-blue-500/10",
};

interface FeedItem { id: string; event: string; source: string; severity: string; category: string; }

export function LiveThreatTicker() {
    const { t } = useLang();
    const [items, setItems] = useState<FeedItem[]>([]);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/feed/live`);
                if (res.ok) setItems(await res.json());
            } catch { }
        };
        load();
        const iv = setInterval(load, 20000);
        return () => clearInterval(iv);
    }, []);

    if (!items.length) return null;

    return (
        <div
            className="w-full bg-background/80 border border-border/60 backdrop-blur-sm overflow-hidden flex items-center gap-3 h-9 rounded-lg mb-4"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="flex items-center gap-2 px-3 h-full bg-primary/10 border-r border-primary/20 flex-shrink-0">
                <Radio className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">LIVE</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
                <div
                    className={cn(
                        "flex items-center gap-8 whitespace-nowrap",
                        !paused && "animate-[ticker_40s_linear_infinite]"
                    )}
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                >
                    {[...items, ...items].map((item, i) => (
                        <span key={`${item.id}-${i}`} className={cn("inline-flex items-center gap-2 text-[11px] font-medium px-2 py-0.5 rounded border", SEV_COLOR[item.severity] || SEV_COLOR.low)}>
                            <span className="font-mono text-[9px] font-black uppercase">{t(item.severity) || item.severity}</span>
                            {item.event}
                            <span className="text-[9px] text-muted-foreground font-mono ml-1">[{item.source}]</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
