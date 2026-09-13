"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getMembershipForProfile } from "@/lib/membership/queries";
import { getStripe } from "@/lib/stripe/client";

export async function createBillingPortalSession() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const membership = await getMembershipForProfile(user.id);
  if (!membership?.stripe_customer_id) {
    throw new Error("No billing account found for this member.");
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: membership.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
  });

  redirect(session.url);
}
