import { notFound } from "next/navigation";
import { getContentPreviewBySlug, getContentItemFull } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { TierBadge } from "@/components/ui/badge";
import { LockedNotice } from "@/components/locked-notice";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const preview = await getContentPreviewBySlug("resource", slug);
  if (!preview) notFound();

  const user = await getCurrentUser();
  const entitled = preview.tier === "free" || Boolean(user?.isMember);
  const full = entitled ? await getContentItemFull(preview.id) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="font-serif text-3xl text-stone-900">{preview.title}</h1>
        <TierBadge tier={preview.tier} />
      </div>
      {preview.description ? <p className="mb-6 text-stone-600">{preview.description}</p> : null}

      {entitled && full?.file_url ? (
        <a
          href={full.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
        >
          download
        </a>
      ) : (
        <LockedNotice />
      )}
    </div>
  );
}
