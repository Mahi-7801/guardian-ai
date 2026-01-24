import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { ThreatAlerts } from "@/components/dashboard/ThreatAlerts";
import { ThreatMap } from "@/components/dashboard/ThreatMap";
import { NetworkGraph } from "@/components/dashboard/NetworkGraph";
import { SystemStatus } from "@/components/dashboard/SystemStatus";
import { ThreatIntelFeed } from "@/components/dashboard/ThreatIntelFeed";
import { TacticalCommandFeed } from "@/components/dashboard/TacticalCommandFeed";
import { AIAssistantWidget } from "@/components/dashboard/AIAssistantWidget";
import { Shield, AlertTriangle, Activity, Zap, Bug, Network, X, Info, Menu, CheckCircle, Brain } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [selectedThreat, setSelectedThreat] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleStatClick = (title: string) => {
    switch (title) {
      case "Active Threats":
        const threatSection = document.getElementById('threat-alerts-section');
        if (threatSection) threatSection.scrollIntoView({ behavior: 'smooth' });
        else navigate('/intrusion-detection');
        break;
      case "Blocked Attacks":
        toast.info("Showing attack history...");
        navigate('/reports');
        break;
      case "Network Anomalies":
        navigate('/network-analysis');
        break;
      case "System Health":
        const systemSection = document.getElementById('system-status-section');
        if (systemSection) systemSection.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  const handleResolve = () => {
    toast.success(`Threat ${selectedThreat?.id} marked as resolved.`);
    setSelectedThreat(null);
  };

  return (
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Responsive Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-[60] lg:relative lg:block transition-transform duration-300 h-full",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin overflow-x-hidden">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div onClick={() => handleStatClick("Active Threats")}>
              <StatCard
                title="Active Threats"
                value={23} // Connected to mock
                icon={AlertTriangle}
                variant="critical"
                change="+12%"
                changeType="increase"
              />
            </div>
            <div onClick={() => handleStatClick("Blocked Attacks")}>
              <StatCard
                title="Blocked Attacks"
                value={142}
                icon={Shield}
                variant="success"
                change="+5%"
                changeType="decrease"
              />
            </div>
            <div onClick={() => handleStatClick("Network Anomalies")}>
              <StatCard
                title="Network Anomalies"
                value={7}
                icon={Network}
                variant="warning"
                change="Stable"
              />
            </div>
            <div onClick={() => handleStatClick("System Health")}>
              <StatCard
                title="System Health"
                value="98.2%"
                icon={Activity}
                variant="default"
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Threat Map - Takes 2 columns */}
            <div className="lg:col-span-2">
              <ThreatMap />
            </div>

            {/* Network Graph */}
            <div>
              <NetworkGraph />
            </div>
          </div>

          {/* Lower Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tactical Command - 1 Column */}
            <div className="lg:col-span-1">
              <TacticalCommandFeed />
            </div>

            {/* Threat Alerts - Takes 2 columns */}
            <div className="lg:col-span-2" id="threat-alerts-section">
              <ThreatAlerts onSelectAlert={(alert) => setSelectedThreat(alert)} />
            </div>

            {/* Right column */}
            <div className="space-y-6" id="system-status-section">
              <SystemStatus />
              <ThreatIntelFeed />
            </div>
          </div>
        </main>
      </div>

      {/* Persistent AI Assistant */}
      <AIAssistantWidget />

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl glass-card p-8 border-glow relative overflow-hidden">
            {/* Security Grid Background */}
            <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />

            <button
              onClick={() => setSelectedThreat(null)}
              className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center glow-destructive">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedThreat.title}</h2>
                  <p className="text-sm text-muted-foreground">Threat ID: {selectedThreat.id} | Source: {selectedThreat.source}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Confidence</div>
                  <div className="text-3xl font-bold font-mono text-destructive">{selectedThreat.confidence}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" /> Technical Details
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedThreat.description}. Source IP {selectedThreat.source} initiated unusual traffic patterns matching known attack signatures.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" /> AI Analysis (XAI)
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Pattern matches generic SQLi vector.</li>
                    <li>High frequency requests detected.</li>
                    <li>Origin IP has poor reputation score.</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <div className="text-[10px] text-muted-foreground uppercase font-black mb-1">Risk Level</div>
                  <div className="text-sm font-bold text-destructive uppercase">{selectedThreat.type}</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <div className="text-[10px] text-muted-foreground uppercase font-black mb-1">Time Detected</div>
                  <div className="text-sm font-bold text-foreground">{selectedThreat.time}</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <div className="text-[10px] text-muted-foreground uppercase font-black mb-1">Status</div>
                  <div className="text-sm font-bold text-warning animate-pulse">ACTIVE</div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-border">
                <button
                  onClick={() => toast.success("Source IP Blocked")}
                  className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" /> BLOCK
                </button>
                <button
                  onClick={() => toast.info("Added to 24hr monitoring list")}
                  className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 border border-border"
                >
                  <Zap className="w-5 h-5" /> MONITOR
                </button>
                <button
                  onClick={handleResolve}
                  className="flex-1 py-3 bg-success text-success-foreground rounded-xl font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> RESOLVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
