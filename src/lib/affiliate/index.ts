/**
 * Affiliate link infrastructure.
 *
 * Centralizes affiliate URL generation, click logging, and partner configuration.
 * All affiliate links route through /api/affiliate/[partner]/redirect for tracking.
 */

// ─── Partner Configuration ──────────────────────────────────────

export type AffiliatePartner = "amazon" | "audible" | "zocdoc" | "goodrx" | "1800flowers" | "doordash" | "etsy";

interface PartnerConfig {
  name: string;
  tag: string;
  baseUrl: string;
  /** Whether this partner is currently active (has env var or default tag) */
  active: boolean;
}

const PARTNER_CONFIGS: Record<AffiliatePartner, () => PartnerConfig> = {
  amazon: () => ({
    name: "Amazon",
    tag: process.env.AMAZON_PARTNER_TAG || "kinloop-20",
    baseUrl: "https://www.amazon.com",
    active: true, // Always active — uses default tag
  }),
  audible: () => ({
    name: "Audible",
    tag: process.env.AMAZON_PARTNER_TAG || "kinloop-20",
    baseUrl: "https://www.amazon.com", // Routes through Amazon's Audible storefront
    active: true, // Always active — uses Amazon Associates tag
  }),
  zocdoc: () => ({
    name: "Zocdoc",
    tag: process.env.ZOCDOC_PARTNER_ID || "",
    baseUrl: "https://www.zocdoc.com",
    active: !!process.env.ZOCDOC_PARTNER_ID,
  }),
  goodrx: () => ({
    name: "GoodRx",
    tag: process.env.GOODRX_PARTNER_ID || "",
    baseUrl: "https://www.goodrx.com",
    active: !!process.env.GOODRX_PARTNER_ID,
  }),
  "1800flowers": () => ({
    name: "1-800-Flowers",
    tag: process.env["1800FLOWERS_PARTNER_ID"] || "",
    baseUrl: "https://www.1800flowers.com",
    active: !!process.env["1800FLOWERS_PARTNER_ID"],
  }),
  doordash: () => ({
    name: "DoorDash",
    tag: process.env.DOORDASH_PARTNER_ID || "",
    baseUrl: "https://www.doordash.com",
    active: !!process.env.DOORDASH_PARTNER_ID,
  }),
  etsy: () => ({
    name: "Etsy",
    tag: process.env.ETSY_PARTNER_ID || "",
    baseUrl: "https://www.etsy.com",
    active: !!process.env.ETSY_PARTNER_ID,
  }),
};

export function getPartnerConfig(partner: AffiliatePartner): PartnerConfig {
  return PARTNER_CONFIGS[partner]();
}

export function isPartnerActive(partner: AffiliatePartner): boolean {
  return getPartnerConfig(partner).active;
}

// ─── URL Generation ─────────────────────────────────────────────

/**
 * Generate an affiliate search URL for a given partner.
 * Returns the direct affiliate URL (not the redirect route).
 */
export function generateAffiliateUrl(
  partner: AffiliatePartner,
  query: string,
): string {
  const config = getPartnerConfig(partner);
  const tag = config.tag;
  const encoded = encodeURIComponent(query.trim());

  switch (partner) {
    case "amazon":
      return `https://www.amazon.com/s?k=${encoded}&tag=${tag}`;
    case "audible":
      // Route through Amazon's Audible storefront (i=audible) so Amazon Associates tag works
      return `https://www.amazon.com/s?k=${encoded}+audiobook&i=audible&tag=${tag}`;
    default:
      return `${config.baseUrl}/search?q=${encoded}`;
  }
}

/**
 * Build the tracked redirect URL that goes through our /api/affiliate/[partner]/redirect endpoint.
 * This logs the click before redirecting to the actual affiliate URL.
 *
 * @param partner - The affiliate partner
 * @param targetUrl - The final affiliate URL to redirect to
 * @param context - Optional context for logging (e.g., { source: "coach_tip", tipId: "abc" })
 */
export function buildTrackedUrl(
  partner: AffiliatePartner,
  targetUrl: string,
  context?: Record<string, string>,
): string {
  const params = new URLSearchParams({ url: targetUrl });
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      params.set(`ctx_${key}`, value);
    });
  }
  return `/api/affiliate/${partner}/redirect?${params.toString()}`;
}

// ─── Click Logging ──────────────────────────────────────────────

export interface AffiliateClickEvent {
  partner: AffiliatePartner;
  targetUrl: string;
  source: string; // e.g., "coach_tip", "play_lab_material", "scheduler_action"
  userId?: string;
  childId?: string;
  metadata?: Record<string, string>;
  timestamp: string;
}

/**
 * Log an affiliate click event.
 * Currently logs to console in structured format for Vercel log search.
 * Future: write to affiliate_clicks table for the admin dashboard.
 */
export function logAffiliateClick(event: AffiliateClickEvent): void {
  console.log(
    JSON.stringify({
      type: "affiliate_click",
      partner: event.partner,
      target_url: event.targetUrl,
      source: event.source,
      user_id: event.userId || "anonymous",
      child_id: event.childId || null,
      metadata: event.metadata || {},
      timestamp: event.timestamp,
    }),
  );
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Extract the book title from a source string like "No-Drama Discipline by Daniel J. Siegel & Tina Payne Bryson".
 * Returns the part before " by " if present, otherwise the full source.
 */
export function extractBookTitle(source: string): string {
  const byIndex = source.indexOf(" by ");
  return byIndex > 0 ? source.substring(0, byIndex) : source;
}

/**
 * Check if a tip source is a book (contains " by ") vs an institutional source.
 */
export function isBookSource(source: string): boolean {
  return source.includes(" by ");
}
