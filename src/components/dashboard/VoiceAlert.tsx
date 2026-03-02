import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { useLang } from "@/context/LanguageContext";

export function VoiceAlert() {
    const { lang, t } = useLang();
    const [enabled, setEnabled] = useState(() => localStorage.getItem("voice_alert") !== "false");
    const lastIdRef = useRef<string>("");

    // Map our codes to synthesis locales
    const VOICES: Record<string, string> = {
        en: "en-US",
        hi: "hi-IN",
        te: "te-IN",
        ar: "ar-SA"
    };

    useEffect(() => {
        if (!enabled || !window.speechSynthesis) return;
        const check = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/threats`);
                if (!res.ok) return;
                const data = await res.json();
                const critical = (data.threats || data || []).find((t: any) => t.severity === "critical" || t.level === "critical");

                if (critical && critical.id !== lastIdRef.current) {
                    lastIdRef.current = critical.id;

                    // Construct message based on language
                    let msg = "";
                    if (lang === "en") {
                        msg = `Critical threat detected. ${critical.type || "Unknown"} from ${critical.source || "unknown source"}. Confidence ${critical.confidence || 90} percent. Immediate action required.`;
                    } else if (lang === "hi") {
                        msg = `गंभीर खतरा पाया गया है. ${critical.source} से ${critical.type || "अज्ञात"}. तत्काल कार्यवाही आवश्यक है.`;
                    } else if (lang === "te") {
                        msg = `తీవ్రమైన ముప్పు కనుగొనబడింది. ${critical.source} నుండి ${critical.type || "తెలియదు"}. వెంటనే చర్య తీసుకోండి.`;
                    } else if (lang === "ar") {
                        msg = `تم اكتشاف تهديد حرج من ${critical.source}. مطلوب اتخاذ إجراء فوري.`;
                    }

                    const utter = new SpeechSynthesisUtterance(msg);
                    utter.lang = VOICES[lang] || "en-US";
                    utter.rate = 0.95;
                    utter.volume = 1;
                    window.speechSynthesis.speak(utter);
                }
            } catch { }
        };
        check();
        const iv = setInterval(check, 30000);
        return () => clearInterval(iv);
    }, [enabled, lang]);

    const toggle = () => {
        const next = !enabled;
        setEnabled(next);
        localStorage.setItem("voice_alert", String(next));
        if (next) {
            let msg = "Voice alerts enabled. Guardian AI is monitoring.";
            if (lang === "hi") msg = "वॉयस अलर्ट सक्षम हैं। गार्जियन एआई निगरानी कर रहा है।";
            if (lang === "te") msg = "వాయిస్ అలర్ట్‌లు ప్రారంభించబడ్డాయి. గార్డియన్ AI పర్యవేక్షిస్తోంది.";
            if (lang === "ar") msg = "تم تفعيل التنبيهات الصوتية. غارديان ذكاء اصطناعي يراقب الآن.";

            const u = new SpeechSynthesisUtterance(msg);
            u.lang = VOICES[lang] || "en-US";
            window.speechSynthesis.speak(u);
        } else {
            window.speechSynthesis.cancel();
        }
    };

    return (
        <button
            onClick={toggle}
            id="voice-alert-toggle"
            title={enabled ? "Voice alerts ON" : "Voice alerts OFF"}
            className={`fixed bottom-24 right-6 z-[110] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border active:scale-90 cursor-pointer pointer-events-auto ${enabled
                ? "bg-primary/20 border-primary/50 text-primary animate-pulse shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"
                }`}
        >
            {enabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}

            {/* Mobile visual indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping opacity-40 md:hidden" />
        </button>
    );
}
