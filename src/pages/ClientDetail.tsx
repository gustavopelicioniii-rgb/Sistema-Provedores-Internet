import { useParams, Link } from "react-router-dom";
import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, MapPin, Edit, PauseCircle, FileText, Wifi, Clock, Activity } from "lucide-react";
import { mockClients, mockInvoices, mockTickets } from "@/data/mockData";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const paymentHistory = [
  { month: "Abr", value: 99.9 }, { month: "Mai", value: 99.9 }, { month: "Jun", value: 99.9 },
  { month: "Jul", value: 0 }, { month: "Ago", value: 99.9 }, { month: "Set", value: 99.9 },
  { month: "Out", value: 99.9 }, { month: "Nov", value: 99.9 }, { month: "Dez", value: 99.9 },
  { month: "Jan", value: 99.9 }, { month: "Fev", value: 99.9 }, { month: "Mar", value: 99.9 },
];

const timeline = [
  { date: "15/03/2026", event: "Pagamento confirmado", type: "payment" },
  { date: "10/03/2026", event: "Ticket #TK-1042 aberto: Lentidão na conexão", type: "ticket" },
  { date: "01/03/2026", event: "Fatura INV-001 gerada", type: "invoice" },
  { date: "15/02/2026", event: "Pagamento confirmado", type: "payment" },
  { date: "01/01/2026", event: "Upgrade de plano: 50 Mega → 100 Mega", type: "plan" },
  { date: "10/01/2024", event: "Ativação do serviço", type: "activation" },
];

const timelineColors: Record<string, string> = {
  payment: "#10B981",
  ticket: "#F59E0B",
  invoice: "#2563EB",
  plan: "#8B5CF6",
  activation: "#10B981",
};

export default function ClientDetail() {
  const { id } = useParams();
  const client = mockClients.find((c) => c.id === id) || mockClients[0];
  const clientInvoices = mockInvoices.filter((i) => i.client === client.name);
  const clientTickets = mockTickets.filter((t) => t.client === client.name);

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild style={{ borderRadius: 10 }}>
              <Link to="/clients"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{client.name}</h2>
                <StatusBadge status={client.status} />
              </div>
              <p className="text-sm text-muted-foreground">{client.document} • {client.plan}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" style={{ borderRadius: 10 }}><Edit className="h-4 w-4 mr-1.5" /> Editar</Button>
            <Button variant="outline" size="sm" style={{ borderRadius: 10 }}><PauseCircle className="h-4 w-4 mr-1.5" /> Suspender</Button>
            <Button size="sm" style={{ borderRadius: 10 }}><FileText className="h-4 w-4 mr-1.5" /> Gerar fatura</Button>
          </div>
        </div>

        <Tabs defaultValue="dados">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="dados">Dados pessoais</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="conexao">Conexão</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-4">
            <GlassCard>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Informações Pessoais</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm p-2.5 rounded-xl hover:bg-accent/40">
                      <Phone className="h-4 w-4 text-muted-foreground" />{client.phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm p-2.5 rounded-xl hover:bg-accent/40">
                      <Mail className="h-4 w-4 text-muted-foreground" />{client.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm p-2.5 rounded-xl hover:bg-accent/40">
                      <MapPin className="h-4 w-4 text-muted-foreground" />{client.address}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Detalhes do Serviço</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Plano", value: client.plan },
                      { label: "Cidade", value: client.city },
                      { label: "Instalação", value: client.installDate },
                      { label: "Último pgto", value: client.lastPayment },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="financeiro" className="mt-4 space-y-4">
            <GlassCard>
              <div className="p-6">
                <h3 className="text-base font-semibold mb-4">Pagamentos (últimos 12 meses)</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={paymentHistory}>
                    <defs>
                      <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#10B981" fill="url(#payGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="p-6">
                <h3 className="text-base font-semibold mb-4">Faturas</h3>
                {clientInvoices.length > 0 ? (
                  <div className="space-y-2">
                    {clientInvoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl glass-table-row">
                        <div><p className="text-sm font-medium">{inv.id}</p><p className="text-xs text-muted-foreground">Vencimento: {inv.dueDate}</p></div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">R$ {inv.amount.toFixed(2)}</span>
                          <StatusBadge status={inv.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">Nenhuma fatura encontrada</p>}
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="conexao" className="mt-4">
            <GlassCard>
              <div className="p-6">
                <h3 className="text-base font-semibold mb-4">Dados de Conexão</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Plano", value: client.plan, icon: Wifi },
                    { label: "Status", value: "Online", icon: Activity, color: "#10B981" },
                    { label: "Sinal (dBm)", value: "-22.4", icon: Activity },
                    { label: "Uptime", value: "15d 8h", icon: Clock },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </div>
                      <p className="text-lg font-semibold" style={item.color ? { color: item.color } : {}}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="tickets" className="mt-4">
            <GlassCard>
              <div className="p-6">
                <h3 className="text-base font-semibold mb-4">Tickets</h3>
                {clientTickets.length > 0 ? (
                  <div className="space-y-2">
                    {clientTickets.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-xl glass-table-row">
                        <div>
                          <p className="text-sm font-medium">{t.subject}</p>
                          <p className="text-xs text-muted-foreground">{t.id} • {t.timeAgo}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={t.priority} />
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">Nenhum ticket encontrado</p>}
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            <GlassCard>
              <div className="p-6">
                <h3 className="text-base font-semibold mb-4">Histórico</h3>
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
                  {timeline.map((item, i) => (
                    <div key={i} className="relative pb-5 last:pb-0">
                      <div className="absolute -left-4 top-1 h-3 w-3 rounded-full border-2 border-white" style={{ background: timelineColors[item.type] }} />
                      <p className="text-sm font-medium">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
