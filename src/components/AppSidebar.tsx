import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, DollarSign, Network, Zap, Headphones,
  FileText, BarChart3, Settings, Wifi, LogOut, ChevronLeft
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Financeiro", url: "/finance", icon: DollarSign },
  { title: "Rede", url: "/network", icon: Network },
  { title: "Automações", url: "/automations", icon: Zap },
  { title: "Tickets", url: "/tickets", icon: Headphones },
  { title: "Planos", url: "/plans", icon: FileText },
  { title: "Relatórios", url: "/reports", icon: BarChart3 },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Wifi className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-lg tracking-tight">NetAdmin</span>}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={cn(
                      "transition-colors",
                      isActive && "bg-primary/10 text-primary font-medium"
                    )}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">AD</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@provedor.com</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
