import { notFound } from "next/navigation";
import { getContentPreviewBySlug } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { TierBadge } from "@/components/ui/badge";
import { LockedNotice } from "@/components/locked-notice";
import { GatedPlayer } from "@/components/gated-player";

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preview = await getContentPreviewBySlug("video", slug);
  if (!preview) notFound();

  const user = await getCurrentUser();
  const entitled = preview.tier === "free" || Boolean(user?.isMember);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="font-serif text-3xl text-stone-900">{preview.title}</h1>
        <TierBadge tier={preview.tier} />
      </div>
      {preview.description ? <p className="mb-6 text-stone-600">{preview.description}</p> : null}

      {entitled ? (
        <GatedPlayer contentItemId={preview.id} poster={preview.cover_image_url ?? undefined} />
      ) : (
        <LockedNotice />
      )}
    </div>
  );
}
