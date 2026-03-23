import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, DollarSign, Network, Zap, Headphones,
  FileText, BarChart3, Settings, Wifi, Sparkles
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { RecentNavigation } from "@/components/shared/RecentNavigation";

const navGroups = [
  {
    label: "PRINCIPAL",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "GESTÃO",
    items: [
      { title: "Clientes", url: "/clients", icon: Users },
      { title: "Financeiro", url: "/finance", icon: DollarSign },
      { title: "Planos", url: "/plans", icon: FileText },
    ],
  },
  {
    label: "OPERAÇÕES",
    items: [
      { title: "Rede", url: "/network", icon: Network },
      { title: "Automações", url: "/automations", icon: Zap },
      { title: "Tickets", url: "/tickets", icon: Headphones },
      { title: "IA & Atendimento", url: "/ai-attendance", icon: Sparkles },
    ],
  },
  {
    label: "ANÁLISE",
    items: [
      { title: "Relatórios", url: "/reports", icon: BarChart3 },
      { title: "Configurações", url: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="glass-sidebar border-none">
      <SidebarHeader className="p-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Wifi className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold text-lg tracking-tight">NetAdmin</span>}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && <div className="sidebar-group-label">{group.label}</div>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={cn(
                        "transition-all duration-200 rounded-lg my-0.5",
                        isActive ? "sidebar-item-active" : "hover:bg-accent/60"
                      )}>
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon
                            className="flex-shrink-0"
                            style={{
                              width: 20,
                              height: 20,
                              color: isActive ? 'hsl(217 91% 53%)' : '#64748B',
                            }}
                          />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <RecentNavigation collapsed={collapsed} />
      </SidebarContent>

      <SidebarFooter className="p-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
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
