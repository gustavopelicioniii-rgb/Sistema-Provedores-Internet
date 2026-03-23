import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { mockClients } from "@/data/mockData";

const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clientes",
  finance: "Financeiro",
  network: "Rede e Conexões",
  automations: "Automações",
  tickets: "Tickets",
  "ai-attendance": "IA & Atendimento",
  plans: "Planos e Serviços",
  reports: "Relatórios",
  settings: "Configurações",
};

export function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs: { label: string; path: string }[] = [];

  segments.forEach((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    let label = routeNames[seg] || seg;

    // Check if it's a client ID
    if (segments[i - 1] === "clients" && !routeNames[seg]) {
      const client = mockClients.find((c) => c.id === seg);
      label = client?.name || `Cliente #${seg}`;
    }

    crumbs.push({ label, path });
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <div key={crumb.path} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
