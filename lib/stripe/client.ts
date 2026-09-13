import Stripe from "stripe";

// Constructed lazily (not at module scope) so simply importing this file —
// which happens whenever a page that renders a "become a member" link is
// collected during `next build` — doesn't require STRIPE_SECRET_KEY to be
// set. It's only actually needed once a request calls into Stripe.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-08-26.dahlia",
    });
  }
  return _stripe;
}

// Stripe price IDs that count as "member" access, e.g. "price_123,price_456".
// Lets Ruby sell something else through the same Stripe account later
// without it accidentally granting membership.
export const MEMBER_PRICE_IDS = (process.env.MEMBER_PRICE_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);
