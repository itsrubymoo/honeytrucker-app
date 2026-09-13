import Link from "next/link";

export function LockedNotice() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-8 text-center">
      <p className="mb-4 text-sm text-amber-900">
        🔒 this one&apos;s for members. join to get access to everything in here.
      </p>
      <Link
        href="/account"
        className="inline-flex items-center justify-center rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
      >
        become a member
      </Link>
    </div>
  );
}
