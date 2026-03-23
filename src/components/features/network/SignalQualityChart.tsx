import { GlassCard } from "@/components/shared/GlassCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

interface SignalData {
  id: string;
  name: string;
  signal_quality: number;
  avg_signal_rx: number;
  min_signal_rx: number;
  max_signal_rx: number;
  onu_count: number;
}

interface SignalQualityChartProps {
  data: SignalData[];
  isLoading: boolean;
}

const COLORS = ["#2563EB", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#14B8A6"];

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-tooltip">
      <p className="text-xs font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? `${p.value.toFixed(1)} dBm` : p.value}
        </p>
      ))}
    </div>
  );
};

export function SignalQualityChart({ data, isLoading }: SignalQualityChartProps) {
  if (isLoading) {
    return (
      <GlassCard>
        <div className="p-4">
          <div className="h-4 w-40 bg-muted rounded mb-4 animate-pulse" />
          <div className="h-[250px] bg-muted/30 rounded animate-pulse" />
        </div>
      </GlassCard>
    );
  }

  // Transform data for chart - each OLT as a data point
  const chartData = data.map((d) => ({
    name: d.name.replace(/OLT |Mikrotik |Switch /g, '').substring(0, 12),
    avg_signal: parseFloat(String(d.avg_signal_rx)) || 0,
    quality: d.signal_quality || 0,
    onus: parseInt(String(d.onu_count)) || 0,
  }));

  return (
    <GlassCard hover>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold">Qualidade de Sinal por OLT</h3>
            <p className="text-[10px] text-muted-foreground">Qualidade media do sinal optico</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false}
              domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<GlassTooltip />} />
            <ReferenceLine y={80} stroke="#94A3B8" strokeDasharray="5 5"
              label={{ value: "Meta 80%", position: "right", fontSize: 10, fill: "#94A3B8" }} />
            <Line type="monotone" dataKey="quality" stroke="#2563EB" strokeWidth={2.5}
              dot={{ r: 4, fill: "#2563EB" }} name="Qualidade (%)" />
          </LineChart>
        </ResponsiveContainer>

        {/* OLT Signal Quality Bars */}
        <div className="space-y-2 mt-4">
          {data.map((olt, i) => {
            const quality = olt.signal_quality || 0;
            const color = quality >= 90 ? "#10B981" : quality >= 70 ? "#F59E0B" : "#EF4444";
            return (
              <div key={olt.id} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-28 truncate">{olt.name.substring(0, 20)}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${quality}%`, background: color }} />
                </div>
                <span className="text-[10px] font-medium w-8 text-right" style={{ color }}>{quality}%</span>
                <span className="text-[9px] text-muted-foreground w-14 text-right">{olt.onu_count} ONUs</span>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
