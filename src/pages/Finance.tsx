import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Send, Check, FileText } from "lucide-react";
import { mockInvoices, mockBills, mockNFs, mockCashflow } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const summary = [
  { label: "Total a Receber", value: "R$ 68.420", icon: TrendingUp, color: "text-success" },
  { label: "Total a Pagar", value: "R$ 123.490", icon: TrendingDown, color: "text-destructive" },
  { label: "Saldo", value: "R$ 85.600", icon: DollarSign, color: "text-primary" },
  { label: "Inadimplência", value: "6,5%", icon: AlertCircle, color: "text-warning" },
];

export default function Finance() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="faturas">
        <TabsList>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="contas">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="nf">Notas Fiscais</TabsTrigger>
        </TabsList>

        <TabsContent value="faturas" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.id}</TableCell>
                      <TableCell>{inv.client}</TableCell>
                      <TableCell>R$ {inv.amount.toFixed(2)}</TableCell>
                      <TableCell>{inv.dueDate}</TableCell>
                      <TableCell><StatusBadge status={inv.status} /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" title="Enviar cobrança"><Send className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" title="Marcar pago"><Check className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" title="Gerar boleto"><FileText className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contas" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBills.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.supplier}</TableCell>
                      <TableCell>R$ {b.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{b.dueDate}</TableCell>
                      <TableCell>{b.category}</TableCell>
                      <TableCell><StatusBadge status={b.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fluxo" className="mt-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">Fluxo de Caixa — Últimos 6 meses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockCashflow}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                  <Area type="monotone" dataKey="inflow" stroke="hsl(142 71% 45%)" fill="hsl(142 71% 45% / 0.1)" name="Entradas" />
                  <Area type="monotone" dataKey="outflow" stroke="hsl(0 72% 51%)" fill="hsl(0 72% 51% / 0.1)" name="Saídas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nf" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número NF</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockNFs.map((nf) => (
                    <TableRow key={nf.id}>
                      <TableCell className="font-medium">{nf.id}</TableCell>
                      <TableCell>{nf.client}</TableCell>
                      <TableCell>R$ {nf.amount.toFixed(2)}</TableCell>
                      <TableCell>{nf.issueDate}</TableCell>
                      <TableCell><StatusBadge status={nf.status} /></TableCell>
                      <TableCell><Button variant="outline" size="sm">Emitir NF-e</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
