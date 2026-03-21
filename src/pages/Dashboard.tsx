import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, DollarSign, Headphones, TrendingDown, Zap, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { mockChartClients, mockChartRevenue, mockTickets } from "@/data/mockData";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const kpis = [
  { label: "Clientes ativos", value: "4.872", icon: Users, change: "+3,2%", color: "text-primary" },
  { label: "MRR", value: "R$ 243.600", icon: DollarSign, change: "+5,1%", color: "text-success" },
  { label: "Tickets abertos", value: "37", icon: Headphones, change: "-12%", color: "text-warning" },
  { label: "Churn mensal", value: "1,8%", icon: TrendingDown, change: "-0,3pp", color: "text-destructive" },
  { label: "Automações hoje", value: "124", icon: Zap, change: "+18%", color: "text-primary" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {kpi.change} vs mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Evolução de Clientes</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockChartClients}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="clients" stroke="hsl(217 91% 53%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Receita x Inadimplência</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockChartRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Bar dataKey="revenue" fill="hsl(217 91% 53%)" radius={[4,4,0,0]} name="Receita" />
                <Bar dataKey="overdue" fill="hsl(0 72% 51%)" radius={[4,4,0,0]} name="Inadimplência" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Últimos Tickets</h3>
              <Link to="/tickets" className="text-sm text-primary hover:underline">Ver todos</Link>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTickets.slice(0, 5).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.client}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{t.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Automações Ativas</h3>
              <Link to="/automations" className="text-sm text-primary hover:underline">Configurar</Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Notificação de Queda</span>
                <span className="text-xs text-success font-medium">Ativa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cobrança Inteligente</span>
                <span className="text-xs text-success font-medium">Ativa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reativação de Churn</span>
                <span className="text-xs text-success font-medium">Ativa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Boas-vindas</span>
                <span className="text-xs text-success font-medium">Ativa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pesquisa NPS</span>
                <span className="text-xs text-muted-foreground font-medium">Inativa</span>
              </div>
            </div>
            <div className="mt-6 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium">124 automações executadas hoje</p>
              <p className="text-xs text-muted-foreground">+18% vs ontem</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
