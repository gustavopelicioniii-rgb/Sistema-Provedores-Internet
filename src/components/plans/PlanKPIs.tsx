import { GlassCard } from "@/components/GlassCard";
import { TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight, Percent } from "lucide-react";

interface PlanKPIsProps {
  kpis: {
    adoption_rate: number;
    churn_rate: number;
    default_rate: number;
    estimated_margin: number;
    revenue: number;
    upgrades: number;
    downgrades: number;
    clients_count: number;
  } | null;
  isLoading: boolean;
}

export function PlanKPIs({ kpis, isLoading }: PlanKPIsProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GlassCard key={i}>
            <div className="p-4 animate-pulse">
              <div className="h-3 w-20 bg-muted rounded mb-2" />
              <div className="h-6 w-16 bg-muted rounded" />
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Adesao",
      value: `${kpis.adoption_rate}%`,
      icon: Users,
      bg: "rgba(59,130,246,0.1)",
      iconColor: "#2563EB",
      trend: kpis.adoption_rate > 30,
    },
    {
      label: "Churn",
      value: `${kpis.churn_rate}%`,
      icon: TrendingDown,
      bg: "rgba(239,68,68,0.1)",
      iconColor: "#EF4444",
      trend: kpis.churn_rate < 5,
    },
    {
      label: "Inadimplencia",
      value: `${kpis.default_rate}%`,
      icon: AlertTriangle,
      bg: "rgba(245,158,11,0.1)",
      iconColor: "#F59E0B",
      trend: kpis.default_rate < 3,
    },
    {
      label: "Margem",
      value: `${kpis.estimated_margin}%`,
      icon: Percent,
      bg: "rgba(16,185,129,0.1)",
      iconColor: "#10B981",
      trend: kpis.estimated_margin > 50,
    },
    {
      label: "Receita",
      value: `R$ ${kpis.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      bg: "rgba(16,185,129,0.1)",
      iconColor: "#10B981",
      trend: true,
    },
    {
      label: "Upgrades / Downgrades",
      value: `${kpis.upgrades} / ${kpis.downgrades}`,
      icon: TrendingUp,
      bg: "rgba(139,92,246,0.1)",
      iconColor: "#8B5CF6",
      trend: kpis.upgrades > kpis.downgrades,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card) => (
        <GlassCard key={card.label} hover>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-foreground">{card.label}</span>
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                <card.icon style={{ width: 14, height: 14, color: card.iconColor }} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-lg font-bold">{card.value}</p>
              {card.trend ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-success" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
              )}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
