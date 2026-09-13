import Link from "next/link";

// Point Flodesk Checkout's post-purchase redirect here. The Stripe webhook
// is the real source of truth for membership status and may land a moment
// before or after the buyer reaches this page, so this is just a friendly
// bridge into logging in — it never blocks on the webhook having run yet.
export default function WelcomePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 text-center">
      <h1 className="mb-3 text-2xl font-serif text-stone-900">you&apos;re in 🕊️</h1>
      <p className="mb-6 text-sm text-stone-600">
        thank you for joining. give it a minute or two for everything to sync up, then
        sign in below with the same email you used to join — that&apos;s how we&apos;ll
        find your membership.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
      >
        sign in
      </Link>
    </div>
  );
}
