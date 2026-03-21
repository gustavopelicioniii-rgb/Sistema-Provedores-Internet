import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search } from "lucide-react";
import { mockClients } from "@/data/mockData";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockClients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.document.includes(search);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou documento..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo cliente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome completo</Label><Input placeholder="Nome" /></div>
                <div className="space-y-2"><Label>CPF/CNPJ</Label><Input placeholder="000.000.000-00" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="email@exemplo.com" /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input placeholder="(11) 99999-9999" /></div>
              </div>
              <div className="space-y-2"><Label>Endereço</Label><Input placeholder="Rua, número - Bairro" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Plano</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">Básico 50</SelectItem>
                      <SelectItem value="100">Padrão 100</SelectItem>
                      <SelectItem value="200">Turbo 200</SelectItem>
                      <SelectItem value="300">Ultra 300</SelectItem>
                      <SelectItem value="500">Empresarial 500</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Data de instalação</Label><Input type="date" /></div>
              </div>
              <Button className="w-full">Cadastrar cliente</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Último Pgto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link to={`/clients/${c.id}`} className="font-medium text-primary hover:underline">{c.name}</Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.document}</TableCell>
                  <TableCell>{c.plan}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell className="text-muted-foreground">{c.lastPayment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
