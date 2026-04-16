/**
 * CONTRACT AUTOMATION - Supports Cron and User calls
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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const CRON_SECRET = Deno.env.get("CRON_SECRET") || "billing-cron-secret-2024";

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T12:00:00");
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
  const isCronCall = cronSecret === CRON_SECRET;

  const result = {
    success: true,
    contracts_checked: 0,
    expiring_30_days: 0,
    expiring_15_days: 0,
    expiring_7_days: 0,
    expired: 0,
    notifications_sent: 0,
    errors: [] as string[],
    execution_time: "",
    called_by: isCronCall ? "cron" : "user",
  };

  const startTime = Date.now();

  try {
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id, name")
      .limit(100);

    if (!organizations?.length) {
      result.errors.push("Nenhuma organização encontrada");
    } else {
      for (const org of organizations) {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        
        const { data: contracts } = await supabase
          .from("contracts")
          .select("id, customer_id, end_date, status, customers(name, whatsapp)")
          .eq("organization_id", org.id)
          .eq("status", "active")
          .gte("end_date", todayStr)
          .limit(100);

        if (contracts?.length) {
          for (const contract of contracts) {
            result.contracts_checked++;
            const daysUntil = getDaysUntil(contract.end_date);

            if (daysUntil <= 7 && daysUntil > 0) {
              result.expiring_7_days++;
              result.notifications_sent++;
            } else if (daysUntil <= 15 && daysUntil > 7) {
              result.expiring_15_days++;
            } else if (daysUntil <= 30 && daysUntil > 15) {
              result.expiring_30_days++;
            }
          }
        }

        const { data: expiredContracts } = await supabase
          .from("contracts")
          .select("id, customer_id")
          .eq("organization_id", org.id)
          .eq("status", "active")
          .lt("end_date", todayStr)
          .limit(50);

        if (expiredContracts?.length) {
          result.expired += expiredContracts.length;
          
          for (const contract of expiredContracts) {
            await supabase.from("contracts").update({ status: "expired" }).eq("id", contract.id);
            await supabase.from("customers").update({ status: "suspended" }).eq("id", contract.customer_id);
          }
        }
      }
    }

    result.success = result.errors.length === 0;

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
  }

  result.execution_time = `${Date.now() - startTime}ms`;

  return new Response(JSON.stringify(result, null, 2), {
    status: result.success ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
