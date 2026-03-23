import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassBackground } from "@/components/GlassBackground";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Breadcrumb } from "@/components/Breadcrumb";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clientes",
  "/finance": "Financeiro",
  "/network": "Rede e Conexões",
  "/automations": "Automações",
  "/tickets": "Tickets / Suporte",
  "/ai-attendance": "IA & Atendimento",
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
              <div className="flex flex-col">
                <h1 className="text-base font-semibold leading-tight">{title}</h1>
                <Breadcrumb />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GlobalSearch />
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
