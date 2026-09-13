import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getMembershipForProfile } from "@/lib/membership/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createBillingPortalSession } from "@/app/account/actions";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const membership = user.isMember ? await getMembershipForProfile(user.id) : null;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 font-serif text-3xl text-stone-900">your account</h1>

      <div className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">email</p>
          <p className="text-stone-900">{user.email}</p>
        </div>

        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-stone-500">membership</p>
          {user.isMember ? (
            <Badge tone="amber">member — {membership?.status ?? "active"}</Badge>
          ) : (
            <Badge tone="neutral">free</Badge>
          )}
        </div>

        {user.isMember ? (
          <form action={createBillingPortalSession}>
            <Button type="submit" variant="secondary" className="w-full">
              manage billing
            </Button>
          </form>
        ) : process.env.NEXT_PUBLIC_FLODESK_CHECKOUT_URL ? (
          <a
            href={process.env.NEXT_PUBLIC_FLODESK_CHECKOUT_URL}
            className="inline-flex w-full items-center justify-center rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
          >
            become a member
          </a>
        ) : null}
      </div>
    </div>
  );
}
