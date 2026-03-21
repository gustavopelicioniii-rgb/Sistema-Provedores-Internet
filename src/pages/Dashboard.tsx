import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, DollarSign, Headphones, TrendingDown, Zap, ArrowUpRight, ArrowDownRight, RefreshCw, Maximize2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  mockChartClients, mockChartRevenue, mockTickets, mockPlanDistribution,
  mockChurnActivations, mockHeatmapData, mockAutomations
} from "@/data/mockData";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line, ReferenceLine
} from "recharts";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

const kpis = [
  { label: "Clientes ativos", value: "4.872", icon: Users, change: "+3,2%", positive: true, bg: "rgba(59,130,246,0.1)", iconColor: "#2563EB" },
  { label: "MRR", value: "R$ 243.600", icon: DollarSign, change: "+5,1%", positive: true, bg: "rgba(16,185,129,0.1)", iconColor: "#10B981" },
  { label: "Tickets abertos", value: "37", icon: Headphones, change: "-12%", positive: true, bg: "rgba(245,158,11,0.1)", iconColor: "#F59E0B" },
  { label: "Churn mensal", value: "1,8%", icon: TrendingDown, change: "-0,3pp", positive: true, bg: "rgba(239,68,68,0.1)", iconColor: "#EF4444" },
  { label: "Automações hoje", value: "124", icon: Zap, change: "+18%", positive: true, bg: "rgba(139,92,246,0.1)", iconColor: "#8B5CF6" },
];

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-tooltip">
      <p className="text-xs font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000
            ? `R$ ${p.value.toLocaleString("pt-BR")}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

const totalClients = mockPlanDistribution.reduce((a, b) => a + b.value, 0);

// Heatmap
const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const maxHeat = Math.max(...mockHeatmapData.map((d) => d.value));

function getHeatColor(value: number) {
  const ratio = value / maxHeat;
  if (ratio < 0.15) return "rgba(59,130,246,0.05)";
  if (ratio < 0.35) return "rgba(59,130,246,0.15)";
  if (ratio < 0.55) return "rgba(59,130,246,0.3)";
  if (ratio < 0.75) return "rgba(59,130,246,0.5)";
  return "rgba(59,130,246,0.75)";
}

export default function Dashboard() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, i) => (
            <GlassCard key={kpi.label} hover className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                    <kpi.icon style={{ width: 18, height: 18, color: kpi.iconColor }} />
                  </div>
                </div>
                <p className="text-[28px] font-bold leading-tight">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  {kpi.positive
                    ? <ArrowUpRight className="h-3 w-3 text-success" />
                    : <ArrowDownRight className="h-3 w-3 text-destructive" />
                  }
                  <span className={kpi.positive ? "text-success" : "text-destructive"}>{kpi.change}</span>
                  <span className="ml-0.5">vs mês anterior</span>
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Context bar */}
        <GlassCard>
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Dados atualizados em 21/03/2026 às 14:32</span>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
          </div>
        </GlassCard>

        {/* Charts 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução de Clientes - Area */}
          <GlassCard hover>
            <div className="p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-base font-semibold">Evolução de Clientes</h3>
                  <p className="text-xs text-muted-foreground">Crescimento da base nos últimos 12 meses</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Maximize2 className="h-4 w-4" /></Button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={mockChartClients}>
                  <defs>
                    <linearGradient id="clientGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                  <Tooltip content={<GlassTooltip />} />
                  <Area type="monotone" dataKey="clients" stroke="#2563EB" strokeWidth={2.5} fill="url(#clientGradient)" name="Clientes" dot={{ r: 3, fill: "#2563EB" }} />
                  <Line type="monotone" dataKey="meta" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Meta" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Receita x Inadimplência */}
          <GlassCard hover>
            <div className="p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-base font-semibold">Receita x Inadimplência</h3>
                  <p className="text-xs text-muted-foreground">Comparativo dos últimos 6 meses</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Maximize2 className="h-4 w-4" /></Button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockChartRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="revenue" fill="#2563EB" radius={[6,6,0,0]} name="Receita" />
                  <Bar dataKey="overdue" fill="#EF4444" fillOpacity={0.7} radius={[6,6,0,0]} name="Inadimplência" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Donut - Distribuição de Planos */}
          <GlassCard hover>
            <div className="p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-base font-semibold">Distribuição de Planos</h3>
                  <p className="text-xs text-muted-foreground">Clientes por plano contratado</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Maximize2 className="h-4 w-4" /></Button>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0" style={{ width: 180, height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockPlanDistribution}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {mockPlanDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<GlassTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold">{totalClients.toLocaleString("pt-BR")}</span>
                    <span className="text-[10px] text-muted-foreground">total</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {mockPlanDistribution.map((plan) => (
                    <div key={plan.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: plan.color }} />
                      <span className="text-xs flex-1">{plan.name}</span>
                      <span className="text-xs font-medium">{((plan.value / totalClients) * 100).toFixed(0)}%</span>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(plan.value / totalClients) * 100}%`, background: plan.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Churn x Ativações */}
          <GlassCard hover>
            <div className="p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-base font-semibold">Churn x Novas Ativações</h3>
                  <p className="text-xs text-muted-foreground">Crescimento líquido da base</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8"><Maximize2 className="h-4 w-4" /></Button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={mockChurnActivations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="activations" fill="#10B981" radius={[4,4,0,0]} name="Ativações" />
                  <Bar dataKey="cancellations" fill="#EF4444" fillOpacity={0.7} radius={[4,4,0,0]} name="Cancelamentos" />
                  <Line type="monotone" dataKey="netGrowth" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: "#2563EB" }} name="Crescimento líquido" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Bottom row - 3 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Últimos Tickets */}
          <GlassCard hover className="lg:col-span-1">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Últimos Tickets</h3>
                <Link to="/tickets" className="text-xs text-primary hover:underline font-medium">Ver todos →</Link>
              </div>
              <div className="space-y-3">
                {mockTickets.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-accent/40 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-primary">{t.client.split(" ").map(w => w[0]).slice(0,2).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">{t.client}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <StatusBadge status={t.priority} />
                      <span className="text-[10px] text-muted-foreground">{t.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Automações Ativas */}
          <GlassCard hover className="lg:col-span-1">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Automações Ativas</h3>
                <Link to="/automations" className="text-xs text-primary hover:underline font-medium">Configurar →</Link>
              </div>
              <div className="space-y-2.5">
                {mockAutomations.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl">
                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${a.active ? "bg-success" : "bg-muted-foreground/30"}`} />
                    <span className="text-sm flex-1">{a.name}</span>
                    <span className="text-xs text-muted-foreground">{a.metric.split(" ")[0]} {a.metric.split(" ")[1]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.05)' }}>
                <p className="text-sm font-medium">124 automações executadas hoje</p>
                <p className="text-xs text-muted-foreground">+18% vs ontem</p>
              </div>
            </div>
          </GlassCard>

          {/* Heatmap Semanal */}
          <GlassCard hover className="lg:col-span-1">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold">Mapa de Calor</h3>
                  <p className="text-xs text-muted-foreground">Volume de tickets por dia/hora</p>
                </div>
              </div>
              <div className="space-y-1">
                {days.map((day) => (
                  <div key={day} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground w-7 flex-shrink-0">{day}</span>
                    <div className="flex gap-0.5 flex-1">
                      {Array.from({ length: 24 }, (_, h) => {
                        const d = mockHeatmapData.find((x) => x.day === day && x.hour === h);
                        return (
                          <div
                            key={h}
                            className="flex-1 h-4 rounded-sm cursor-pointer transition-opacity hover:opacity-80"
                            style={{ background: getHeatColor(d?.value || 0), minWidth: 6 }}
                            title={`${day}, ${h}h — ${d?.value || 0} tickets`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground pl-9">
                  <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
