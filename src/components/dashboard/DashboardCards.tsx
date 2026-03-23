import { GlassCard } from "@/components/GlassCard";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KPICard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  positive?: boolean;
  bg: string;
  iconColor: string;
  link?: string;
  trend?: number[];
}

interface DashboardCardsProps {
  cards: KPICard[];
  onCardClick?: (card: KPICard) => void;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashboardCards({ cards, onCardClick }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <GlassCard
          key={card.label}
          hover
          className="stagger-item cursor-pointer"
          style={{ animationDelay: `${i * 50}ms` }}
          onClick={() => onCardClick?.(card)}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-muted-foreground">{card.label}</span>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                <card.icon style={{ width: 16, height: 16, color: card.iconColor }} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xl font-bold leading-tight">{card.value}</p>
                {card.change && (
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
                    {card.positive
                      ? <ArrowUpRight className="h-2.5 w-2.5 text-success" />
                      : <ArrowDownRight className="h-2.5 w-2.5 text-destructive" />
                    }
                    <span className={card.positive ? "text-success" : "text-destructive"}>{card.change}</span>
                  </p>
                )}
              </div>
              {card.trend && <MiniSparkline data={card.trend} color={card.iconColor} />}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
