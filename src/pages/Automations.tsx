import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Wifi, CreditCard, UserPlus, Heart, Star, Settings2 } from "lucide-react";
import { mockAutomations } from "@/data/mockData";

const iconMap: Record<string, React.ElementType> = {
  Wifi, CreditCard, UserPlus, Heart, Star,
};

export default function Automations() {
  const [automations, setAutomations] = useState(mockAutomations);

  const toggle = (id: string) => {
    setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Automações</h2>
          <p className="text-sm text-muted-foreground">Automatize processos e reduza trabalho manual</p>
        </div>
        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
          {automations.filter((a) => a.active).length} ativas
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {automations.map((auto) => {
          const Icon = iconMap[auto.icon] || Wifi;
          return (
            <Card key={auto.id} className={`transition-all ${auto.active ? "border-primary/30 shadow-sm" : "opacity-75"}`}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Switch checked={auto.active} onCheckedChange={() => toggle(auto.id)} />
                </div>

                <div>
                  <h3 className="font-semibold">{auto.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{auto.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-success/5 text-success border-success/20 text-xs">
                    {auto.highlight}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">{auto.metric}</span>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Settings2 className="h-3.5 w-3.5 mr-1" /> Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
