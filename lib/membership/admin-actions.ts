"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/is-admin";
import { createAdminClient } from "@/lib/supabase/admin";

// Manual safety-valve for the Stripe<->Supabase email-matching risk: lets
// Ruby link an orphaned membership (bought before the person ever logged in,
// or bought with a different email) to the right profile by hand.
export async function linkMembershipToProfile(membershipId: string, formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("profile_email") ?? "").trim();
  if (!email) return;

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .returns<{ id: string }[]>()
    .maybeSingle();
  if (!profile) throw new Error(`No account found for ${email} yet — they need to sign in at least once.`);

  const { error } = await supabase
    .from("memberships")
    .update({ profile_id: profile.id })
    .eq("id", membershipId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/members");
}
