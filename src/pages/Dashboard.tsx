import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Users, DollarSign, Headphones, TrendingDown, Zap, ArrowUpRight, ArrowDownRight,
  RefreshCw, Maximize2, AlertTriangle, Wifi, WifiOff, Sparkles, ChevronRight,
  Clock, Shield, CircleDollarSign, Activity, Brain, Target
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  mockChartClients, mockChartRevenue, mockTickets, mockPlanDistribution,
  mockChurnActivations, mockHeatmapData, mockAutomations
} from "@/data/mockData";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line
} from "recharts";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const kpis = [
  { label: "Clientes ativos", value: "4.872", icon: Users, change: "+3,2%", positive: true, bg: "rgba(59,130,246,0.1)", iconColor: "#2563EB", link: "/clients", trend: [40, 42, 44, 43, 45, 46, 47, 48, 47, 49, 48, 49] },
  { label: "MRR", value: "R$ 243.600", icon: DollarSign, change: "+5,1%", positive: true, bg: "rgba(16,185,129,0.1)", iconColor: "#10B981", link: "/finance", trend: [200, 210, 215, 222, 228, 232, 238, 240, 241, 243, 242, 244] },
  { label: "Tickets abertos", value: "37", icon: Headphones, change: "-12%", positive: true, bg: "rgba(245,158,11,0.1)", iconColor: "#F59E0B", link: "/tickets", trend: [45, 42, 40, 38, 41, 39, 37, 35, 38, 36, 37, 37] },
  { label: "Churn mensal", value: "1,8%", icon: TrendingDown, change: "-0,3pp", positive: true, bg: "rgba(239,68,68,0.1)", iconColor: "#EF4444", link: "/reports", trend: [2.5, 2.3, 2.1, 2.0, 1.9, 2.1, 1.8, 1.9, 1.7, 1.8, 1.9, 1.8] },
  { label: "Automações hoje", value: "124", icon: Zap, change: "+18%", positive: true, bg: "rgba(139,92,246,0.1)", iconColor: "#8B5CF6", link: "/automations", trend: [80, 85, 90, 95, 100, 105, 110, 108, 112, 118, 120, 124] },
  { label: "Inadimplência", value: "6,5%", icon: CircleDollarSign, change: "-0,8pp", positive: true, bg: "rgba(245,158,11,0.1)", iconColor: "#D97706", link: "/finance", trend: [8.5, 8.0, 7.8, 7.5, 7.2, 7.0, 6.8, 6.9, 6.7, 6.5, 6.6, 6.5] },
  { label: "Uptime", value: "99,7%", icon: Activity, change: "+0,1pp", positive: true, bg: "rgba(16,185,129,0.1)", iconColor: "#059669", link: "/network", trend: [99.2, 99.5, 99.3, 99.6, 99.4, 99.7, 99.5, 99.8, 99.6, 99.7, 99.8, 99.7] },
  { label: "Receita prevista", value: "R$ 258.400", icon: Target, change: "+6,1%", positive: true, bg: "rgba(59,130,246,0.1)", iconColor: "#2563EB", link: "/finance", trend: [220, 225, 230, 235, 240, 242, 245, 248, 250, 253, 255, 258] },
];

const urgentActions = [
  { icon: CircleDollarSign, label: "12 faturas vencidas há +5 dias", sublabel: "R$ 4.320 em risco", color: "#DC2626", link: "/finance" },
  { icon: Headphones, label: "3 tickets críticos sem resposta", sublabel: "Sem atendimento há +2h", color: "#DC2626", link: "/tickets" },
  { icon: WifiOff, label: "1 OLT em alerta — MA5608T", sublabel: "64 clientes impactados", color: "#F59E0B", link: "/network" },
  { icon: Users, label: "5 clientes premium em risco de churn", sublabel: "Score IA > 75", color: "#DC2626", link: "/clients" },
  { icon: Zap, label: "2 automações com falha de execução", sublabel: "Cobrança D+7 e NPS", color: "#F59E0B", link: "/automations" },
];

const networkHealth = {
  status: "Operacional",
  statusColor: "#10B981",
  uptime: "99,7%",
  clientsImpacted: 64,
  activeIncidents: 1,
  variation: "-12% vs ontem",
};

const aiRecommendations = [
  { icon: Brain, text: "Enviar oferta de upgrade para 23 clientes com uso >90% do plano", action: "Executar", priority: "alta" },
  { icon: Shield, text: "8 clientes sem consumo há 7+ dias — verificar conexão", action: "Ver lista", priority: "média" },
  { icon: Target, text: "Campanha de retenção para 5 clientes com score >70", action: "Disparar", priority: "alta" },
  { icon: CircleDollarSign, text: "Renegociar 4 faturas com atraso >15 dias antes da suspensão", action: "Abrir", priority: "média" },
];

const clientsAtRisk = [
  { name: "Ana Paula Santos", plan: "50 Mega", score: 85, reason: "Atraso + 3 tickets", id: "4" },
  { name: "Luciana Martins", plan: "50 Mega", score: 78, reason: "Suspensa + sem uso", id: "10" },
  { name: "Roberto Almeida", plan: "300 Mega", score: 72, reason: "Queda recorrente", id: "8" },
  { name: "Fernanda Lima", plan: "100 Mega", score: 92, reason: "Cancelada recentemente", id: "7" },
  { name: "João Pedro Costa", plan: "100 Mega", score: 65, reason: "Sinal degradado", id: "5" },
];

const criticalBilling = [
  { client: "Ana Paula Santos", amount: 59.90, days: 38, status: "Suspensão em 2 dias" },
  { client: "Luciana Martins", amount: 119.80, days: 72, status: "Suspensa" },
  { client: "Roberto Almeida", amount: 199.90, days: 5, status: "Enviar 2ª cobrança" },
  { client: "Fernanda Lima", amount: 99.90, days: 90, status: "Cancelada" },
];

const revenueForcast = [
  { month: "Abr", prevista: 252000, realizada: 0 },
  { month: "Mai", prevista: 258000, realizada: 0 },
  { month: "Jun", prevista: 265000, realizada: 0 },
];

const revenuePrevVsReal = [
  { month: "Out", prevista: 220000, realizada: 215000 },
  { month: "Nov", prevista: 228000, realizada: 222000 },
  { month: "Dez", prevista: 235000, realizada: 228000 },
  { month: "Jan", prevista: 240000, realizada: 232000 },
  { month: "Fev", prevista: 245000, realizada: 238000 },
  { month: "Mar", prevista: 250000, realizada: 243600 },
];

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-tooltip">
      <p className="text-xs font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value > 100
            ? `R$ ${p.value.toLocaleString("pt-BR")}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

const totalClients = mockPlanDistribution.reduce((a, b) => a + b.value, 0);
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

// Mini sparkline component
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
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

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<typeof kpis[0] | null>(null);
  const [period, setPeriod] = useState("30d");
  const [lastUpdate] = useState("21/03/2026 às 14:32");
  const navigate = useNavigate();

  const openKpiDrawer = (kpi: typeof kpis[0]) => {
    setSelectedKpi(kpi);
    setDrawerOpen(true);
  };

  return (
    <PageWrapper>
      <div className="space-y-5">
        {/* KPI Cards - 4 cols */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {kpis.slice(0, 8).map((kpi, i) => (
            <GlassCard key={kpi.label} hover className="stagger-item cursor-pointer" style={{ animationDelay: `${i * 50}ms` }} onClick={() => openKpiDrawer(kpi)}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-muted-foreground">{kpi.label}</span>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: kpi.bg }}>
                    <kpi.icon style={{ width: 16, height: 16, color: kpi.iconColor }} />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-bold leading-tight">{kpi.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-0.5">
                      {kpi.positive
                        ? <ArrowUpRight className="h-2.5 w-2.5 text-success" />
                        : <ArrowDownRight className="h-2.5 w-2.5 text-destructive" />
                      }
                      <span className={kpi.positive ? "text-success" : "text-destructive"}>{kpi.change}</span>
                    </p>
                  </div>
                  <MiniSparkline data={kpi.trend} color={kpi.iconColor} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Context bar + Period filter */}
        <GlassCard>
          <div className="px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Dados atualizados em {lastUpdate}</span>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="h-7 text-xs w-28 border-none" style={{ background: "rgba(0,0,0,0.03)", borderRadius: 8 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="12m">12 meses</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7">
                <RefreshCw className="h-3 w-3" /> Atualizar
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* URGENT ACTIONS */}
        <GlassCard>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h3 className="text-sm font-semibold">Ações Urgentes</h3>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#DC2626" }}>
                {urgentActions.length} pendências
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {urgentActions.map((a, i) => (
                <Link key={i} to={a.link} className="flex items-start gap-2.5 p-2.5 rounded-xl transition-colors hover:bg-accent/60">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}15` }}>
                    <a.icon style={{ width: 14, height: 14, color: a.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-tight">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.sublabel}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Network Health + AI Recommendations row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Network Health */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" style={{ color: networkHealth.statusColor }} />
                  <h3 className="text-sm font-semibold">Saúde da Rede Agora</h3>
                </div>
                <Link to="/network" className="text-xs text-primary hover:underline">Ver rede →</Link>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-2.5 rounded-xl text-center" style={{ background: "rgba(16,185,129,0.08)" }}>
                  <p className="text-lg font-bold" style={{ color: networkHealth.statusColor }}>{networkHealth.uptime}</p>
                  <p className="text-[10px] text-muted-foreground">Uptime</p>
                </div>
                <div className="p-2.5 rounded-xl text-center" style={{ background: "rgba(16,185,129,0.08)" }}>
                  <p className="text-lg font-bold" style={{ color: "#10B981" }}>{networkHealth.status}</p>
                  <p className="text-[10px] text-muted-foreground">Status</p>
                </div>
                <div className="p-2.5 rounded-xl text-center" style={{ background: "rgba(245,158,11,0.08)" }}>
                  <p className="text-lg font-bold" style={{ color: "#F59E0B" }}>{networkHealth.activeIncidents}</p>
                  <p className="text-[10px] text-muted-foreground">Incidentes</p>
                </div>
                <div className="p-2.5 rounded-xl text-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <p className="text-lg font-bold" style={{ color: "#EF4444" }}>{networkHealth.clientsImpacted}</p>
                  <p className="text-[10px] text-muted-foreground">Impactados</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* AI Recommendations */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: "#8B5CF6" }} />
                  <h3 className="text-sm font-semibold">Recomendações da IA</h3>
                </div>
                <Link to="/ai-attendance" className="text-xs text-primary hover:underline">Ver todas →</Link>
              </div>
              <div className="space-y-2">
                {aiRecommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-accent/40 transition-colors">
                    <r.icon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#8B5CF6" }} />
                    <p className="text-xs flex-1 leading-relaxed">{r.text}</p>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 flex-shrink-0">{r.action}</Button>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Clients at Risk + Critical Billing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Clients at Risk */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" style={{ color: "#EF4444" }} />
                  <h3 className="text-sm font-semibold">Clientes em Risco</h3>
                </div>
                <Link to="/clients" className="text-xs text-primary hover:underline">Ver todos →</Link>
              </div>
              <div className="space-y-2">
                {clientsAtRisk.map((c) => (
                  <Link key={c.id} to={`/clients/${c.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/40 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-destructive">{c.score}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.reason} • {c.plan}</p>
                    </div>
                    <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      c.score >= 80 ? "bg-destructive/10 text-destructive" : "bg-amber-100 text-amber-700"
                    }`}>
                      Score {c.score}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Critical Billing */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4" style={{ color: "#DC2626" }} />
                  <h3 className="text-sm font-semibold">Cobranças Críticas</h3>
                </div>
                <Link to="/finance" className="text-xs text-primary hover:underline">Ver todas →</Link>
              </div>
              <div className="space-y-2">
                {criticalBilling.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-accent/40 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{b.client}</p>
                      <p className="text-[10px] text-muted-foreground">{b.days} dias em atraso</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">R$ {b.amount.toFixed(2)}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#DC2626" }}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Charts 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Evolução de Clientes */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-sm font-semibold">Evolução de Clientes</h3>
                  <p className="text-[10px] text-muted-foreground">Últimos 12 meses</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Maximize2 className="h-3.5 w-3.5" /></Button>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockChartClients}>
                  <defs>
                    <linearGradient id="clientGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                  <Tooltip content={<GlassTooltip />} />
                  <Area type="monotone" dataKey="clients" stroke="#2563EB" strokeWidth={2} fill="url(#clientGradient)" name="Clientes" dot={{ r: 2, fill: "#2563EB" }} />
                  <Line type="monotone" dataKey="meta" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Meta" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Receita x Inadimplência */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-sm font-semibold">Receita x Inadimplência</h3>
                  <p className="text-[10px] text-muted-foreground">Últimos 6 meses</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Maximize2 className="h-3.5 w-3.5" /></Button>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mockChartRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="revenue" fill="#2563EB" radius={[6,6,0,0]} name="Receita" />
                  <Bar dataKey="overdue" fill="#EF4444" fillOpacity={0.7} radius={[6,6,0,0]} name="Inadimplência" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Donut - Distribuição de Planos */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-sm font-semibold">Distribuição de Planos</h3>
                  <p className="text-[10px] text-muted-foreground">Clientes por plano</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={mockPlanDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                        {mockPlanDistribution.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
                      </Pie>
                      <Tooltip content={<GlassTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold">{totalClients.toLocaleString("pt-BR")}</span>
                    <span className="text-[9px] text-muted-foreground">total</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {mockPlanDistribution.map((plan) => (
                    <div key={plan.name} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: plan.color }} />
                      <span className="text-[11px] flex-1">{plan.name}</span>
                      <span className="text-[11px] font-medium">{((plan.value / totalClients) * 100).toFixed(0)}%</span>
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(plan.value / totalClients) * 100}%`, background: plan.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Receita Prevista vs Realizada */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-sm font-semibold">Receita Prevista vs Realizada</h3>
                  <p className="text-[10px] text-muted-foreground">Últimos 6 meses</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={revenuePrevVsReal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="realizada" fill="#2563EB" radius={[4,4,0,0]} name="Realizada" />
                  <Line type="monotone" dataKey="prevista" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} name="Prevista" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Bottom row - Churn + Tickets + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Churn x Ativações */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-sm font-semibold">Churn x Ativações</h3>
                  <p className="text-[10px] text-muted-foreground">Crescimento líquido</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={mockChurnActivations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="activations" fill="#10B981" radius={[3,3,0,0]} name="Ativações" />
                  <Bar dataKey="cancellations" fill="#EF4444" fillOpacity={0.7} radius={[3,3,0,0]} name="Cancelamentos" />
                  <Line type="monotone" dataKey="netGrowth" stroke="#2563EB" strokeWidth={2} dot={{ r: 2, fill: "#2563EB" }} name="Crescimento" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Últimos Tickets */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Últimos Tickets</h3>
                <Link to="/tickets" className="text-[10px] text-primary hover:underline font-medium">Ver todos →</Link>
              </div>
              <div className="space-y-2">
                {mockTickets.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-accent/40 transition-colors">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-primary">{t.client.split(" ").map(w => w[0]).slice(0,2).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{t.subject}</p>
                      <p className="text-[10px] text-muted-foreground">{t.client}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      <StatusBadge status={t.priority} />
                      <span className="text-[9px] text-muted-foreground">{t.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Heatmap */}
          <GlassCard hover>
            <div className="p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold">Mapa de Calor</h3>
                <p className="text-[10px] text-muted-foreground">Volume de tickets por dia/hora</p>
              </div>
              <div className="space-y-1">
                {days.map((day) => (
                  <div key={day} className="flex items-center gap-1">
                    <span className="text-[9px] text-muted-foreground w-6 flex-shrink-0">{day}</span>
                    <div className="flex gap-px flex-1">
                      {Array.from({ length: 24 }, (_, h) => {
                        const d = mockHeatmapData.find((x) => x.day === day && x.hour === h);
                        return (
                          <div key={h} className="flex-1 h-3.5 rounded-sm cursor-pointer transition-opacity hover:opacity-80"
                            style={{ background: getHeatColor(d?.value || 0), minWidth: 4 }}
                            title={`${day}, ${h}h — ${d?.value || 0} tickets`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between mt-1 text-[8px] text-muted-foreground pl-7">
                  <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Automações + Incidentes row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Automações Ativas */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Automações Ativas</h3>
                <Link to="/automations" className="text-[10px] text-primary hover:underline font-medium">Configurar →</Link>
              </div>
              <div className="space-y-1.5">
                {mockAutomations.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center gap-2.5 p-1.5 rounded-lg">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${a.active ? "bg-success" : "bg-muted-foreground/30"}`} />
                    <span className="text-xs flex-1">{a.name}</span>
                    <span className="text-[10px] text-muted-foreground">{a.metric.split(" ")[0]} {a.metric.split(" ")[1]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2.5 rounded-xl" style={{ background: 'rgba(59,130,246,0.05)' }}>
                <p className="text-xs font-medium">124 automações executadas hoje</p>
                <p className="text-[10px] text-muted-foreground">+18% vs ontem</p>
              </div>
            </div>
          </GlassCard>

          {/* Incidentes de Rede */}
          <GlassCard hover>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <WifiOff className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-semibold">Incidentes de Rede</h3>
                </div>
                <Link to="/network" className="text-[10px] text-primary hover:underline font-medium">Ver rede →</Link>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">OLT Huawei MA5608T — Alerta</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "#D97706" }}>Em andamento</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">64 clientes impactados • Desde 21/03 às 10:15 • 4h12min</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" style={{ borderRadius: 8 }}>Notificar clientes</Button>
                    <Button variant="outline" size="sm" className="h-6 text-[10px]" style={{ borderRadius: 8 }}>Ver detalhes</Button>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(16,185,129,0.05)" }}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-xs">Switch S5720 — Resolvido há 2h</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* KPI Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="glass-card border-none w-full sm:max-w-md">
          {selectedKpi && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: selectedKpi.bg }}>
                    <selectedKpi.icon style={{ width: 16, height: 16, color: selectedKpi.iconColor }} />
                  </div>
                  {selectedKpi.label}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div>
                  <p className="text-3xl font-bold">{selectedKpi.value}</p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    {selectedKpi.positive ? <ArrowUpRight className="h-3.5 w-3.5 text-success" /> : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
                    <span className={selectedKpi.positive ? "text-success" : "text-destructive"}>{selectedKpi.change}</span>
                    vs período anterior
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">TENDÊNCIA (ÚLTIMOS 30 DIAS)</h4>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={selectedKpi.trend.map((v, i) => ({ day: i + 1, value: v }))}>
                      <defs>
                        <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={selectedKpi.iconColor} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={selectedKpi.iconColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke={selectedKpi.iconColor} fill="url(#kpiGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">COMPARAÇÃO</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }}>
                      <p className="text-[10px] text-muted-foreground">Este mês</p>
                      <p className="text-sm font-bold">{selectedKpi.value}</p>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }}>
                      <p className="text-[10px] text-muted-foreground">Mês anterior</p>
                      <p className="text-sm font-bold text-muted-foreground">—</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" style={{ borderRadius: 10 }} onClick={() => { setDrawerOpen(false); navigate(selectedKpi.link); }}>
                  Ver detalhes completos <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageWrapper>
  );
}
