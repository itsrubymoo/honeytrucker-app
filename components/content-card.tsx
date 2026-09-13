import Link from "next/link";
import { TierBadge } from "@/components/ui/badge";
import type { ContentItemPreview } from "@/lib/types/database";

export function ContentCard({
  item,
  basePath,
  isMember,
}: {
  item: ContentItemPreview;
  basePath: string;
  isMember: boolean;
}) {
  const locked = item.tier === "member" && !isMember;
  const href = locked ? "/account" : `${basePath}/${item.slug}`;

  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white p-4 transition hover:border-amber-700/50 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-stone-900">{item.title}</h3>
        <TierBadge tier={item.tier} />
      </div>
      {item.description ? (
        <p className="line-clamp-2 text-sm text-stone-600">{item.description}</p>
      ) : null}
      {locked ? (
        <p className="mt-1 text-xs font-medium text-amber-800">🔒 members only — tap to join</p>
      ) : null}
    </Link>
  );
}
