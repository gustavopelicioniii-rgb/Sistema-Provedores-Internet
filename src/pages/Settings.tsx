import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Building2, Upload } from "lucide-react";

const users = [
  { name: "Admin Principal", email: "admin@provedor.com", role: "Admin", access: "Acesso total" },
  { name: "Lucas Técnico", email: "lucas@provedor.com", role: "Suporte", access: "Tickets, Rede" },
  { name: "Rafael Técnico", email: "rafael@provedor.com", role: "Suporte", access: "Tickets, Rede" },
  { name: "André Técnico", email: "andre@provedor.com", role: "Suporte", access: "Tickets, Rede" },
  { name: "Carla Financeiro", email: "carla@provedor.com", role: "Financeiro", access: "Financeiro, Clientes" },
  { name: "Mariana Atendimento", email: "mariana@provedor.com", role: "Operador", access: "Clientes, Tickets" },
];

const integrations = [
  { name: "Mikrotik", description: "Gerenciamento de roteadores e autenticação PPPoE", connected: true },
  { name: "Huawei OLT", description: "Gerenciamento de OLTs e provisionamento GPON", connected: true },
  { name: "Asaas", description: "Gateway de pagamentos e emissão de boletos", connected: true },
  { name: "Gerencianet", description: "Pagamentos via PIX e boleto bancário", connected: false },
  { name: "WhatsApp API", description: "Envio de mensagens automáticas via WhatsApp Business", connected: true },
  { name: "API NF-e", description: "Emissão automática de notas fiscais eletrônicas", connected: false },
  { name: "ANATEL/SCM", description: "Consulta e conformidade regulatória", connected: false },
];

const notifEvents = [
  { event: "Fatura gerada", email: true, whatsapp: true, sms: false },
  { event: "Pagamento confirmado", email: true, whatsapp: false, sms: false },
  { event: "Fatura em atraso", email: true, whatsapp: true, sms: true },
  { event: "Queda de rede", email: true, whatsapp: true, sms: true },
  { event: "Ticket criado", email: true, whatsapp: false, sms: false },
  { event: "Ticket resolvido", email: true, whatsapp: true, sms: false },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="empresa">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" />Enviar logo</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome da empresa</Label><Input defaultValue="NetFibra Telecom LTDA" /></div>
                <div className="space-y-2"><Label>CNPJ</Label><Input defaultValue="12.345.678/0001-90" /></div>
                <div className="space-y-2"><Label>Endereço</Label><Input defaultValue="Av. Paulista, 1000 - São Paulo, SP" /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input defaultValue="(11) 3456-7890" /></div>
              </div>
              <Button>Salvar alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.email}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.access}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integ) => (
              <Card key={integ.name}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{integ.name}</h4>
                    <p className="text-sm text-muted-foreground">{integ.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={integ.connected ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                      {integ.connected ? "Conectado" : "Desconectado"}
                    </Badge>
                    <Switch checked={integ.connected} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">WhatsApp</TableHead>
                    <TableHead className="text-center">SMS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifEvents.map((n) => (
                    <TableRow key={n.event}>
                      <TableCell className="font-medium">{n.event}</TableCell>
                      <TableCell className="text-center"><Switch checked={n.email} /></TableCell>
                      <TableCell className="text-center"><Switch checked={n.whatsapp} /></TableCell>
                      <TableCell className="text-center"><Switch checked={n.sms} /></TableCell>
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
