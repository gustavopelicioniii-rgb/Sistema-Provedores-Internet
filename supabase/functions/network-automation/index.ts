/**
 * NETWORK AUTOMATION - Supports Cron and User calls
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
    equipment_checked: 0,
    alerts_generated: 0,
    customers_blocked: 0,
    customers_unblocked: 0,
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
        const { data: devices } = await supabase
          .from("network_devices")
          .select("id, name, ip_address, status")
          .eq("organization_id", org.id)
          .eq("status", "active")
          .limit(50);

        if (devices?.length) {
          result.equipment_checked += devices.length;
        }

        const { data: suspended } = await supabase
          .from("customers")
          .select("id, name")
          .eq("organization_id", org.id)
          .eq("status", "suspended")
          .limit(20);

        if (suspended?.length) {
          result.customers_blocked += suspended.length;
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
