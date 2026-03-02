import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "hi" | "te" | "ar";

export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
    en: {
        dashboard: "Dashboard", threats: "Threats", predictive: "Predictive",
        network: "Network", intelligence: "Intelligence", sentiment: "Sentiment",
        propaganda: "Propaganda", framework: "AI Framework", pipeline: "AI Pipeline",
        darkweb: "Dark Web", risk: "Risk Calculator", timeline: "Threat Timeline",
        incident: "Incident Response", biometric: "Biometric Scan",
        reports: "Reports", settings: "Settings", notifications: "Notifications",
        critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW",
        active: "ACTIVE", blocked: "BLOCKED", monitoring: "MONITORING",
        analyzing: "ANALYZING", loading: "Loading...", error: "Error",
    },
    hi: {
        dashboard: "डैशबोर्ड", threats: "खतरे", predictive: "पूर्वानुमान",
        network: "नेटवर्क", intelligence: "खुफिया", sentiment: "भावना",
        propaganda: "प्रचार", framework: "AI ढांचा", pipeline: "AI पाइपलाइन",
        darkweb: "डार्क वेब", risk: "जोखिम कैलकुलेटर", timeline: "खतरा टाइमलाइन",
        incident: "घटना प्रतिक्रिया", biometric: "बायोमेट्रिक स्कैन",
        reports: "रिपोर्ट", settings: "सेटिंग्स", notifications: "सूचनाएं",
        critical: "गंभीर", high: "उच्च", medium: "मध्यम", low: "निम्न",
        active: "सक्रिय", blocked: "अवरुद्ध", monitoring: "निगरानी",
        analyzing: "विश्लेषण हो रहा है", loading: "लोड हो रहा है...", error: "त्रुटि",
    },
    te: {
        dashboard: "డ్యాష్‌బోర్డ్", threats: "బెదిరింపులు", predictive: "అంచనా",
        network: "నెట్‌వర్క్", intelligence: "నిఘా", sentiment: "భావోద్వేగం",
        propaganda: "ప్రచారం", framework: "AI నిర్మాణం", pipeline: "AI పైప్‌లైన్",
        darkweb: "డార్క్ వెబ్", risk: "రిస్క్ కాల్కులేటర్", timeline: "బెదిరింపు టైమ్‌లైన్",
        incident: "సంఘటన ప్రతిస్పందన", biometric: "బయోమెట్రిక్ స్కాన్",
        reports: "నివేదికలు", settings: "సెట్టింగులు", notifications: "నోటిఫికేషన్లు",
        critical: "క్రిటికల్", high: "అధిక", medium: "మధ్యమ", low: "తక్కువ",
        active: "క్రియాశీలం", blocked: "బ్లాక్ చేయబడింది", monitoring: "పర్యవేక్షణ",
        analyzing: "విశ్లేషించబడుతోంది", loading: "లోడవుతోంది...", error: "దోషం",
    },
    ar: {
        dashboard: "لوحة التحكم", threats: "التهديدات", predictive: "تنبؤي",
        network: "الشبكة", intelligence: "الاستخبارات", sentiment: "المشاعر",
        propaganda: "الدعاية", framework: "إطار الذكاء الاصطناعي", pipeline: "خط أنابيب الذكاء الاصطناعي",
        darkweb: "الويب المظلم", risk: "حاسبة المخاطر", timeline: "الجدول الزمني للتهديدات",
        incident: "الاستجابة للحوادث", biometric: "مسح بيومتري",
        reports: "التقارير", settings: "الإعدادات", notifications: "الإشعارات",
        critical: "حرج", high: "عالي", medium: "متوسط", low: "منخفض",
        active: "نشط", blocked: "محجوب", monitoring: "مراقبة",
        analyzing: "تحليل...", loading: "جار التحميل...", error: "خطأ",
    },
};

const LANG_FLAGS: Record<Lang, string> = { en: "🇬🇧", hi: "🇮🇳", te: "🇮🇳", ar: "🇸🇦" };
const LANG_LABELS: Record<Lang, string> = { en: "English", hi: "हिंदी", te: "తెలుగు", ar: "عربي" };

interface LangContext { lang: Lang; t: (k: string) => string; setLang: (l: Lang) => void; flags: typeof LANG_FLAGS; labels: typeof LANG_LABELS; }
const Ctx = createContext<LangContext>({} as LangContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Lang>((localStorage.getItem("guardian_lang") as Lang) || "en");
    const t = (k: string) => TRANSLATIONS[lang][k] ?? TRANSLATIONS.en[k] ?? k;
    const handleSet = (l: Lang) => { setLang(l); localStorage.setItem("guardian_lang", l); };
    return <Ctx.Provider value={{ lang, t, setLang: handleSet, flags: LANG_FLAGS, labels: LANG_LABELS }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
