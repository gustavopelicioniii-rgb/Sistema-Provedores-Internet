/**
 * NOC ALERTS - Real-time Alert System with Cron Support
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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

const CRON_SECRET = Deno.env.get("CRON_SECRET") || "billing-cron-secret-2024";

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

async function checkNetworkAlerts(supabase: any, orgId: string): Promise<Alert[]> {
  const alerts: Alert[] = [];

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

async function checkBillingAlerts(supabase: any, orgId: string): Promise<Alert[]> {
  const alerts: Alert[] = [];

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
      }
    }
  }

  return alerts;
}

async function checkContractAlerts(supabase: any, orgId: string): Promise<Alert[]> {
  const alerts: Alert[] = [];

  const today = new Date().toISOString().split("T")[0];
  const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

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

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const cronSecret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("Authorization");
  const isCronCall = cronSecret === CRON_SECRET;
  
  let userId: string | undefined;
  let orgId: string | undefined;

  if (!isCronCall && (!authHeader || !authHeader.startsWith("Bearer "))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!isCronCall && authHeader) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      userId = user.id;
      const { data: orgData } = await supabase.rpc("get_user_organization_id", { user_id: user.id });
      orgId = orgData || undefined;
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "list";

  try {
    // GET - List or check alerts
    if (req.method === "GET") {
      if (action === "check") {
        const allAlerts: Alert[] = [];

        if (isCronCall) {
          const { data: organizations } = await supabase.from("organizations").select("id").limit(100);

          if (organizations) {
            for (const org of organizations) {
              const [network, billing, contract] = await Promise.all([
                checkNetworkAlerts(supabase, org.id),
                checkBillingAlerts(supabase, org.id),
                checkContractAlerts(supabase, org.id),
              ]);
              allAlerts.push(...network, ...billing, ...contract);
            }
          }
        } else if (orgId) {
          const [network, billing, contract] = await Promise.all([
            checkNetworkAlerts(supabase, orgId),
            checkBillingAlerts(supabase, orgId),
            checkContractAlerts(supabase, orgId),
          ]);
          allAlerts.push(...network, ...billing, ...contract);
        }

        // Save new alerts
        if (allAlerts.length > 0 && orgId) {
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
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(50);

      return new Response(JSON.stringify({
        success: true,
        alerts: recentAlerts || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST - Acknowledge or check alerts
    if (req.method === "POST") {
      // Check if action is in URL params
      if (action === "check") {
        const allAlerts: Alert[] = [];

        if (isCronCall) {
          const { data: organizations } = await supabase.from("organizations").select("id").limit(100);

          if (organizations) {
            for (const org of organizations) {
              const [network, billing, contract] = await Promise.all([
                checkNetworkAlerts(supabase, org.id),
                checkBillingAlerts(supabase, org.id),
                checkContractAlerts(supabase, org.id),
              ]);
              allAlerts.push(...network, ...billing, ...contract);
            }
          }
        } else if (orgId) {
          const [network, billing, contract] = await Promise.all([
            checkNetworkAlerts(supabase, orgId),
            checkBillingAlerts(supabase, orgId),
            checkContractAlerts(supabase, orgId),
          ]);
          allAlerts.push(...network, ...billing, ...contract);
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

      // Acknowledge logic
      let body: any = {};
      try {
        const text = await req.text();
        if (text) body = JSON.parse(text);
      } catch { /* empty body */ }
      
      const { alert_id, acknowledge_all } = body;

      if (acknowledge_all && orgId) {
        await supabase
          .from("noc_alerts")
          .update({ acknowledged: true })
          .eq("organization_id", orgId)
          .eq("acknowledged", false);

        return new Response(JSON.stringify({
          success: true,
          message: "All alerts acknowledged",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (alert_id && orgId) {
        await supabase
          .from("noc_alerts")
          .update({ acknowledged: true })
          .eq("id", alert_id)
          .eq("organization_id", orgId);

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
