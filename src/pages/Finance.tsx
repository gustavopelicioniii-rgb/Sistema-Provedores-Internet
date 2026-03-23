import { useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageWrapper } from "@/components/shared/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPICard } from "@/components/shared/KPICard";
import { ChartCard } from "@/components/shared/ChartCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle, Send, Check, FileText,
  MoreHorizontal, MessageSquare, Mail, CreditCard, XCircle, RefreshCw, BarChart3
} from "lucide-react";
import { mockInvoices, mockBills, mockNFs, mockCashflow } from "@/data/mockData";
import { formatCurrency } from "@/lib/formatters";
import { CHART_COLORS } from "@/lib/constants";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, BarChart, Bar } from "recharts";

const summary = [
  { label: "Total a Receber", value: "R$ 68.420", icon: TrendingUp, bg: "rgba(16,185,129,0.1)", iconColor: "#10B981" },
  { label: "Total a Pagar", value: "R$ 123.490", icon: TrendingDown, bg: "rgba(239,68,68,0.1)", iconColor: "#EF4444" },
  { label: "Saldo", value: "R$ 85.600", icon: DollarSign, bg: "rgba(59,130,246,0.1)", iconColor: "#2563EB" },
  { label: "Inadimplência", value: "6,5%", icon: AlertCircle, bg: "rgba(245,158,11,0.1)", iconColor: "#F59E0B" },
];

const cashflowWithBalance = mockCashflow.map((d, i) => ({
  ...d,
  balance: mockCashflow.slice(0, i + 1).reduce((acc, c) => acc + c.inflow - c.outflow, 0),
  prevista: d.inflow * 1.05,
}));

const billingRuler = [
  { stage: "D-3", label: "Lembrete", channel: "WhatsApp", sent: 1847, converted: 892, rate: "48,3%" },
  { stage: "D0", label: "Vencimento", channel: "WhatsApp + Email", sent: 955, converted: 412, rate: "43,1%" },
  { stage: "D+3", label: "1ª Cobrança", channel: "WhatsApp", sent: 543, converted: 218, rate: "40,1%" },
  { stage: "D+7", label: "2ª Cobrança", channel: "WhatsApp + SMS", sent: 325, converted: 156, rate: "48,0%" },
  { stage: "D+15", label: "Aviso suspensão", channel: "WhatsApp + Email", sent: 169, converted: 98, rate: "58,0%" },
];

const agingData = [
  { range: "1-5 dias", count: 45, amount: 4520 },
  { range: "6-15 dias", count: 28, amount: 3360 },
  { range: "16-30 dias", count: 15, amount: 2250 },
  { range: "31-60 dias", count: 8, amount: 1440 },
  { range: "60+ dias", count: 4, amount: 960 },
];

const revenueForecast = [
  { month: "Jan", prevista: 240000, realizada: 232000 },
  { month: "Fev", prevista: 245000, realizada: 238000 },
  { month: "Mar", prevista: 250000, realizada: 243600 },
  { month: "Abr", prevista: 255000, realizada: 0 },
  { month: "Mai", prevista: 262000, realizada: 0 },
  { month: "Jun", prevista: 270000, realizada: 0 },
];

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-tooltip">
      <p className="text-xs font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: R$ {Number(p.value).toLocaleString("pt-BR")}
        </p>
      ))}
    </div>
  );
};

export default function Finance() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInvoices = mockInvoices.filter(inv => statusFilter === "all" || inv.status === statusFilter);

  return (
    <PageWrapper>
      <div className="space-y-5">
        {/* Page Header */}
        <PageHeader title="Financeiro" subtitle="Acompanhe faturas, contas a pagar e fluxo de caixa" />

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summary.map((s, i) => (
            <KPICard
              key={s.label}
              title={s.label}
              value={s.value}
              icon={s.icon}
              iconColor={s.iconColor}
              iconBg={s.bg}
              className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>

        <Tabs defaultValue="faturas">
          <TabsList className="glass-card p-1 flex-wrap h-auto">
            <TabsTrigger value="faturas" className="text-xs">💰 Faturas</TabsTrigger>
            <TabsTrigger value="contas" className="text-xs">📋 Contas a Pagar</TabsTrigger>
            <TabsTrigger value="cobranca" className="text-xs">🎯 Cobrança Inteligente</TabsTrigger>
            <TabsTrigger value="fluxo" className="text-xs">📊 Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="previsao" className="text-xs">📈 Previsão de Receita</TabsTrigger>
            <TabsTrigger value="nf" className="text-xs">🧾 Notas Fiscais</TabsTrigger>
          </TabsList>

          {/* FATURAS */}
          <TabsContent value="faturas" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {["all", "pago", "pendente", "atrasado", "cancelado"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`text-[10px] px-3 py-1 rounded-full font-medium transition-all ${statusFilter === s ? "bg-primary text-primary-foreground" : "glass-card"}`}>
                  {s === "all" ? "Todas" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <GlassCard>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none">
                      <TableHead className="glass-table-header">ID</TableHead>
                      <TableHead className="glass-table-header">Cliente</TableHead>
                      <TableHead className="glass-table-header">Valor</TableHead>
                      <TableHead className="glass-table-header">Vencimento</TableHead>
                      <TableHead className="glass-table-header">Status</TableHead>
                      <TableHead className="glass-table-header">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((inv) => (
                      <TableRow key={inv.id} className="glass-table-row border-none">
                        <TableCell className="font-medium text-xs">{inv.id}</TableCell>
                        <TableCell className="text-xs">{inv.client}</TableCell>
                        <TableCell className="text-xs">{formatCurrency(inv.amount)}</TableCell>
                        <TableCell className="text-xs">{inv.dueDate}</TableCell>
                        <TableCell><StatusBadge status={inv.status} /></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><MessageSquare className="h-3.5 w-3.5 mr-2" />Cobrar via WhatsApp</DropdownMenuItem>
                              <DropdownMenuItem><Mail className="h-3.5 w-3.5 mr-2" />Enviar por e-mail</DropdownMenuItem>
                              <DropdownMenuItem><Check className="h-3.5 w-3.5 mr-2" />Marcar como pago</DropdownMenuItem>
                              <DropdownMenuItem><CreditCard className="h-3.5 w-3.5 mr-2" />Gerar 2ª via / PIX</DropdownMenuItem>
                              <DropdownMenuItem><XCircle className="h-3.5 w-3.5 mr-2" />Cancelar</DropdownMenuItem>
                              <DropdownMenuItem><RefreshCw className="h-3.5 w-3.5 mr-2" />Renegociar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </GlassCard>
          </TabsContent>

          {/* CONTAS A PAGAR */}
          <TabsContent value="contas" className="mt-4">
            <GlassCard>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none">
                      <TableHead className="glass-table-header">Fornecedor</TableHead>
                      <TableHead className="glass-table-header">Valor</TableHead>
                      <TableHead className="glass-table-header">Vencimento</TableHead>
                      <TableHead className="glass-table-header">Categoria</TableHead>
                      <TableHead className="glass-table-header">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockBills.map((b) => (
                      <TableRow key={b.id} className="glass-table-row border-none">
                        <TableCell className="font-medium text-xs">{b.supplier}</TableCell>
                        <TableCell className="text-xs">{formatCurrency(b.amount)}</TableCell>
                        <TableCell className="text-xs">{b.dueDate}</TableCell>
                        <TableCell className="text-xs">{b.category}</TableCell>
                        <TableCell><StatusBadge status={b.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </GlassCard>
          </TabsContent>

          {/* COBRANÇA INTELIGENTE */}
          <TabsContent value="cobranca" className="mt-4 space-y-4">
            <ChartCard
              title="Régua de Cobrança Ativa"
              subtitle="Conversão por etapa do escalonamento automático"
              minHeight="min-h-fit"
            >
              {/* Visual ruler */}
              <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                {billingRuler.map((step, i) => (
                  <div key={step.stage} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        i === 0 ? "bg-blue-500" : i <= 2 ? "bg-amber-500" : "bg-red-500"
                      }`}>
                        {step.stage}
                      </div>
                      <span className="text-[10px] font-medium mt-1">{step.label}</span>
                      <span className="text-[9px] text-muted-foreground">{step.channel}</span>
                      <span className="text-[10px] font-bold mt-0.5" style={{ color: "#10B981" }}>{step.rate}</span>
                    </div>
                    {i < billingRuler.length - 1 && (
                      <div className="h-0.5 w-8 bg-border mx-1" />
                    )}
                  </div>
                ))}
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-none">
                    <TableHead className="glass-table-header">Etapa</TableHead>
                    <TableHead className="glass-table-header">Enviados</TableHead>
                    <TableHead className="glass-table-header">Convertidos</TableHead>
                    <TableHead className="glass-table-header">Taxa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingRuler.map((step) => (
                    <TableRow key={step.stage} className="glass-table-row border-none">
                      <TableCell className="text-xs font-medium">{step.stage} — {step.label}</TableCell>
                      <TableCell className="text-xs">{step.sent}</TableCell>
                      <TableCell className="text-xs">{step.converted}</TableCell>
                      <TableCell className="text-xs font-semibold" style={{ color: "#10B981" }}>{step.rate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ChartCard>

            {/* Aging */}
            <ChartCard
              title="Aging da Inadimplência"
              subtitle="Distribuição por faixa de atraso"
              minHeight="min-h-72"
            >
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="range" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="amount" fill="#EF4444" radius={[4,4,0,0]} name="Valor (R$)" fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          {/* FLUXO DE CAIXA */}
          <TabsContent value="fluxo" className="mt-4">
            <ChartCard
              title="Fluxo de Caixa — Últimos 6 meses"
              subtitle="Entradas, saídas, saldo acumulado e receita prevista"
              minHeight="min-h-96"
            >
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={cashflowWithBalance}>
                  <defs>
                    <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<GlassTooltip />} />
                  <Area type="monotone" dataKey="inflow" stroke="#10B981" fill="url(#inflowGrad)" strokeWidth={2} name="Entradas" />
                  <Area type="monotone" dataKey="outflow" stroke="#EF4444" fill="url(#outflowGrad)" strokeWidth={2} name="Saídas" />
                  <Line type="monotone" dataKey="balance" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} name="Saldo acumulado" />
                  <Line type="monotone" dataKey="prevista" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Receita prevista" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          {/* PREVISÃO DE RECEITA */}
          <TabsContent value="previsao" className="mt-4 space-y-4">
            <ChartCard
              title="Receita Prevista vs Realizada"
              subtitle="Projeção para os próximos 3 meses"
              minHeight="min-h-80"
            >
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={revenueForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="realizada" fill="#2563EB" radius={[4,4,0,0]} name="Realizada" />
                  <Line type="monotone" dataKey="prevista" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Prevista" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard
                title="Clientes Impactando Previsão"
                subtitle="Alto risco de churn afetando receita futura"
                minHeight="min-h-fit"
              >
                <div className="space-y-2">
                  {[
                    { name: "Ana Paula Santos", plan: "50 Mega", risk: 85, impact: "R$ 718/ano" },
                    { name: "Luciana Martins", plan: "50 Mega", risk: 78, impact: "R$ 718/ano" },
                    { name: "Roberto Almeida", plan: "300 Mega", risk: 72, impact: "R$ 2.398/ano" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/40 transition-colors">
                      <div>
                        <p className="text-xs font-medium">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.plan} • Score {c.risk}</p>
                      </div>
                      <span className="text-xs font-medium text-destructive">-{c.impact}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard
                title="Efetividade das Automações"
                minHeight="min-h-fit"
              >
                <div className="space-y-3">
                  {[
                    { name: "Lembrete D-3", recovery: "R$ 84.752", rate: "48,3%" },
                    { name: "Cobrança D+3", recovery: "R$ 21.812", rate: "40,1%" },
                    { name: "Aviso suspensão D+15", recovery: "R$ 9.820", rate: "58,0%" },
                  ].map((a, i) => (
                    <div key={i} className="p-2.5 rounded-lg" style={{ background: "rgba(0,0,0,0.02)" }}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium">{a.name}</span>
                        <span className="text-xs font-semibold" style={{ color: "#10B981" }}>{a.recovery}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Taxa de conversão</span>
                        <span>{a.rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* NOTAS FISCAIS */}
          <TabsContent value="nf" className="mt-4">
            <GlassCard>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none">
                      <TableHead className="glass-table-header">Número NF</TableHead>
                      <TableHead className="glass-table-header">Série</TableHead>
                      <TableHead className="glass-table-header">Cliente</TableHead>
                      <TableHead className="glass-table-header">Valor</TableHead>
                      <TableHead className="glass-table-header">Data Emissão</TableHead>
                      <TableHead className="glass-table-header">Status</TableHead>
                      <TableHead className="glass-table-header">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockNFs.map((nf) => (
                      <TableRow key={nf.id} className="glass-table-row border-none">
                        <TableCell className="font-medium text-xs">{nf.id}</TableCell>
                        <TableCell className="text-xs">{nf.serie}</TableCell>
                        <TableCell className="text-xs">{nf.client}</TableCell>
                        <TableCell className="text-xs">{formatCurrency(nf.amount)}</TableCell>
                        <TableCell className="text-xs">{nf.issueDate}</TableCell>
                        <TableCell><StatusBadge status={nf.status} /></TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="h-7 text-[10px]" style={{ borderRadius: 8 }}>
                            <FileText className="h-3 w-3 mr-1" /> Emitir NF-e
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
