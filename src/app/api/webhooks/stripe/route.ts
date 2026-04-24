import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook for subscription events (checkout.session.completed, invoice.paid, etc.).
 * Scaffold only — no live Stripe keys needed for V1.
 *
 * TODO: Implement when Stripe subscriptions are added in V2.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Not implemented — Stripe scaffold for V2" },
    { status: 501 },
  );
}
