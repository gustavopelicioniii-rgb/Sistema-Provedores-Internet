import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock } from "lucide-react";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clientes",
  "/finance": "Financeiro",
  "/network": "Rede e Conexões",
  "/automations": "Automações",
  "/tickets": "Tickets",
  "/ai-attendance": "IA & Atendimento",
  "/plans": "Planos e Serviços",
  "/reports": "Relatórios",
  "/settings": "Configurações",
};

type RecentItem = { path: string; label: string; timestamp: number };

export function useRecentNavigation() {
  const location = useLocation();
  const [recent, setRecent] = useState<RecentItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("netadmin-recent-nav") || "[]");
    } catch { return []; }
  });

  useEffect(() => {
    const basePath = "/" + location.pathname.split("/").filter(Boolean)[0];
    const label = routeNames[basePath];
    if (!label) return;

    setRecent((prev) => {
      const filtered = prev.filter((r) => r.path !== basePath);
      const updated = [{ path: basePath, label, timestamp: Date.now() }, ...filtered].slice(0, 3);
      localStorage.setItem("netadmin-recent-nav", JSON.stringify(updated));
      return updated;
    });
  }, [location.pathname]);

  return recent;
}

export function RecentNavigation({ collapsed }: { collapsed: boolean }) {
  const recent = useRecentNavigation();

  if (collapsed || recent.length === 0) return null;

  return (
    <div className="px-3 py-2">
      <div className="sidebar-group-label">RECENTES</div>
      <div className="space-y-0.5">
        {recent.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-accent/60 transition-colors"
          >
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
