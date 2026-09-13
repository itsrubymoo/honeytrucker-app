import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS entirely. Server-only: never import this
// from a Client Component, and never expose SUPABASE_SERVICE_ROLE_KEY to the
// browser. Used by the Stripe webhook (no user session exists) and the
// login-time membership reconciliation fallback. Deliberately untyped — see
// lib/supabase/client.ts for why; use `.returns<T>()` per-query.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
