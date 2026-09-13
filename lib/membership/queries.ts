import { createAdminClient } from "@/lib/supabase/admin";
import type { Membership } from "@/lib/types/database";

// `memberships` has no client-facing RLS policies at all (see migration) —
// it's only ever touched server-side. This is the one sanctioned read path
// for a user's own membership row (status, Stripe IDs, renewal date), used
// by the account page and the billing-portal server action.
export async function getMembershipForProfile(profileId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("memberships")
    .select("*")
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .returns<Membership[]>()
    .maybeSingle();
  return data;
}
