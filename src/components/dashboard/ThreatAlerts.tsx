import { AlertTriangle, Shield, Zap, ExternalLink, Clock, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api-config";

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  source: string;
  time: string;
  confidence: number;
}

interface ThreatAlertsProps {
  onSelectAlert?: (alert: Alert) => void;
}

export function ThreatAlerts({ onSelectAlert }: ThreatAlertsProps) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreats = async () => {
    // Only set loading on initial fetch to avoid flickering on updates
    if (alerts.length === 0) setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/threats`);
      if (res.ok) {
        const data = await res.json();
        const mappedAlerts = data.map((t: any) => ({
          id: t.id,
          type: t.severity === 'critical' ? 'critical' : t.severity === 'high' ? 'warning' : 'info',
          title: t.type,
          description: `Detected suspicious behavior from ${t.source_ip}`,
          source: t.location,
          time: new Date(t.timestamp).toLocaleTimeString(),
          confidence: 85 + Math.floor(Math.random() * 14)
        }));
        setAlerts(mappedAlerts);
        // Turn off loading
        setLoading(false);
      } else {
        throw new Error("API Response not ok");
      }
    } catch (e) {
      console.error("Failed to fetch threats", e);
      // Fallback if alerts are empty
      if (alerts.length === 0) {
        setAlerts([
          { id: '1', type: 'critical', title: 'SQL Injection Attempt', description: 'Detected malicious payload in login form', source: '192.168.1.45', time: '10:42 AM', confidence: 98 },
          { id: '2', type: 'warning', title: 'Port Scan Detected', description: 'Multiple connection attempts on restricted ports', source: '10.0.0.8', time: '10:38 AM', confidence: 85 },
        ]);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(fetchThreats, 1000); // Live updates 1s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Active Threats</h2>
          {loading && <RefreshCcw className="w-3 h-3 animate-spin text-muted-foreground" />}
        </div>
        <button
          onClick={() => navigate("/intrusion-detection")}
          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          View All
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
        {alerts.length === 0 && !loading ? (
          <div className="text-center py-8 text-muted-foreground">No active threats detected.</div>
        ) : (
          alerts.map((alert, index) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              index={index}
              onClick={() => onSelectAlert?.(alert)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AlertItem({ alert, index, onClick }: { alert: Alert; index: number; onClick?: () => void }) {
  const typeStyles = {
    critical: {
      bg: 'alert-critical',
      icon: AlertTriangle,
      iconColor: 'text-destructive',
      badge: 'bg-destructive/20 text-destructive border-destructive/30',
    },
    warning: {
      bg: 'alert-warning',
      icon: Zap,
      iconColor: 'text-warning',
      badge: 'bg-warning/20 text-warning border-warning/30',
    },
    info: {
      bg: 'alert-success',
      icon: Shield,
      iconColor: 'text-success',
      badge: 'bg-success/20 text-success border-success/30',
    },
  };

  // Fallback to info if type is unknown
  const style = typeStyles[alert.type] || typeStyles.info;
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "p-4 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] animate-fade-in",
        style.bg
      )}
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          alert.type === 'critical' && "bg-destructive/20",
          alert.type === 'warning' && "bg-warning/20",
          alert.type === 'info' && "bg-success/20",
        )}>
          <Icon className={cn("w-4 h-4", style.iconColor)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground truncate">{alert.title}</h3>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full border font-mono",
              style.badge
            )}>
              {alert.confidence}%
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-1">{alert.description}</p>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {alert.source}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {alert.time}
            </span>
          </div>
        </div>
      </div>
    </div >
  );
}
