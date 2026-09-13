import { requireAdmin } from "@/lib/auth/is-admin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function count(table: "content_items" | "courses" | "profiles") {
  const supabase = await createClient();
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [contentCount, courseCount] = await Promise.all([count("content_items"), count("courses")]);

  const adminSupabase = createAdminClient();
  const { count: memberCount } = await adminSupabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .in("status", ["active", "trialing"]);

  const stats = [
    { label: "active members", value: memberCount ?? 0 },
    { label: "content items", value: contentCount },
    { label: "courses", value: courseCount },
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-stone-900">dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-stone-200 bg-white p-5 text-center">
            <p className="text-3xl font-semibold text-stone-900">{s.value}</p>
            <p className="text-xs text-stone-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
