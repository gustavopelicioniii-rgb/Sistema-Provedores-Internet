import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, LayoutList, Kanban } from "lucide-react";
import { mockTickets } from "@/data/mockData";

export default function Tickets() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockTickets.filter((t) => {
    const matchSearch = t.client.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const kanbanColumns = [
    { key: "aberto", label: "Aberto" },
    { key: "em andamento", label: "Em Andamento" },
    { key: "resolvido", label: "Resolvido" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar tickets..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aberto">Aberto</SelectItem>
              <SelectItem value="em andamento">Em andamento</SelectItem>
              <SelectItem value="resolvido">Resolvido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")}><LayoutList className="h-4 w-4" /></Button>
            <Button variant={view === "kanban" ? "secondary" : "ghost"} size="sm" onClick={() => setView("kanban")}><Kanban className="h-4 w-4" /></Button>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Novo ticket</Button>
        </div>
      </div>

      {view === "list" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.id}</TableCell>
                    <TableCell>{t.client}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell><StatusBadge status={t.priority} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{t.assignee}</TableCell>
                    <TableCell className="text-muted-foreground">{t.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanColumns.map((col) => (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {filtered.filter((t) => t.status === col.key).length}
                </span>
              </div>
              <div className="space-y-2">
                {filtered.filter((t) => t.status === col.key).map((t) => (
                  <Card key={t.id} className="cursor-grab active:cursor-grabbing">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                        <StatusBadge status={t.priority} />
                      </div>
                      <p className="text-sm font-medium">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">{t.client}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span>{t.assignee}</span>
                        <span>{t.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
