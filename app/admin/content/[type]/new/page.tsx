import { notFound } from "next/navigation";
import { ContentForm } from "@/components/admin/content-form";
import { parseContentType, CONTENT_TYPE_LABELS } from "@/lib/content/type-guard";
import { createContentItem } from "@/lib/content/admin-actions";
import { requireAdmin } from "@/lib/auth/is-admin";

export default async function NewContentItemPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  await requireAdmin();
  const { type: rawType } = await params;
  const type = parseContentType(rawType);
  if (!type) notFound();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-stone-900">
        new {CONTENT_TYPE_LABELS[type].toLowerCase()} item
      </h1>
      <ContentForm type={type} action={createContentItem.bind(null, type)} />
    </div>
  );
}
