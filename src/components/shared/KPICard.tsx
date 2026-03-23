import { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-blue-500",
  iconBg = "bg-blue-500/10",
  className = "",
}: KPICardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-border/50 bg-card/50 p-6 backdrop-blur transition-all hover:border-border/80 hover:bg-card/80 hover:shadow-md ${className}`}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative space-y-4">
        {/* Header with icon and title */}
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className={`rounded-lg ${iconBg} p-2.5 transition-transform group-hover:scale-110`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>

        {/* Value and trend */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">{value}</span>
            {trend && (
              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  trend.direction === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend.direction === "up" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}
