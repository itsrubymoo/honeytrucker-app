import { notFound } from "next/navigation";
import { LinkButton, Button } from "@/components/ui/button";
import { TierBadge, Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { parseContentType, CONTENT_TYPE_LABELS } from "@/lib/content/type-guard";
import { deleteContentItem } from "@/lib/content/admin-actions";
import { requireAdmin } from "@/lib/auth/is-admin";
import type { ContentItem } from "@/lib/types/database";

export default async function AdminContentListPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  await requireAdmin();
  const { type: rawType } = await params;
  const type = parseContentType(rawType);
  if (!type) notFound();

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("content_items")
    .select("*")
    .eq("type", type)
    .order("sort_order", { ascending: true })
    .returns<ContentItem[]>();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-stone-900">{CONTENT_TYPE_LABELS[type]}</h1>
        <LinkButton href={`/admin/content/${type}/new`}>add new</LinkButton>
      </div>

      <div className="flex flex-col divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {(items ?? []).length === 0 ? (
          <p className="p-4 text-sm text-stone-500">nothing here yet.</p>
        ) : (
          items!.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-stone-900">{item.title}</p>
                <p className="text-xs text-stone-500">/{type}/{item.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <TierBadge tier={item.tier} />
                <Badge tone={item.published ? "green" : "neutral"}>
                  {item.published ? "published" : "draft"}
                </Badge>
                <LinkButton href={`/admin/content/${type}/${item.id}/edit`} variant="secondary">
                  edit
                </LinkButton>
                <form action={deleteContentItem.bind(null, item.id, type)}>
                  <Button type="submit" variant="danger">
                    delete
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
