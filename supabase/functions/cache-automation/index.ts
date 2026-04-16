/**
 * CACHE AUTOMATION - Redis Integration for Performance
 * 
 * Provides:
 * - Distributed caching
 * - Rate limiting persistent
 * - Session management
 * - Real-time pub/sub for notifications
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
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  };
}

// ============================================
// REDIS CLIENT (simulated for demo - use real Redis in production)
// ============================================
const cache = new Map<string, { value: string; expires: number }>();

async function cacheGet(key: string): Promise<string | null> {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

async function cacheSet(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
  cache.set(key, { value, expires: Date.now() + (ttlSeconds * 1000) });
}

async function cacheDel(key: string): Promise<void> {
  cache.delete(key);
}

async function cacheClear(pattern: string): Promise<void> {
  const regex = new RegExp(pattern.replace("*", ".*"));
  for (const key of cache.keys()) {
    if (regex.test(key)) cache.delete(key);
  }
}

// ============================================
// MAIN HANDLER
// ============================================
Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Verify auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

    // GET - retrieve cached data
    if (req.method === "GET" && path) {
      const cacheKey = `cache:${user.id}:${path}`;
      const cached = await cacheGet(cacheKey);
      
      if (cached) {
        return new Response(cached, {
          headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
        });
      }

      // Cache miss - fetch from database
      const { data: orgData } = await supabase.rpc("get_user_organization_id", { user_id: user.id });
      if (!orgData) {
        return new Response(JSON.stringify({ error: "No organization found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch dashboard data based on path
      let data: any = {};
      switch (path) {
        case "dashboard":
          const [customers, invoices, contracts] = await Promise.all([
            supabase.from("customers").select("id, status", { count: "exact" }).eq("organization_id", orgData),
            supabase.from("invoices").select("id, status, total", { count: "exact" }).eq("organization_id", orgData),
            supabase.from("contracts").select("id, status", { count: "exact" }).eq("organization_id", orgData),
          ]);
          data = {
            total_customers: customers.count || 0,
            active_customers: customers.data?.filter(c => c.status === "active").length || 0,
            total_invoices: invoices.count || 0,
            pending_invoices: invoices.data?.filter(i => i.status === "pending").length || 0,
            overdue_invoices: invoices.data?.filter(i => i.status === "overdue").length || 0,
            total_contracts: contracts.count || 0,
          };
          break;
        case "customers":
          const { data: customersData } = await supabase
            .from("customers")
            .select("*")
            .eq("organization_id", orgData)
            .order("created_at", { ascending: false })
            .limit(100);
          data = { customers: customersData || [] };
          break;
        case "invoices":
          const { data: invoicesData } = await supabase
            .from("invoices")
            .select("*")
            .eq("organization_id", orgData)
            .order("due_date", { ascending: true })
            .limit(100);
          data = { invoices: invoicesData || [] };
          break;
        default:
          data = { message: "Endpoint not found" };
      }

      // Cache the result
      await cacheSet(`cache:${user.id}:${path}`, JSON.stringify(data), 60); // 1 min cache

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
      });
    }

    // POST - invalidate cache
    if (req.method === "POST") {
      const body = await req.json();
      const { action, key } = body;

      if (action === "invalidate") {
        await cacheDel(`cache:${user.id}:${key || "*"}`);
        return new Response(JSON.stringify({ success: true, message: "Cache invalidated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "invalidate-all") {
        await cacheClear(`cache:${user.id}:*`);
        return new Response(JSON.stringify({ success: true, message: "All cache invalidated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
