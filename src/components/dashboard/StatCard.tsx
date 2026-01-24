import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  variant?: 'default' | 'critical' | 'warning' | 'success';
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  variant = 'default'
}: StatCardProps) {
  const variantStyles = {
    default: {
      iconBg: 'bg-primary/10 border-primary/30',
      iconColor: 'text-primary',
      glow: 'glow-primary'
    },
    critical: {
      iconBg: 'bg-destructive/10 border-destructive/30',
      iconColor: 'text-destructive',
      glow: 'glow-destructive'
    },
    warning: {
      iconBg: 'bg-warning/10 border-warning/30',
      iconColor: 'text-warning',
      glow: 'glow-warning'
    },
    success: {
      iconBg: 'bg-success/10 border-success/30',
      iconColor: 'text-success',
      glow: 'glow-success'
    },
  };

  const changeColors = {
    increase: 'text-destructive',
    decrease: 'text-success',
    neutral: 'text-muted-foreground',
  };

  const styles = variantStyles[variant];

  return (
    <div className="stat-card group hover:border-primary/30 transition-all duration-300 cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-foreground">{value}</span>
            {change && (
              <span className={cn("text-sm font-medium", changeColors[changeType])}>
                {change}
              </span>
            )}
          </div>
        </div>

        <div className={cn(
          "w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300",
          styles.iconBg,
          "group-hover:" + styles.glow
        )}>
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
