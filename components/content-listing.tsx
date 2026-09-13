import { listContentByType } from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { ContentCard } from "@/components/content-card";
import type { ContentType } from "@/lib/types/database";

const titles: Record<ContentType, { heading: string; empty: string }> = {
  resource: { heading: "library", empty: "nothing here yet — check back soon." },
  audio: { heading: "audio", empty: "no audio yet — check back soon." },
  video: { heading: "video", empty: "no video yet — check back soon." },
};

export async function ContentListing({ type, basePath }: { type: ContentType; basePath: string }) {
  const [items, user] = await Promise.all([listContentByType(type), getCurrentUser()]);
  const { heading, empty } = titles[type];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-6 font-serif text-3xl text-stone-900">{heading}</h1>
      {items.length === 0 ? (
        <p className="text-sm text-stone-500">{empty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} basePath={basePath} isMember={Boolean(user?.isMember)} />
          ))}
        </div>
      )}
    </div>
  );
}
