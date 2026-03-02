import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

import IntrusionDetection from "./pages/IntrusionDetection";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import NetworkAnalysis from "./pages/NetworkAnalysis";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import Auth from "./pages/Auth";
import PublicReport from "./pages/PublicReport";
import Settings from "./pages/Settings";
import Intelligence from "./pages/Intelligence";
import Notifications from "./pages/Notifications";
import CrosintPortal from "./pages/CrosintPortal";
import Taxonomy from "./pages/Taxonomy";
import PropagandaMonitoring from "./pages/PropagandaMonitoring";
import SecurityFramework from "./pages/SecurityFramework";
import AdminPanel from "./pages/AdminPanel";
import Reports from "./pages/Reports";
import AIPipeline from "./pages/AIPipeline";
import DarkWebMonitor from "./pages/DarkWebMonitor";
import RiskCalculator from "./pages/RiskCalculator";
import ThreatTimeline from "./pages/ThreatTimeline";
import IncidentResponse from "./pages/IncidentResponse";
import BiometricScan from "./pages/BiometricScan";
import { LanguageProvider } from "./context/LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/insforge";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase fires this immediately with the current session, then on every
    // sign-in / sign-out event — no manual polling needed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse tracking-widest font-mono text-xs uppercase">Initializing Guardian AI...</p>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Landing />} />
              <Route path="/report" element={<PublicReport />} />
              <Route path="/auth" element={session ? <Navigate to="/dashboard" replace /> : <Auth />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={session ? <Index /> : <Navigate to="/auth" replace />}
              />
              <Route path="/intrusion-detection" element={session ? <IntrusionDetection /> : <Navigate to="/auth" />} />
              <Route path="/sentiment-analysis" element={session ? <SentimentAnalysis /> : <Navigate to="/auth" />} />
              <Route path="/network-analysis" element={session ? <NetworkAnalysis /> : <Navigate to="/auth" />} />
              <Route path="/predictive-analytics" element={session ? <PredictiveAnalytics /> : <Navigate to="/auth" />} />
              <Route path="/settings" element={session ? <Settings /> : <Navigate to="/auth" />} />
              <Route path="/intelligence" element={session ? <Intelligence /> : <Navigate to="/auth" />} />
              <Route path="/notifications" element={session ? <Notifications /> : <Navigate to="/auth" />} />
              <Route path="/crosint-portal" element={session ? <CrosintPortal /> : <Navigate to="/auth" />} />
              <Route path="/taxonomy" element={session ? <Taxonomy /> : <Navigate to="/auth" />} />
              <Route path="/propaganda-monitoring" element={session ? <PropagandaMonitoring /> : <Navigate to="/auth" />} />
              <Route path="/security-framework" element={session ? <SecurityFramework /> : <Navigate to="/auth" />} />
              <Route path="/admin" element={session ? <AdminPanel /> : <Navigate to="/auth" />} />
              <Route path="/reports" element={session ? <Reports /> : <Navigate to="/auth" />} />
              <Route path="/ai-pipeline" element={session ? <AIPipeline /> : <Navigate to="/auth" />} />
              <Route path="/darkweb-monitor" element={session ? <DarkWebMonitor /> : <Navigate to="/auth" />} />
              <Route path="/risk-calculator" element={session ? <RiskCalculator /> : <Navigate to="/auth" />} />
              <Route path="/threat-timeline" element={session ? <ThreatTimeline /> : <Navigate to="/auth" />} />
              <Route path="/incident-response" element={session ? <IncidentResponse /> : <Navigate to="/auth" />} />
              <Route path="/biometric" element={session ? <BiometricScan /> : <Navigate to="/auth" />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
};

export default App;
