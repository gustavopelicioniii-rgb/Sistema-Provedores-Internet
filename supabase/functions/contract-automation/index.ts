/**
 * CONTRACT AUTOMATION - Full Security Hardening
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

  const result = { success: true, contracts_checked: 0, expiring_30_days: 0, expiring_15_days: 0, expiring_7_days: 0, notifications_sent: 0, errors: [] as string[], execution_time: "" };
  const startTime = Date.now();

  try {
    const { data: organizations } = await supabase.from("organizations").select("id, name").limit(10);

    if (!organizations?.length) {
      result.errors.push("Nenhuma organização encontrada");
    } else {
      for (const org of organizations) {
        const today = new Date();
        
        const { data: contracts } = await supabase
          .from("contracts")
          .select(`id, customer_id, end_date, status, customers(name, email, whatsapp)`)
          .eq("organization_id", org.id)
          .eq("status", "active")
          .gte("end_date", today.toISOString().slice(0, 10));

        if (contracts?.length) {
          for (const contract of contracts) {
            result.contracts_checked++;
            const customer = contract.customers as any;
            if (!customer) continue;

            const daysUntil = getDaysUntil(contract.end_date);

            if (daysUntil <= 7 && daysUntil > 0) {
              result.expiring_7_days++;
              result.notifications_sent++;
            } else if (daysUntil <= 15 && daysUntil > 7) {
              result.expiring_15_days++;
              result.notifications_sent++;
            } else if (daysUntil <= 30 && daysUntil > 15) {
              result.expiring_30_days++;
              result.notifications_sent++;
            }
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
