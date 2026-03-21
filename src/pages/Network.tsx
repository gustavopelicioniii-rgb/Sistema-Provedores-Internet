import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Wifi, AlertTriangle, Server } from "lucide-react";
import { mockEquipments, mockConnectionIssues } from "@/data/mockData";

const networkNodes = Array.from({ length: 48 }, (_, i) => {
  if (i === 12 || i === 35) return "offline";
  if (i === 5 || i === 22 || i === 41) return "warning";
  return "online";
});

export default function NetworkPage() {
  const totalEquip = mockEquipments.length;
  const onlineCount = mockEquipments.filter((e) => e.status === "online").length;
  const alertCount = mockEquipments.filter((e) => e.status !== "online").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Server className="h-5 w-5 text-primary" /></div>
          <div><p className="text-sm text-muted-foreground">Total equipamentos</p><p className="text-2xl font-bold">{totalEquip}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><Wifi className="h-5 w-5 text-success" /></div>
          <div><p className="text-sm text-muted-foreground">Online</p><p className="text-2xl font-bold">{((onlineCount / totalEquip) * 100).toFixed(0)}%</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
          <div><p className="text-sm text-muted-foreground">Alertas ativos</p><p className="text-2xl font-bold">{alertCount}</p></div>
        </CardContent></Card>
      </div>

      {/* Network Map */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Mapa de Status da Rede</h3>
          <div className="grid grid-cols-12 gap-1.5">
            {networkNodes.map((status, i) => (
              <div key={i} className={`h-6 rounded-sm ${status === "online" ? "bg-success" : status === "warning" ? "bg-warning" : "bg-destructive"}`} title={`Nó ${i + 1}: ${status}`} />
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-success" /> Online</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Alerta</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-destructive" /> Offline</span>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-5 pb-0"><h3 className="font-semibold">Concentradores / OLTs</h3></div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Porta</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uptime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockEquipments.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell className="font-medium">{eq.name}</TableCell>
                  <TableCell className="font-mono text-sm">{eq.ip}</TableCell>
                  <TableCell>{eq.port}</TableCell>
                  <TableCell>{eq.clients}</TableCell>
                  <TableCell><StatusBadge status={eq.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{eq.uptime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Connection Issues */}
      <Card>
        <CardContent className="p-0">
          <div className="p-5 pb-0"><h3 className="font-semibold">Clientes com Problemas de Conexão</h3></div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Sinal (dBm)</TableHead>
                <TableHead>Última Queda</TableHead>
                <TableHead>Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockConnectionIssues.map((ci, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{ci.client}</TableCell>
                  <TableCell>{ci.equipment}</TableCell>
                  <TableCell className={ci.signal < -27 ? "text-destructive font-medium" : "text-warning font-medium"}>{ci.signal}</TableCell>
                  <TableCell>{ci.lastDrop}</TableCell>
                  <TableCell>{ci.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
