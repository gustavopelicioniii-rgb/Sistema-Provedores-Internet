import { useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Users, UserCheck, UserX, UserMinus, UserPlus } from "lucide-react";
import { mockClients } from "@/data/mockData";

const stats = [
  { label: "Total", value: mockClients.length, icon: Users, filter: "all" },
  { label: "Ativos", value: mockClients.filter(c => c.status === "ativo").length, icon: UserCheck, filter: "ativo" },
  { label: "Suspensos", value: mockClients.filter(c => c.status === "suspenso").length, icon: UserMinus, filter: "suspenso" },
  { label: "Cancelados", value: mockClients.filter(c => c.status === "cancelado").length, icon: UserX, filter: "cancelado" },
  { label: "Novos (mês)", value: 42, icon: UserPlus, filter: "all" },
];

export default function Clients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockClients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.document.includes(search);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Mini KPI pills */}
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={() => setStatusFilter(s.filter)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === s.filter
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "glass-card hover:shadow-md"
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}: <span className="font-bold">{s.value}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou documento..." className="pl-9" style={{ borderRadius: 10 }} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button style={{ borderRadius: 10 }}><Plus className="h-4 w-4 mr-2" />Novo cliente</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg glass-card">
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nome completo</Label><Input placeholder="Nome" style={{ borderRadius: 10 }} /></div>
                  <div className="space-y-2"><Label>CPF/CNPJ</Label><Input placeholder="000.000.000-00" style={{ borderRadius: 10 }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="email@exemplo.com" style={{ borderRadius: 10 }} /></div>
                  <div className="space-y-2"><Label>Telefone</Label><Input placeholder="(11) 99999-9999" style={{ borderRadius: 10 }} /></div>
                </div>
                <div className="space-y-2"><Label>Endereço</Label><Input placeholder="Rua, número - Bairro" style={{ borderRadius: 10 }} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Plano</Label>
                    <Select><SelectTrigger style={{ borderRadius: 10 }}><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">Básico 50</SelectItem>
                        <SelectItem value="100">Padrão 100</SelectItem>
                        <SelectItem value="200">Turbo 200</SelectItem>
                        <SelectItem value="300">Ultra 300</SelectItem>
                        <SelectItem value="500">Empresarial 500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Data de instalação</Label><Input type="date" style={{ borderRadius: 10 }} /></div>
                </div>
                <Button className="w-full" style={{ borderRadius: 10 }}>Cadastrar cliente</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <GlassCard>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="glass-table-header border-none">
                  <TableHead className="glass-table-header">Nome</TableHead>
                  <TableHead className="glass-table-header">CPF/CNPJ</TableHead>
                  <TableHead className="glass-table-header">Plano</TableHead>
                  <TableHead className="glass-table-header">Status</TableHead>
                  <TableHead className="glass-table-header">Cidade</TableHead>
                  <TableHead className="glass-table-header">Último Pgto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="glass-table-row border-none">
                    <TableCell>
                      <Link to={`/clients/${c.id}`} className="font-medium text-primary hover:underline">{c.name}</Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{c.document}</TableCell>
                    <TableCell className="text-sm">{c.plan}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-sm">{c.city}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{c.lastPayment}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}
