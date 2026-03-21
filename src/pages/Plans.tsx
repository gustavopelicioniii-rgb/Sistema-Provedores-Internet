import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus } from "lucide-react";
import { mockPlans } from "@/data/mockData";

export default function Plans() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Planos e Serviços</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo plano</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Plano</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>Nome do plano</Label><Input placeholder="Ex: Ultra 300" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Download (Mbps)</Label><Input type="number" placeholder="300" /></div>
                <div className="space-y-2"><Label>Upload (Mbps)</Label><Input type="number" placeholder="150" /></div>
              </div>
              <div className="space-y-2"><Label>Preço (R$)</Label><Input type="number" placeholder="199.90" /></div>
              <div className="space-y-2"><Label>Descrição</Label><Input placeholder="Descrição do plano" /></div>
              <Button className="w-full">Criar plano</Button>
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
                <TableHead>Download</TableHead>
                <TableHead>Upload</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPlans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.downloadSpeed} Mbps</TableCell>
                  <TableCell>{p.uploadSpeed} Mbps</TableCell>
                  <TableCell>R$ {p.price.toFixed(2)}</TableCell>
                  <TableCell>{p.clients.toLocaleString("pt-BR")}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
