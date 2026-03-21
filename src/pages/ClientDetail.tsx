import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { mockClients, mockInvoices, mockTickets } from "@/data/mockData";

export default function ClientDetail() {
  const { id } = useParams();
  const client = mockClients.find((c) => c.id === id) || mockClients[0];
  const clientInvoices = mockInvoices.filter((i) => i.client === client.name);
  const clientTickets = mockTickets.filter((t) => t.client === client.name);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/clients"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h2 className="text-xl font-bold">{client.name}</h2>
          <p className="text-sm text-muted-foreground">{client.document}</p>
        </div>
        <StatusBadge status={client.status} />
      </div>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="conexao">Conexão</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-4">
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Informações Pessoais</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{client.phone}</div>
                  <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{client.email}</div>
                  <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{client.address}</div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Detalhes do Serviço</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Plano:</span> {client.plan}</p>
                  <p><span className="text-muted-foreground">Cidade:</span> {client.city}</p>
                  <p><span className="text-muted-foreground">Data de instalação:</span> {client.installDate}</p>
                  <p><span className="text-muted-foreground">Último pagamento:</span> {client.lastPayment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Faturas</h3>
              {clientInvoices.length > 0 ? (
                <div className="space-y-2">
                  {clientInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div><p className="text-sm font-medium">{inv.id}</p><p className="text-xs text-muted-foreground">Vencimento: {inv.dueDate}</p></div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">R$ {inv.amount.toFixed(2)}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Nenhuma fatura encontrada</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conexao" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Dados de Conexão</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground">Plano</p><p className="font-medium">{client.plan}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground">Status</p><p className="font-medium text-success">Online</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground">Sinal (dBm)</p><p className="font-medium">-22.4</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground">Uptime</p><p className="font-medium">15d 8h</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Tickets</h3>
              {clientTickets.length > 0 ? (
                <div className="space-y-2">
                  {clientTickets.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div><p className="text-sm font-medium">{t.subject}</p><p className="text-xs text-muted-foreground">{t.id} • {t.date}</p></div>
                      <StatusBadge status={t.status} />
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Nenhum ticket encontrado</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
