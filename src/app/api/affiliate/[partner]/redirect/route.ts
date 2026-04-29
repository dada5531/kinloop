/**
 * Affiliate redirect endpoint.
 *
 * GET /api/affiliate/[partner]/redirect?url=<target>&ctx_source=<source>&ctx_tipId=<id>
 *
 * 1. Validates the partner and target URL.
 * 2. Logs the click event with structured JSON for Vercel log search.
 * 3. Returns a 302 redirect to the target affiliate URL.
 *
 * Security: Only redirects to whitelisted domains per partner.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  type AffiliatePartner,
  getPartnerConfig,
  logAffiliateClick,
} from "@/lib/affiliate";

const ALLOWED_DOMAINS: Record<AffiliatePartner, string[]> = {
  amazon: ["www.amazon.com", "amazon.com"],
  audible: ["www.audible.com", "audible.com"],
  zocdoc: ["www.zocdoc.com", "zocdoc.com"],
  goodrx: ["www.goodrx.com", "goodrx.com"],
  "1800flowers": ["www.1800flowers.com", "1800flowers.com"],
  doordash: ["www.doordash.com", "doordash.com"],
  etsy: ["www.etsy.com", "etsy.com"],
};

const VALID_PARTNERS = new Set<string>(Object.keys(ALLOWED_DOMAINS));

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partner: string }> },
) {
  const { partner: partnerParam } = await params;

  // Validate partner
  if (!VALID_PARTNERS.has(partnerParam)) {
    return NextResponse.json(
      { error: `Unknown affiliate partner: ${partnerParam}` },
      { status: 400 },
    );
  }

  const partner = partnerParam as AffiliatePartner;
  const targetUrl = request.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json(
      { error: "Missing required 'url' parameter" },
      { status: 400 },
    );
  }

  // Validate target URL domain against whitelist
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json(
      { error: "Invalid target URL" },
      { status: 400 },
    );
  }

  const allowedDomains = ALLOWED_DOMAINS[partner] || [];
  if (!allowedDomains.includes(parsedUrl.hostname)) {
    return NextResponse.json(
      {
        error: `Target domain '${parsedUrl.hostname}' not allowed for partner '${partner}'`,
      },
      { status: 403 },
    );
  }

  // Extract context params (prefixed with ctx_)
  const metadata: Record<string, string> = {};
  let source = "unknown";
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key.startsWith("ctx_")) {
      const metaKey = key.slice(4);
      if (metaKey === "source") {
        source = value;
      } else {
        metadata[metaKey] = value;
      }
    }
  });

  // Log the click
  logAffiliateClick({
    partner,
    targetUrl,
    source,
    metadata,
    timestamp: new Date().toISOString(),
  });

  // 302 redirect to the affiliate URL
  return NextResponse.redirect(targetUrl, 302);
}
