import { GlassCard } from "@/components/shared/GlassCard";
import { PageWrapper } from "@/components/shared/PageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Upload, Plus, UserPlus } from "lucide-react";

const users = [
  { name: "Admin Principal", email: "admin@provedor.com", role: "Admin", access: "Acesso total" },
  { name: "Lucas Técnico", email: "lucas@provedor.com", role: "Suporte", access: "Tickets, Rede" },
  { name: "Rafael Técnico", email: "rafael@provedor.com", role: "Suporte", access: "Tickets, Rede" },
  { name: "André Técnico", email: "andre@provedor.com", role: "Suporte", access: "Tickets, Rede" },
  { name: "Carla Financeiro", email: "carla@provedor.com", role: "Financeiro", access: "Financeiro, Clientes" },
  { name: "Mariana Atendimento", email: "mariana@provedor.com", role: "Operador", access: "Clientes, Tickets" },
];

const integrationCategories = [
  {
    label: "Rede",
    items: [
      { name: "Mikrotik", description: "Gerenciamento de roteadores e autenticação PPPoE", connected: true },
      { name: "Huawei OLT", description: "Gerenciamento de OLTs e provisionamento GPON", connected: true },
      { name: "ZTE", description: "OLTs ZTE e gerenciamento GPON", connected: false },
      { name: "Datacom", description: "Switches e OLTs Datacom", connected: false },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { name: "Asaas", description: "Gateway de pagamentos e emissão de boletos", connected: true },
      { name: "Gerencianet/Efí", description: "Pagamentos via PIX e boleto bancário", connected: false },
      { name: "Banco Inter", description: "Conta digital e cobranças", connected: false },
      { name: "Sicredi", description: "Integração bancária cooperativa", connected: false },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { name: "WhatsApp Business API", description: "Envio de mensagens automáticas via WhatsApp", connected: true },
      { name: "SMS (Zenvia)", description: "Envio de SMS em massa", connected: false },
      { name: "Email (SMTP)", description: "Envio de emails transacionais", connected: true },
    ],
  },
  {
    label: "Fiscal",
    items: [
      { name: "NFe.io", description: "Emissão automática de NF-e", connected: false },
      { name: "Focus NFe", description: "Plataforma de emissão fiscal", connected: false },
      { name: "Sefaz", description: "Comunicação direta com Sefaz", connected: false },
    ],
  },
  {
    label: "Regulatório",
    items: [
      { name: "ANATEL/SCM", description: "Consulta e conformidade regulatória", connected: false },
    ],
  },
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
    <PageWrapper>
      <div className="space-y-6">
        <Tabs defaultValue="empresa">
          <TabsList className="glass-card p-1">
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="integracoes">Integrações</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          </TabsList>

          <TabsContent value="empresa" className="mt-4">
            <GlassCard>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                    <Building2 style={{ width: 32, height: 32, color: '#2563EB' }} />
                  </div>
                  <div>
                    <Button variant="outline" size="sm" style={{ borderRadius: 10 }}><Upload className="h-4 w-4 mr-2" />Enviar logo</Button>
                    <p className="text-[10px] text-muted-foreground mt-1">PNG ou JPG, máximo 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nome da empresa</Label><Input defaultValue="NetFibra Telecom LTDA" style={{ borderRadius: 10 }} /></div>
                  <div className="space-y-2"><Label>CNPJ</Label><Input defaultValue="12.345.678/0001-90" style={{ borderRadius: 10 }} /></div>
                  <div className="space-y-2"><Label>Endereço</Label><Input defaultValue="Av. Paulista, 1000 - São Paulo, SP" style={{ borderRadius: 10 }} /></div>
                  <div className="space-y-2"><Label>Telefone</Label><Input defaultValue="(11) 3456-7890" style={{ borderRadius: 10 }} /></div>
                </div>
                <Button style={{ borderRadius: 10 }}>Salvar alterações</Button>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="usuarios" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button style={{ borderRadius: 10 }}><UserPlus className="h-4 w-4 mr-2" />Convidar usuário</Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-none">
                  <DialogHeader><DialogTitle>Convidar Usuário</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="email@provedor.com" style={{ borderRadius: 10 }} /></div>
                    <div className="space-y-2">
                      <Label>Cargo / Permissão</Label>
                      <Select>
                        <SelectTrigger style={{ borderRadius: 10 }}><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="operador">Operador</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="suporte">Suporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" style={{ borderRadius: 10 }}>Enviar convite</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <GlassCard>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none">
                      <TableHead className="glass-table-header">Nome</TableHead>
                      <TableHead className="glass-table-header">Email</TableHead>
                      <TableHead className="glass-table-header">Cargo</TableHead>
                      <TableHead className="glass-table-header">Acesso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.email} className="glass-table-row border-none">
                        <TableCell className="font-medium text-sm">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                        <TableCell>
                          <span className="px-2.5 py-0.5 text-xs font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#2563EB', borderRadius: 9999 }}>
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.access}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="integracoes" className="mt-4 space-y-6">
            {integrationCategories.map((cat) => (
              <div key={cat.label}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{cat.label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items.map((integ) => (
                    <GlassCard key={integ.name} hover>
                      <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: integ.connected ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.03)' }}>
                            <span className="text-xs font-bold" style={{ color: integ.connected ? '#10B981' : '#94A3B8' }}>
                              {integ.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold">{integ.name}</h4>
                            <p className="text-xs text-muted-foreground">{integ.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span
                            className="px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              background: integ.connected ? '#ECFDF5' : '#F1F5F9',
                              color: integ.connected ? '#059669' : '#64748B',
                              borderRadius: 9999,
                            }}
                          >
                            {integ.connected ? "Conectado" : "Desconectado"}
                          </span>
                          <Button variant="outline" size="sm" style={{ borderRadius: 10 }}>Configurar</Button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="notificacoes" className="mt-4">
            <GlassCard>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none">
                      <TableHead className="glass-table-header">Evento</TableHead>
                      <TableHead className="glass-table-header text-center">Email</TableHead>
                      <TableHead className="glass-table-header text-center">WhatsApp</TableHead>
                      <TableHead className="glass-table-header text-center">SMS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifEvents.map((n) => (
                      <TableRow key={n.event} className="glass-table-row border-none">
                        <TableCell className="font-medium text-sm">{n.event}</TableCell>
                        <TableCell className="text-center"><Switch checked={n.email} /></TableCell>
                        <TableCell className="text-center"><Switch checked={n.whatsapp} /></TableCell>
                        <TableCell className="text-center"><Switch checked={n.sms} /></TableCell>
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
