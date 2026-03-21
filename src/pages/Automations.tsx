import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Wifi, CreditCard, UserPlus, Heart, Star, Settings2, Gauge,
  ShieldCheck, TrendingUp, DollarSign
} from "lucide-react";
import { mockAutomations } from "@/data/mockData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const iconMap: Record<string, React.ElementType> = {
  Wifi, CreditCard, UserPlus, Heart, Star, Gauge,
};

const impactKpis = [
  { label: "Tickets evitados este mês", value: "847", icon: ShieldCheck, bg: "rgba(16,185,129,0.1)", color: "#10B981" },
  { label: "Economia estimada", value: "R$ 12.700", icon: DollarSign, bg: "rgba(59,130,246,0.1)", color: "#2563EB" },
  { label: "ROI das automações", value: "340%", icon: TrendingUp, bg: "rgba(139,92,246,0.1)", color: "#8B5CF6" },
];

const mockSendHistory = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  sends: Math.round(20 + Math.random() * 40),
}));

export default function Automations() {
  const [automations, setAutomations] = useState(mockAutomations);

  const toggle = (id: string) => {
    setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Automações</h2>
            <p className="text-xs text-muted-foreground">Automatize processos e reduza trabalho manual</p>
          </div>
          <Badge variant="outline" className="text-primary border-primary/20" style={{ background: 'rgba(59,130,246,0.05)', borderRadius: 9999 }}>
            {automations.filter((a) => a.active).length} ativas
          </Badge>
        </div>

        {/* Impact KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {impactKpis.map((kpi, i) => (
            <GlassCard key={kpi.label} hover className="stagger-item" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <kpi.icon style={{ width: 20, height: 20, color: kpi.color }} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                  <p className="text-[28px] font-bold">{kpi.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((auto) => {
            const Icon = iconMap[auto.icon] || Wifi;
            return (
              <GlassCard key={auto.id} hover className={`transition-all ${!auto.active ? "opacity-60" : ""}`}>
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                      <Icon style={{ width: 20, height: 20, color: '#2563EB' }} />
                    </div>
                    <Switch checked={auto.active} onCheckedChange={() => toggle(auto.id)} />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold">{auto.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{auto.description}</p>
                  </div>

                  <div>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: '#ECFDF5', color: '#059669', borderRadius: 9999 }}
                    >
                      {auto.highlight}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <span className="text-xs text-muted-foreground">{auto.metric}</span>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Settings2 className="h-3.5 w-3.5 mr-1" /> Configurar
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="glass-card border-none w-[400px] sm:w-[480px]">
                        <SheetHeader>
                          <SheetTitle>{auto.name}</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-5">
                          <div className="flex items-center justify-between">
                            <Label>Automação ativa</Label>
                            <Switch checked={auto.active} onCheckedChange={() => toggle(auto.id)} />
                          </div>

                          <div className="space-y-2">
                            <Label>Template de mensagem</Label>
                            <Textarea
                              defaultValue={`Olá {{nome}}, informamos que seu plano {{plano}} está com previsão de retorno para {{previsao}}.`}
                              rows={4}
                              style={{ borderRadius: 10 }}
                            />
                            <p className="text-[10px] text-muted-foreground">Variáveis: {"{{nome}}"}, {"{{plano}}"}, {"{{previsao}}"}</p>
                          </div>

                          <div className="space-y-2">
                            <Label>Canais de envio</Label>
                            <div className="flex gap-4">
                              {["WhatsApp", "SMS", "Email"].map((ch) => (
                                <label key={ch} className="flex items-center gap-2 text-sm">
                                  <Checkbox defaultChecked={ch === "WhatsApp"} /> {ch}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Horário permitido</Label>
                            <div className="flex items-center gap-2">
                              <Input type="time" defaultValue="08:00" className="w-28" style={{ borderRadius: 10 }} />
                              <span className="text-sm">até</span>
                              <Input type="time" defaultValue="20:00" className="w-28" style={{ borderRadius: 10 }} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Envios por dia (últimos 30 dias)</Label>
                            <ResponsiveContainer width="100%" height={100}>
                              <BarChart data={mockSendHistory}>
                                <Bar dataKey="sends" fill="#2563EB" radius={[2, 2, 0, 0]} />
                                <XAxis dataKey="day" fontSize={8} tickLine={false} axisLine={false} interval={4} />
                                <Tooltip />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { label: "Taxa abertura", value: "87%" },
                              { label: "Taxa resposta", value: "34%" },
                              { label: "Tickets evitados", value: "142" },
                            ].map((m) => (
                              <div key={m.label} className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.02)' }}>
                                <p className="text-lg font-bold">{m.value}</p>
                                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                              </div>
                            ))}
                          </div>

                          <Button className="w-full" style={{ borderRadius: 10 }}>Salvar configurações</Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
