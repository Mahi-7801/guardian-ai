import { Server, Database, Cpu, HardDrive, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemMetric {
  name: string;
  icon: React.ElementType;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  label: string;
}

const metrics: SystemMetric[] = [
  { name: 'API Gateway', icon: Server, status: 'healthy', value: 99.8, label: 'Uptime' },
  { name: 'Database', icon: Database, status: 'healthy', value: 45, label: 'Load' },
  { name: 'ML Engine', icon: Cpu, status: 'warning', value: 78, label: 'Usage' },
  { name: 'Storage', icon: HardDrive, status: 'healthy', value: 62, label: 'Used' },
];

export function SystemStatus() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">System Status</h2>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <MetricRow key={metric.name} metric={metric} />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall System Health</span>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ metric }: { metric: SystemMetric }) {
  const Icon = metric.icon;
  const statusColors = {
    healthy: 'text-success bg-success',
    warning: 'text-warning bg-warning',
    critical: 'text-destructive bg-destructive',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground">{metric.name}</span>
          <span className="text-xs font-mono text-muted-foreground">{metric.value}%</span>
        </div>
        
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              statusColors[metric.status]
            )}
            style={{ width: `${metric.value}%` }}
          />
        </div>
      </div>
      
      <div className={cn(
        "w-2 h-2 rounded-full",
        statusColors[metric.status]
      )} />
    </div>
  );
}
