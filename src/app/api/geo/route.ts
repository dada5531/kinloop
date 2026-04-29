/**
 * GET /api/geo
 *
 * Returns the visitor's geolocation inferred from Vercel edge headers.
 * Used as layer 2 in the three-layer location resolution for Zocdoc deep links.
 *
 * Vercel headers (populated automatically on deployed instances):
 * - x-vercel-ip-postal-code (US ZIP, most specific — requires Pro plan)
 * - x-vercel-ip-city
 * - x-vercel-ip-region (state code, e.g., "MA")
 * - x-vercel-ip-country (ISO 3166-1 alpha-2, e.g., "US")
 *
 * Returns: { postalCode, city, region, country, available }
 * `available` is true if at least postalCode or city is populated.
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const postalCode = request.headers.get("x-vercel-ip-postal-code") || null;
  const city = request.headers.get("x-vercel-ip-city") || null;
  const region = request.headers.get("x-vercel-ip-region") || null;
  const country = request.headers.get("x-vercel-ip-country") || null;

  return NextResponse.json({
    postalCode,
    city,
    region,
    country,
    available: !!(postalCode || city),
  });
}
