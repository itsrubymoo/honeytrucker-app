import { notFound } from "next/navigation";
import { getLessonBySlugs } from "@/lib/content/queries";
import { TierBadge } from "@/components/ui/badge";
import { LockedNotice } from "@/components/locked-notice";
import { GatedPlayer } from "@/components/gated-player";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const result = await getLessonBySlugs(courseSlug, lessonSlug);
  if (!result) notFound();

  const { preview, full } = result;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-center gap-2">
        <h1 className="font-serif text-3xl text-stone-900">{preview.title}</h1>
        <TierBadge tier={preview.tier} />
      </div>

      {!full ? (
        <LockedNotice />
      ) : (
        <div className="flex flex-col gap-6">
          {full.content_item_id ? <GatedPlayer contentItemId={full.content_item_id} /> : null}
          {full.body ? (
            <div className="max-w-none whitespace-pre-wrap leading-relaxed text-stone-700">
              {full.body}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
