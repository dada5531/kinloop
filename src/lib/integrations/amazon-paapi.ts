/**
 * Amazon Product Advertising API (PA-API) integration.
 *
 * V1 (current): Search-link fallback — generates Amazon search URLs with affiliate tag.
 * V2 (future):  PA-API v5 — real product search, pricing, images, ASIN lookup.
 *
 * PA-API activates ONLY when all three env vars are present:
 *   AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG
 *
 * Rate limits (PA-API): 1 request/second (initial), scales with revenue.
 */

// ─── Configuration ──────────────────────────────────────────────

const DEFAULT_PARTNER_TAG = "kinloop-20";

export function getPartnerTag(): string {
  return process.env.AMAZON_PARTNER_TAG || DEFAULT_PARTNER_TAG;
}

export function isPaApiConfigured(): boolean {
  return !!(
    process.env.AMAZON_ACCESS_KEY &&
    process.env.AMAZON_SECRET_KEY &&
    process.env.AMAZON_PARTNER_TAG
  );
}

// ─── V1: Search-link Fallback (Primary) ─────────────────────────

/**
 * Generate an Amazon search URL for a single material.
 * Always works — no API key needed.
 */
export function generateAmazonSearchUrl(query: string, partnerTag?: string): string {
  const tag = partnerTag || getPartnerTag();
  const encodedQuery = encodeURIComponent(query.trim());
  return `https://www.amazon.com/s?k=${encodedQuery}&tag=${tag}`;
}

/**
 * Generate an Amazon search URL for multiple materials combined.
 * Useful for a "Shop all materials" button.
 */
export function generateAmazonBundleUrl(
  materials: Array<{ name: string; required: boolean }>,
  activityTitle?: string,
  partnerTag?: string,
): string {
  const tag = partnerTag || getPartnerTag();

  // Build a search query from required materials (or all if few)
  const requiredMaterials = materials.filter((m) => m.required);
  const materialsToUse = requiredMaterials.length >= 2 ? requiredMaterials : materials;

  // Take up to 5 material names for the search query
  const materialNames = materialsToUse.slice(0, 5).map((m) => m.name);

  // If we have an activity context, add a keyword
  const contextKeyword = activityTitle ? "kids activity" : "";
  const query = [...materialNames, contextKeyword].filter(Boolean).join(" ");

  const encodedQuery = encodeURIComponent(query.trim());
  return `https://www.amazon.com/s?k=${encodedQuery}&tag=${tag}`;
}

/**
 * Enrich a list of materials with Amazon search URLs.
 * V1: Uses search-link fallback for all materials.
 * V2: Will use PA-API for real product data when configured.
 */
export async function enrichMaterialsWithAmazon(
  materials: Array<{ name: string; quantity: string | null; required: boolean }>,
  _activityTitle?: string,
): Promise<
  Array<{
    name: string;
    quantity: string | null;
    required: boolean;
    amazonUrl: string;
    estimatedPrice: number | null;
    productTitle: string | null;
    imageUrl: string | null;
  }>
> {
  if (isPaApiConfigured()) {
    // V2: PA-API path — placeholder for future implementation
    return paApiSearchProducts(materials);
  }

  // V1: Search-link fallback — always available
  return materials.map((mat) => ({
    name: mat.name,
    quantity: mat.quantity,
    required: mat.required,
    amazonUrl: generateAmazonSearchUrl(mat.name),
    estimatedPrice: null,
    productTitle: null,
    imageUrl: null,
  }));
}

// ─── V2: PA-API v5 Placeholder ──────────────────────────────────

/**
 * PA-API v5 product search — PLACEHOLDER.
 * Activates when AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG are set.
 *
 * Implementation notes for V2:
 * - Uses AWS Signature v4 for request signing
 * - Endpoint: webservices.amazon.com/paapi5/searchitems
 * - Returns: ASIN, title, price, image URL, detail page URL
 * - Rate limit: 1 req/sec initially, scales with revenue
 */
async function paApiSearchProducts(
  materials: Array<{ name: string; quantity: string | null; required: boolean }>,
): Promise<
  Array<{
    name: string;
    quantity: string | null;
    required: boolean;
    amazonUrl: string;
    estimatedPrice: number | null;
    productTitle: string | null;
    imageUrl: string | null;
  }>
> {
  // TODO: Implement PA-API v5 SearchItems call
  // For now, fall back to search links even when PA-API is configured
  console.warn("[Amazon PA-API] PA-API configured but not yet implemented — using search-link fallback");
  return materials.map((mat) => ({
    name: mat.name,
    quantity: mat.quantity,
    required: mat.required,
    amazonUrl: generateAmazonSearchUrl(mat.name),
    estimatedPrice: null,
    productTitle: null,
    imageUrl: null,
  }));
}

/**
 * PA-API v5 item lookup by ASIN — PLACEHOLDER.
 */
export async function lookupByAsin(
  _asin: string,
): Promise<{
  title: string;
  price: number | null;
  imageUrl: string | null;
  detailPageUrl: string;
} | null> {
  if (!isPaApiConfigured()) {
    return null;
  }

  // TODO: Implement PA-API v5 GetItems call
  console.warn("[Amazon PA-API] lookupByAsin not yet implemented");
  return null;
}
