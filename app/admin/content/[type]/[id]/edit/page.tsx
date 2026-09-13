import { notFound } from "next/navigation";
import { ContentForm } from "@/components/admin/content-form";
import { parseContentType, CONTENT_TYPE_LABELS } from "@/lib/content/type-guard";
import { updateContentItem } from "@/lib/content/admin-actions";
import { requireAdmin } from "@/lib/auth/is-admin";
import { createClient } from "@/lib/supabase/server";
import type { ContentItem } from "@/lib/types/database";

export default async function EditContentItemPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  await requireAdmin();
  const { type: rawType, id } = await params;
  const type = parseContentType(rawType);
  if (!type) notFound();

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", id)
    .returns<ContentItem[]>()
    .single();
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-stone-900">
        edit {CONTENT_TYPE_LABELS[type].toLowerCase()} item
      </h1>
      <ContentForm type={type} item={item} action={updateContentItem.bind(null, id, type)} />
    </div>
  );
}
