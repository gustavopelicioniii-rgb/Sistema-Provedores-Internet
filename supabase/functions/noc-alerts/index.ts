/**
 * NOC ALERTS - Real-time Alert System
 * 
 * Handles:
 * - Device offline alerts
 * - Overdue invoice alerts
 * - Contract expiration alerts
 * - Usage threshold alerts
 * - System health alerts
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://vercel-deploy-inky-delta.vercel.app",
  "https://*.vercel.app",
  "http://localhost:3000"
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowedOrigin = ALLOWED_ORIGINS.find(o => 
    o.includes("*") ? true : o === origin
  ) || ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}

interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  category: "network" | "billing" | "contract" | "usage" | "system";
  title: string;
  description: string;
  organization_id: string;
  reference_id?: string;
  reference_type?: string;
  acknowledged: boolean;
  created_at: string;
}

// ============================================
// ALERT GENERATORS
// ============================================
async function checkNetworkAlerts(supabase: ReturnType<typeof createClient>, orgId: string): Promise<Alert[]> {
  const alerts: Alert[] = [];

  // Check for offline devices
  const { data: devices } = await supabase
    .from("network_devices")
    .select("id, name, ip_address, last_seen")
    .eq("organization_id", orgId)
    .eq("status", "active");

  if (devices) {
    for (const device of devices) {
      const lastSeen = new Date(device.last_seen || 0);
      const now = new Date();
      const minutesSinceLastSeen = (now.getTime() - lastSeen.getTime()) / 60000;

      // Device offline for more than 5 minutes
      if (minutesSinceLastSeen > 5) {
        alerts.push({
          id: `network-offline-${device.id}-${Date.now()}`,
          severity: "critical",
          category: "network",
          title: `⚠️ Equipamento Offline: ${device.name}`,
          description: `IP: ${device.ip_address} - Sem resposta há ${Math.floor(minutesSinceLastSeen)} minutos`,
          organization_id: orgId,
          reference_id: device.id,
          reference_type: "network_device",
          acknowledged: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  return alerts;
}

async function checkBillingAlerts(supabase: ReturnType<typeof createClient>, orgId: string): Promise<Alert[]> {
  const alerts: Alert[] = [];

  // Check for overdue invoices
  const { data: overdueInvoices } = await supabase
    .from("invoices")
    .select("id, customer_id, due_date, total, customers(name)")
    .eq("organization_id", orgId)
    .eq("status", "overdue");

  if (overdueInvoices) {
    for (const invoice of overdueInvoices) {
      const dueDate = new Date(invoice.due_date);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / 86400000);

      // Critical if more than 7 days overdue
      if (daysOverdue >= 7) {
        const customer = invoice.customers as any;
        alerts.push({
          id: `billing-overdue-${invoice.id}-${Date.now()}`,
          severity: "critical",
          category: "billing",
          title: `🔴 Cliente Inadimplente: ${customer?.name || "Desconhecido"}`,
          description: `Fatura vencida há ${daysOverdue} dias - Valor: R$ ${invoice.total?.toFixed(2)}`,
          organization_id: orgId,
          reference_id: invoice.id,
          reference_type: "invoice",
          acknowledged: false,
          created_at: new Date().toISOString(),
        });
      } else if (daysOverdue > 0) {
        const customer = invoice.customers as any;
        alerts.push({
          id: `billing-overdue-${invoice.id}-${Date.now()}`,
          severity: "warning",
          category: "billing",
          title: `⚠️ Fatura em Atraso: ${customer?.name || "Desconhecido"}`,
          description: `Fatura vencida há ${daysOverdue} dias - Valor: R$ ${invoice.total?.toFixed(2)}`,
          organization_id: orgId,
          reference_id: invoice.id,
          reference_type: "invoice",
          acknowledged: false,
          created_at: new Date().toISOString(),
        });
      }
    }
  }

  return alerts;
}

async function checkContractAlerts(supabase: ReturnType<typeof createClient>, orgId: string): Promise<Alert[]> {
  const alerts: Alert[] = [];

  const today = new Date().toISOString().split("T")[0];
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  // Contracts expiring in 7 days
  const { data: expiringContracts } = await supabase
    .from("contracts")
    .select("id, end_date, customers(name)")
    .eq("organization_id", orgId)
    .eq("status", "active")
    .gte("end_date", today)
    .lte("end_date", in7Days);

  if (expiringContracts) {
    for (const contract of expiringContracts) {
      const customer = contract.customers as any;
      const daysUntil = Math.floor((new Date(contract.end_date).getTime() - Date.now()) / 86400000);

      alerts.push({
        id: `contract-expiring-${contract.id}-${Date.now()}`,
        severity: daysUntil <= 3 ? "critical" : "warning",
        category: "contract",
        title: `📄 Contrato vencendo em ${daysUntil} dias: ${customer?.name || "Desconhecido"}`,
        description: `Vencimento: ${contract.end_date}`,
        organization_id: orgId,
        reference_id: contract.id,
        reference_type: "contract",
        acknowledged: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

// ============================================
// MAIN HANDLER
// ============================================
Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Verify auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: orgData } = await supabase.rpc("get_user_organization_id", { user_id: user.id });

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    // GET - List or check alerts
    if (req.method === "GET") {
      if (action === "check") {
        // Generate new alerts
        const allAlerts: Alert[] = [];

        if (orgData) {
          const [network, billing, contract] = await Promise.all([
            checkNetworkAlerts(supabase, orgData),
            checkBillingAlerts(supabase, orgData),
            checkContractAlerts(supabase, orgData),
          ]);

          allAlerts.push(...network, ...billing, ...contract);

          // Save new alerts to database
          if (allAlerts.length > 0) {
            const alertsToSave = allAlerts.map(a => ({
              organization_id: a.organization_id,
              type: a.category,
              severity: a.severity,
              title: a.title,
              description: a.description,
              reference_id: a.reference_id,
              reference_type: a.reference_type,
              channel: "in_app",
            }));

            await supabase.from("noc_alerts").insert(alertsToSave);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          alerts: allAlerts,
          total: allAlerts.length,
          critical: allAlerts.filter(a => a.severity === "critical").length,
          warning: allAlerts.filter(a => a.severity === "warning").length,
          info: allAlerts.filter(a => a.severity === "info").length,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // List recent alerts
      const { data: recentAlerts } = await supabase
        .from("noc_alerts")
        .select("*")
        .eq("organization_id", orgData)
        .order("created_at", { ascending: false })
        .limit(50);

      return new Response(JSON.stringify({
        success: true,
        alerts: recentAlerts || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST - Acknowledge alert
    if (req.method === "POST") {
      const body = await req.json();
      const { alert_id, acknowledge_all } = body;

      if (acknowledge_all) {
        await supabase
          .from("noc_alerts")
          .update({ acknowledged: true })
          .eq("organization_id", orgData)
          .eq("acknowledged", false);

        return new Response(JSON.stringify({
          success: true,
          message: "All alerts acknowledged",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (alert_id) {
        await supabase
          .from("noc_alerts")
          .update({ acknowledged: true })
          .eq("id", alert_id)
          .eq("organization_id", orgData);

        return new Response(JSON.stringify({
          success: true,
          message: "Alert acknowledged",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
