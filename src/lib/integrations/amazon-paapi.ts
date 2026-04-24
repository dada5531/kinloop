/**
 * Amazon Product Advertising API (PA-API) integration.
 *
 * Purpose: Look up materials from Play Lab activities with affiliate links.
 * Auth: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG
 * Rate limits: 1 request/second (initial), scales with revenue
 * Fallback: Generate Amazon search URLs (no API needed) as default.
 *
 * TODO: Implement in V2.
 * See GitHub Issue #9.
 */

/**
 * Generate a simple Amazon search URL (no API key needed).
 * Used as the V1 fallback before PA-API is configured.
 */
export function generateAmazonSearchUrl(query: string, partnerTag?: string): string {
  const tag = partnerTag || process.env.AMAZON_PARTNER_TAG || "kinloop-20";
  const encodedQuery = encodeURIComponent(query);
  return `https://www.amazon.com/s?k=${encodedQuery}&tag=${tag}`;
}

export async function searchProducts(params: {
  keywords: string;
  category?: string;
  maxResults?: number;
}) {
  // TODO: Implement with PA-API v5
  throw new Error("Not implemented — see GitHub Issue #9");
}
