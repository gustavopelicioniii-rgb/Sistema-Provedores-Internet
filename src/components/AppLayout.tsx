import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassBackground } from "@/components/GlassBackground";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clientes",
  "/finance": "Financeiro",
  "/network": "Rede e Conexões",
  "/automations": "Automações",
  "/tickets": "Tickets / Suporte",
  "/plans": "Planos e Serviços",
  "/reports": "Relatórios",
  "/settings": "Configurações",
};

export default function AppLayout() {
  const location = useLocation();
  const basePath = "/" + location.pathname.split("/").filter(Boolean)[0];
  const title = routeTitles[basePath] || "NetAdmin";

  return (
    <SidebarProvider>
      <GlassBackground />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 glass-topbar flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-base font-semibold">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes, tickets, faturas..."
                  className="pl-9 w-72 h-9 border-none"
                  style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center pulse-badge">3</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
