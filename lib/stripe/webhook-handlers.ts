import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, MEMBER_PRICE_IDS } from "@/lib/stripe/client";
import type { MembershipStatus } from "@/lib/types/database";

// Maps a Stripe subscription status to our narrower membership status enum.
// Stripe also has "unpaid" and "paused" — treated as canceled here since
// they mean "no longer entitled" for our purposes.
function toMembershipStatus(stripeStatus: Stripe.Subscription.Status): MembershipStatus {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "incomplete":
      return "incomplete";
    case "canceled":
    default:
      return "canceled";
  }
}

async function upsertFromSubscription(subscription: Stripe.Subscription, emailHint?: string | null) {
  const supabase = createAdminClient();

  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const isMemberPrice = MEMBER_PRICE_IDS.length === 0 || (priceId && MEMBER_PRICE_IDS.includes(priceId));

  if (!isMemberPrice) return; // Not a membership product — ignore for gating purposes.

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  let email = emailHint ?? null;
  if (!email) {
    const customer = await getStripe().customers.retrieve(customerId);
    email = !customer.deleted ? customer.email : null;
  }
  if (!email) return; // Nothing to reconcile against.

  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .returns<{ id: string }[]>()
    .maybeSingle();

  await supabase.from("memberships").upsert(
    {
      profile_id: existingProfile?.id ?? null,
      email,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: toMembershipStatus(subscription.status),
      price_id: priceId,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );
}

export async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.mode !== "subscription" || !session.subscription) return;

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription.id;
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);

  await upsertFromSubscription(subscription, session.customer_details?.email ?? session.customer_email);
}

export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  await upsertFromSubscription(subscription);
}

export async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const supabase = createAdminClient();

  await supabase
    .from("memberships")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id);
}

export async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  const subscriptionId =
    typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
  if (!subscriptionId) return;

  const supabase = createAdminClient();
  await supabase
    .from("memberships")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscriptionId);
}
