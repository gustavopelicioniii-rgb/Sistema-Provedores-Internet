import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Wifi, AlertTriangle, Server, Activity } from "lucide-react";
import { mockEquipments, mockConnectionIssues, mockUptimeData } from "@/data/mockData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-tooltip">
      <p className="text-xs font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>{p.name}: {p.value}%</p>
      ))}
    </div>
  );
};

// Treemap-like grid
const equipmentBlocks = mockEquipments.map((eq) => ({
  ...eq,
  size: Math.max(1, Math.ceil(eq.clients / 80)),
}));

export default function NetworkPage() {
  const totalEquip = mockEquipments.length;
  const onlineCount = mockEquipments.filter((e) => e.status === "online").length;
  const alertCount = mockEquipments.filter((e) => e.status !== "online").length;
  const onlinePercent = ((onlineCount / totalEquip) * 100).toFixed(0);

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total equipamentos", value: totalEquip, icon: Server, bg: "rgba(59,130,246,0.1)", color: "#2563EB" },
            { label: "Online", value: `${onlinePercent}%`, icon: Wifi, bg: "rgba(16,185,129,0.1)", color: "#10B981", pulse: Number(onlinePercent) > 90 },
            { label: "Alertas ativos", value: alertCount, icon: AlertTriangle, bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
          ].map((s, i) => (
            <GlassCard key={s.label} hover className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon style={{ width: 20, height: 20, color: s.color }} className={s.pulse ? "pulse-badge" : ""} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <p className="text-[28px] font-bold">{s.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Treemap-style Network Map */}
        <GlassCard hover>
          <div className="p-5">
            <h3 className="text-base font-semibold mb-1">Mapa de Status da Rede</h3>
            <p className="text-xs text-muted-foreground mb-4">Tamanho proporcional a clientes conectados</p>
            <div className="flex flex-wrap gap-2">
              {equipmentBlocks.map((eq) => {
                const bgColor = eq.status === "online" ? "#10B981" : eq.status === "warning" ? "#F59E0B" : "#EF4444";
                return (
                  <div
                    key={eq.id}
                    className="rounded-xl p-3 text-white cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
                    style={{
                      background: bgColor,
                      minWidth: `${80 + eq.size * 40}px`,
                      flex: `${eq.size} 1 0%`,
                      opacity: eq.status === "offline" ? 0.7 : 1,
                    }}
                    title={`${eq.name}\nIP: ${eq.ip}\nClientes: ${eq.clients}\nUptime: ${eq.uptime}`}
                  >
                    <p className="text-xs font-semibold truncate">{eq.name.split(" ").slice(0, 2).join(" ")}</p>
                    <p className="text-[10px] opacity-80">{eq.clients} clientes</p>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#10B981" }} /> Online</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#F59E0B" }} /> Alerta</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#EF4444" }} /> Offline</span>
            </div>
          </div>
        </GlassCard>

        {/* Uptime Chart */}
        <GlassCard hover>
          <div className="p-5">
            <h3 className="text-base font-semibold mb-1">Uptime da Rede</h3>
            <p className="text-xs text-muted-foreground mb-3">Últimas 24 horas — Meta: 99,5%</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockUptimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="hour" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} domain={[97, 100.5]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<GlassTooltip />} />
                <ReferenceLine y={99.5} stroke="#94A3B8" strokeDasharray="5 5" label={{ value: "Meta 99,5%", position: "right", fontSize: 10, fill: "#94A3B8" }} />
                <Line type="monotone" dataKey="uptime" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: "#2563EB" }} name="Uptime" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Equipment Table */}
        <GlassCard>
          <div className="p-5 pb-0"><h3 className="text-base font-semibold">Concentradores / OLTs</h3></div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead className="glass-table-header">Nome</TableHead>
                  <TableHead className="glass-table-header">IP</TableHead>
                  <TableHead className="glass-table-header">Porta</TableHead>
                  <TableHead className="glass-table-header">Clientes</TableHead>
                  <TableHead className="glass-table-header">Status</TableHead>
                  <TableHead className="glass-table-header">Uptime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEquipments.map((eq) => (
                  <TableRow key={eq.id} className="glass-table-row border-none">
                    <TableCell className="font-medium text-sm">{eq.name}</TableCell>
                    <TableCell className="font-mono text-xs">{eq.ip}</TableCell>
                    <TableCell className="text-sm">{eq.port}</TableCell>
                    <TableCell className="text-sm">{eq.clients}</TableCell>
                    <TableCell><StatusBadge status={eq.status} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{eq.uptime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </GlassCard>

        {/* Connection Issues - Critical Signal */}
        <GlassCard>
          <div className="p-5 pb-0"><h3 className="text-base font-semibold">Clientes com Sinal Crítico</h3></div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead className="glass-table-header">Cliente</TableHead>
                  <TableHead className="glass-table-header">Equipamento</TableHead>
                  <TableHead className="glass-table-header">Sinal (dBm)</TableHead>
                  <TableHead className="glass-table-header">Última Queda</TableHead>
                  <TableHead className="glass-table-header">Duração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockConnectionIssues.map((ci, i) => (
                  <TableRow key={i} className="glass-table-row border-none">
                    <TableCell className="font-medium text-sm">{ci.client}</TableCell>
                    <TableCell className="text-sm">{ci.equipment}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${ci.signal < -27 ? "text-destructive" : "text-warning"}`}>
                        {ci.signal}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{ci.lastDrop}</TableCell>
                    <TableCell className="text-sm">{ci.duration}</TableCell>
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
