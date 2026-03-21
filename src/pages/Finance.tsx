import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Send, Check, FileText } from "lucide-react";
import { mockInvoices, mockBills, mockNFs, mockCashflow } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";

const summary = [
  { label: "Total a Receber", value: "R$ 68.420", icon: TrendingUp, bg: "rgba(16,185,129,0.1)", iconColor: "#10B981" },
  { label: "Total a Pagar", value: "R$ 123.490", icon: TrendingDown, bg: "rgba(239,68,68,0.1)", iconColor: "#EF4444" },
  { label: "Saldo", value: "R$ 85.600", icon: DollarSign, bg: "rgba(59,130,246,0.1)", iconColor: "#2563EB" },
  { label: "Inadimplência", value: "6,5%", icon: AlertCircle, bg: "rgba(245,158,11,0.1)", iconColor: "#F59E0B" },
];

const cashflowWithBalance = mockCashflow.map((d, i) => ({
  ...d,
  balance: mockCashflow.slice(0, i + 1).reduce((acc, c) => acc + c.inflow - c.outflow, 0),
}));

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
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((s, i) => (
            <GlassCard key={s.label} hover className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                    <s.icon style={{ width: 18, height: 18, color: s.iconColor }} />
                  </div>
                </div>
                <p className="text-[28px] font-bold">{s.value}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <Tabs defaultValue="faturas">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="faturas">💰 Faturas</TabsTrigger>
            <TabsTrigger value="contas">📋 Contas a Pagar</TabsTrigger>
            <TabsTrigger value="fluxo">📊 Fluxo de Caixa</TabsTrigger>
            <TabsTrigger value="nf">🧾 Notas Fiscais</TabsTrigger>
          </TabsList>

          <TabsContent value="faturas" className="mt-4">
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
                    {mockInvoices.map((inv) => (
                      <TableRow key={inv.id} className="glass-table-row border-none">
                        <TableCell className="font-medium text-sm">{inv.id}</TableCell>
                        <TableCell className="text-sm">{inv.client}</TableCell>
                        <TableCell className="text-sm">R$ {inv.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-sm">{inv.dueDate}</TableCell>
                        <TableCell><StatusBadge status={inv.status} /></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Enviar cobrança"><Send className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Marcar pago"><Check className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Gerar boleto"><FileText className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </GlassCard>
          </TabsContent>

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
                        <TableCell className="font-medium text-sm">{b.supplier}</TableCell>
                        <TableCell className="text-sm">R$ {b.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-sm">{b.dueDate}</TableCell>
                        <TableCell className="text-sm">{b.category}</TableCell>
                        <TableCell><StatusBadge status={b.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="fluxo" className="mt-4">
            <GlassCard>
              <div className="p-5">
                <div>
                  <h3 className="text-base font-semibold">Fluxo de Caixa — Últimos 6 meses</h3>
                  <p className="text-xs text-muted-foreground">Entradas, saídas e saldo acumulado</p>
                </div>
                <ResponsiveContainer width="100%" height={300} className="mt-4">
                  <ComposedChart data={cashflowWithBalance}>
                    <defs>
                      <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<GlassTooltip />} />
                    <Area type="monotone" dataKey="inflow" stroke="#10B981" fill="url(#inflowGrad)" strokeWidth={2} name="Entradas" />
                    <Area type="monotone" dataKey="outflow" stroke="#EF4444" fill="url(#outflowGrad)" strokeWidth={2} name="Saídas" />
                    <Line type="monotone" dataKey="balance" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} name="Saldo acumulado" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </TabsContent>

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
                        <TableCell className="font-medium text-sm">{nf.id}</TableCell>
                        <TableCell className="text-sm">{nf.serie}</TableCell>
                        <TableCell className="text-sm">{nf.client}</TableCell>
                        <TableCell className="text-sm">R$ {nf.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-sm">{nf.issueDate}</TableCell>
                        <TableCell><StatusBadge status={nf.status} /></TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" style={{ borderRadius: 10 }}>
                            <FileText className="h-3.5 w-3.5 mr-1.5" /> Emitir NF-e
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
