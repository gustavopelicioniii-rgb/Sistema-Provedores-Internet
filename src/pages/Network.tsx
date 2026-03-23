import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Wifi, AlertTriangle, Server, Activity, Map, Table2, Clock, Thermometer, Users, RefreshCw } from "lucide-react";
import { OLTMap } from "@/components/network/OLTMap";
import { OLTsTable } from "@/components/network/OLTsTable";
import { IncidentTimeline } from "@/components/network/IncidentTimeline";
import { SignalQualityChart } from "@/components/network/SignalQualityChart";
import { RegionHeatmap } from "@/components/network/RegionHeatmap";
import { AtRiskClients } from "@/components/network/AtRiskClients";
import { useOLTs, useOLTHealth, useNetworkIncidents, useSignalQuality, useClientsAtRisk, useNetworkHeatmap } from "@/hooks/useNetwork";
import { useWebSocket } from "@/lib/websocket";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
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

export default function NetworkPage() {
  const [selectedOLT, setSelectedOLT] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("map");

  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  // Connect WebSocket for real-time updates
  useWebSocket();

  // API data
  const { data: oltsData, isLoading: oltsLoading, isError: oltsError } = useOLTs({ limit: 100 });
  const { data: health, isLoading: healthLoading } = useOLTHealth(selectedOLT?.id || null);
  const { data: incidentsData, isLoading: incidentsLoading } = useNetworkIncidents({ limit: 50 });
  const { data: signalData, isLoading: signalLoading } = useSignalQuality();
  const { data: atRiskData, isLoading: atRiskLoading } = useClientsAtRisk(-25);
  const { data: heatmapData, isLoading: heatmapLoading } = useNetworkHeatmap();

  // Determine data source
  const useMock = !isAuthenticated || oltsError;
  const olts = useMock
    ? mockEquipments.map(e => ({
        id: e.id, name: e.name, model: e.name.split(' ')[1] || '', ip_address: e.ip,
        port: e.port, status: e.status, uptime_seconds: parseInt(e.uptime) * 86400,
        clients_connected: e.clients, signal_quality: e.status === 'online' ? 90 + Math.random() * 10 : 0,
        latitude: -23.55 + (Math.random() - 0.5) * 0.2,
        longitude: -46.63 + (Math.random() - 0.5) * 0.2,
        active_incidents: e.status !== 'online' ? 1 : 0,
      }))
    : (oltsData?.data || []);

  const incidents = useMock ? [] : (incidentsData?.data || []);

  // Stats
  const totalEquip = olts.length;
  const onlineCount = olts.filter((e: any) => e.status === "online").length;
  const alertCount = olts.filter((e: any) => e.status !== "online").length;
  const onlinePercent = totalEquip > 0 ? ((onlineCount / totalEquip) * 100).toFixed(0) : "0";

  const handleOLTClick = (olt: any) => {
    setSelectedOLT(olt);
    setDrawerOpen(true);
  };

  return (
    <PageWrapper>
      <div className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { label: "Total equipamentos", value: totalEquip, icon: Server, bg: "rgba(59,130,246,0.1)", color: "#2563EB" },
            { label: "Online", value: `${onlinePercent}%`, icon: Wifi, bg: "rgba(16,185,129,0.1)", color: "#10B981" },
            { label: "Alertas ativos", value: alertCount, icon: AlertTriangle, bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
            { label: "Incidentes", value: incidents.length, icon: Activity, bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
          ].map((s, i) => (
            <GlassCard key={s.label} hover className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon style={{ width: 18, height: 18, color: s.color }} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="glass-card">
              <TabsTrigger value="map" className="text-xs gap-1.5"><Map className="h-3.5 w-3.5" />Mapa</TabsTrigger>
              <TabsTrigger value="table" className="text-xs gap-1.5"><Table2 className="h-3.5 w-3.5" />OLTs</TabsTrigger>
              <TabsTrigger value="incidents" className="text-xs gap-1.5"><Clock className="h-3.5 w-3.5" />Eventos</TabsTrigger>
              <TabsTrigger value="heatmap" className="text-xs gap-1.5"><Thermometer className="h-3.5 w-3.5" />Heatmap</TabsTrigger>
              <TabsTrigger value="risk" className="text-xs gap-1.5"><Users className="h-3.5 w-3.5" />Em Risco</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['olts'] });
              queryClient.invalidateQueries({ queryKey: ['signal-quality'] });
              queryClient.invalidateQueries({ queryKey: ['network-incidents'] });
            }} style={{ borderRadius: 10 }}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Atualizar
            </Button>
          </div>

          {/* Tab 1: Map */}
          <TabsContent value="map" className="space-y-4 mt-4">
            <OLTMap olts={olts} onOLTClick={handleOLTClick} selectedOLTId={selectedOLT?.id} />

            {/* Uptime Chart */}
            <GlassCard hover>
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-1">Uptime da Rede</h3>
                <p className="text-[10px] text-muted-foreground mb-3">Ultimas 24 horas - Meta: 99,5%</p>
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
          </TabsContent>

          {/* Tab 2: OLTs Table */}
          <TabsContent value="table" className="mt-4">
            <GlassCard>
              <OLTsTable
                olts={olts}
                onViewHealth={(id) => { setSelectedOLT(olts.find((o: any) => o.id === id)); setDrawerOpen(true); }}
                onViewClients={(id) => { setSelectedOLT(olts.find((o: any) => o.id === id)); setDrawerOpen(true); }}
                onViewIncidents={(id) => { setSelectedOLT(olts.find((o: any) => o.id === id)); setDrawerOpen(true); }}
                onEdit={() => {}}
              />
            </GlassCard>
          </TabsContent>

          {/* Tab 3: Incidents Timeline */}
          <TabsContent value="incidents" className="mt-4">
            <IncidentTimeline incidents={incidents} isLoading={incidentsLoading && !useMock} />
          </TabsContent>

          {/* Tab 4: Heatmap */}
          <TabsContent value="heatmap" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RegionHeatmap data={heatmapData || []} isLoading={heatmapLoading && !useMock} />
              <SignalQualityChart data={signalData || []} isLoading={signalLoading && !useMock} />
            </div>
          </TabsContent>

          {/* Tab 5: At Risk Clients */}
          <TabsContent value="risk" className="mt-4">
            <AtRiskClients
              clients={useMock
                ? mockConnectionIssues.map((ci, i) => ({
                    id: String(i), name: ci.client, status: "ativo", churn_score: 60 + i * 5,
                    signal_rx: ci.signal, olt_name: ci.equipment, plan_name: "100 Mega",
                  }))
                : (atRiskData || [])}
              isLoading={atRiskLoading && !useMock}
            />
          </TabsContent>
        </Tabs>

        {/* OLT Detail Drawer */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent className="glass-card border-none w-full sm:max-w-md">
            {selectedOLT && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      selectedOLT.status === 'online' ? 'bg-success' :
                      selectedOLT.status === 'warning' ? 'bg-amber-500' : 'bg-destructive'
                    }`} />
                    {selectedOLT.name}
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Health Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Status", value: selectedOLT.status?.toUpperCase(), color: selectedOLT.status === 'online' ? '#10B981' : '#EF4444' },
                      { label: "IP", value: selectedOLT.ip_address },
                      { label: "Clientes", value: selectedOLT.clients_connected || 0 },
                      { label: "Sinal", value: `${(selectedOLT.signal_quality || 0).toFixed(0)}%` },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }}>
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-bold" style={item.color ? { color: item.color } : undefined}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Health details from API */}
                  {health && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground">DETALHES DE HEALTH</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }}>
                          <p className="text-[10px] text-muted-foreground">Uptime</p>
                          <p className="text-sm font-bold">{health.uptime}</p>
                        </div>
                        <div className="p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }}>
                          <p className="text-[10px] text-muted-foreground">Capacidade</p>
                          <p className="text-sm font-bold">{health.capacity_percent}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Model & Firmware */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground">INFORMACOES</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modelo</span>
                        <span className="font-medium">{selectedOLT.model || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Porta</span>
                        <span className="font-medium">{selectedOLT.port || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline" style={{ borderRadius: 10 }}
                    onClick={() => setDrawerOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </PageWrapper>
  );
}
