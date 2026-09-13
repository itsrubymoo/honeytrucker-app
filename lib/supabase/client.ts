import { createBrowserClient } from "@supabase/ssr";

// Deliberately untyped: threading a hand-written `Database` generic through
// supabase-js's `.from()`/`.select()` type inference is unreliable across
// current supabase-js/postgrest-js versions (it can silently resolve to
// `never` or `any` depending on the exact version pair). Instead, every
// query in lib/*/queries.ts and admin-actions.ts calls `.returns<T>()` with
// the interfaces from lib/types/database.ts, which reliably overrides the
// result type regardless of that inference machinery.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
