import { requireAdmin } from "@/lib/auth/is-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form";
import { linkMembershipToProfile } from "@/lib/membership/admin-actions";
import type { Membership } from "@/lib/types/database";

export default async function AdminMembersPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("*")
    .order("updated_at", { ascending: false })
    .returns<Membership[]>();

  const profileIds = (memberships ?? []).map((m) => m.profile_id).filter((id): id is string => Boolean(id));
  const { data: profiles } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, email")
        .in("id", profileIds)
        .returns<{ id: string; email: string }[]>()
    : { data: [] as { id: string; email: string }[] };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-stone-900">members</h1>
      <div className="flex flex-col divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {(memberships ?? []).length === 0 ? (
          <p className="p-4 text-sm text-stone-500">no memberships yet.</p>
        ) : (
          memberships!.map((m) => {
            const linkedProfile = m.profile_id ? profileById.get(m.profile_id) : null;
            return (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-stone-900">{m.email}</p>
                  <p className="text-xs text-stone-500">
                    {linkedProfile ? `linked to account: ${linkedProfile.email}` : "not linked to an account yet"}
                  </p>
                </div>
                <Badge tone={m.status === "active" || m.status === "trialing" ? "green" : "neutral"}>
                  {m.status}
                </Badge>
                {!m.profile_id ? (
                  <form
                    action={linkMembershipToProfile.bind(null, m.id)}
                    className="flex items-center gap-2"
                  >
                    <TextInput
                      name="profile_email"
                      placeholder="account email to link"
                      defaultValue={m.email}
                      className="w-56"
                    />
                    <Button type="submit" variant="secondary">
                      link
                    </Button>
                  </form>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
