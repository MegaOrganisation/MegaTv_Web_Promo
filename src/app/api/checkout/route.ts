import { NextRequest, NextResponse } from "next/server";

/**
 * MegaTv Pro checkout entry (Stripe via RevenueCat / Stripe Checkout).
 *
 * Query:
 *   - plan=monthly|yearly|lifetime
 *   - user_id= optional Supabase auth UUID (RevenueCat app_user_id)
 *
 * Env (Vercel):
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_MONTHLY / STRIPE_PRICE_YEARLY / STRIPE_PRICE_LIFETIME
 *   (optional) STRIPE_PAYMENT_LINK_MONTHLY / _YEARLY / _LIFETIME — used if price IDs absent
 *   NEXT_PUBLIC_SITE_URL — success/cancel base (default megatv-neo.vercel.app)
 *
 * When Stripe is not configured, redirects to /?checkout=configure#pricing.
 */

type PlanKey = "monthly" | "yearly" | "lifetime";

const PRODUCT_IDS: Record<PlanKey, string> = {
  monthly: "monthly",
  yearly: "yearly",
  lifetime: "lifetime",
};

function resolvePlan(raw: string | null): PlanKey {
  const v = (raw ?? "monthly").trim().toLowerCase();
  if (v === "annual" || v === "yearly" || v === "year") return "yearly";
  if (v === "lifetime" || v === "life" || v === "once") return "lifetime";
  return "monthly";
}

function siteBase(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    process.env.VERCEL_URL?.replace(/\/+$/, "")?.replace(/^/, "https://") ||
    "https://megatv-neo.vercel.app"
  );
}

/** Query params MUST come before the hash, otherwise the browser keeps the user on the hero. */
function pricingRedirect(base: string, checkout: "configure" | "error" | "cancel", plan: PlanKey): string {
  const q = new URLSearchParams({
    checkout,
    plan,
    product: PRODUCT_IDS[plan],
  });
  return `${base}/?${q.toString()}#pricing`;
}

function paymentLinkFor(plan: PlanKey): string | null {
  const map: Record<PlanKey, string | undefined> = {
    monthly: process.env.STRIPE_PAYMENT_LINK_MONTHLY,
    yearly: process.env.STRIPE_PAYMENT_LINK_YEARLY,
    lifetime: process.env.STRIPE_PAYMENT_LINK_LIFETIME,
  };
  const link = map[plan]?.trim();
  return link && link.startsWith("http") ? link : null;
}

function priceIdFor(plan: PlanKey): string | null {
  const map: Record<PlanKey, string | undefined> = {
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    yearly: process.env.STRIPE_PRICE_YEARLY,
    lifetime: process.env.STRIPE_PRICE_LIFETIME,
  };
  const id = map[plan]?.trim();
  return id && id.startsWith("price_") ? id : null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const plan = resolvePlan(url.searchParams.get("plan"));
  const userId = (url.searchParams.get("user_id") ?? "").trim();
  const base = siteBase();
  const successUrl = `${base}/companion?pro=success&plan=${plan}`;
  const cancelUrl = pricingRedirect(base, "cancel", plan);

  // Prefer static Payment Links when configured (simplest RC/Stripe sideload path).
  const paymentLink = paymentLinkFor(plan);
  if (paymentLink) {
    const redirect = new URL(paymentLink);
    if (userId) redirect.searchParams.set("client_reference_id", userId);
    return NextResponse.redirect(redirect.toString(), 302);
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  const priceId = priceIdFor(plan);
  if (!stripeKey || !priceId) {
    return NextResponse.redirect(pricingRedirect(base, "configure", plan), 302);
  }

  try {
    const mode = plan === "lifetime" ? "payment" : "subscription";
    const params = new URLSearchParams();
    params.set("mode", mode);
    params.set("success_url", successUrl);
    params.set("cancel_url", cancelUrl);
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("allow_promotion_codes", "true");
    params.set("metadata[megatv_product_id]", PRODUCT_IDS[plan]);
    params.set("metadata[megatv_plan]", plan);
    if (userId) {
      // Required so Stripe webhooks can map payment → Supabase auth.users.id
      // (and RevenueCat app_user_id when Stripe App is connected).
      params.set("client_reference_id", userId);
      params.set("metadata[app_user_id]", userId);
      params.set("metadata[supabase_user_id]", userId);
      if (mode === "subscription") {
        params.set("subscription_data[metadata][app_user_id]", userId);
        params.set("subscription_data[metadata][supabase_user_id]", userId);
        params.set("subscription_data[metadata][megatv_plan]", plan);
      }
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!stripeRes.ok) {
      const errText = await stripeRes.text();
      console.error("stripe checkout session failed", errText);
      return NextResponse.redirect(pricingRedirect(base, "error", plan), 302);
    }

    const session = (await stripeRes.json()) as { url?: string };
    if (!session.url) {
      return NextResponse.redirect(pricingRedirect(base, "error", plan), 302);
    }
    return NextResponse.redirect(session.url, 302);
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.redirect(pricingRedirect(base, "error", plan), 302);
  }
}
