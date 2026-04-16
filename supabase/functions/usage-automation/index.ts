/**
 * USAGE AUTOMATION - Full Security Hardening
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://vercel-deploy-inky-delta.vercel.app",
  "https://*.vercel.app",
  "http://localhost:3000"
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowedOrigin = ALLOWED_ORIGINS.find(o => o.includes("*") ? true : o === origin) || ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 60): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }
  entry.count++;
  return entry.count <= maxRequests;
}

async function verifyAuth(supabase: any, req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing authorization" };
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return { valid: false, error: "Invalid token" };
    const { data: orgData } = await supabase.rpc("get_user_organization_id", { user_id: user.id });
    return { valid: true, userId: user.id, orgId: orgData || undefined };
  } catch (e) {
    return { valid: false, error: String(e) };
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

  if (!checkRateLimit(clientIp, 60)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const auth = await verifyAuth(supabase, req);
  if (!auth.valid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const result = { success: true, customers_checked: 0, usage_alerts_80: 0, usage_alerts_100: 0, notifications_sent: 0, errors: [] as string[], execution_time: "" };
  const startTime = Date.now();

  try {
    const { data: organizations } = await supabase.from("organizations").select("id, name").limit(10);

    if (!organizations?.length) {
      result.errors.push("Nenhuma organização encontrada");
    } else {
      for (const org of organizations) {
        const { data: customers } = await supabase
          .from("customers")
          .select(`id, name, whatsapp, plans(data_limit_gb)`)
          .eq("organization_id", org.id)
          .eq("status", "active");

        if (customers?.length) {
          for (const customer of customers) {
            const plan = customer.plans as any;
            if (!plan?.data_limit_gb) continue;

            result.customers_checked++;
            // Usage monitoring logic here
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
    headers: { ...corsHeaders, "Content-Type": "application/json", "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY" },
  });
});
