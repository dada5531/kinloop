/**
 * Three-Layer Location Resolution for Zocdoc Deep Links
 *
 * Priority order:
 * 1. user_settings.zip_code (explicit user input, highest trust)
 * 2. Vercel edge geolocation (x-vercel-ip-postal-code, zero permission prompt)
 * 3. Hardcoded fallback: 02138 (Cambridge MA — matches HBS context)
 *
 * This pattern is reusable for any future affiliate integration that needs
 * location awareness (DoorDash, Etsy local, etc.).
 */

// ─── Location Resolution ───────────────────────────────────────

export type LocationSource = "settings" | "geo" | "fallback";

export interface ResolvedLocation {
  /** The ZIP code or city string to use in the URL */
  address: string;
  /** Which layer provided the value */
  source: LocationSource;
}

const FALLBACK_ZIP = "02138"; // Cambridge, MA

/**
 * Resolve the best available location for affiliate deep links.
 *
 * @param settingsZip - ZIP code from user_settings (layer 1)
 * @param geoPostalCode - ZIP from Vercel edge headers (layer 2)
 * @param geoCity - City from Vercel edge headers (layer 2 fallback)
 * @returns The resolved address and which source it came from
 */
export function resolveLocation(
  settingsZip: string | null | undefined,
  geoPostalCode: string | null | undefined,
  geoCity: string | null | undefined,
): ResolvedLocation {
  // Layer 1: User settings (highest trust)
  if (settingsZip && settingsZip.trim().length >= 3) {
    return { address: settingsZip.trim(), source: "settings" };
  }

  // Layer 2: Vercel edge geolocation
  if (geoPostalCode && geoPostalCode.trim().length >= 3) {
    return { address: geoPostalCode.trim(), source: "geo" };
  }
  if (geoCity && geoCity.trim().length >= 2) {
    return { address: geoCity.trim(), source: "geo" };
  }

  // Layer 3: Hardcoded fallback
  return { address: FALLBACK_ZIP, source: "fallback" };
}

// ─── Insurance Slug Mapping ────────────────────────────────────

/**
 * Maps the UI label (stored in user_settings.insurance_provider) to
 * Zocdoc's actual carrier slug used in their search URL filter.
 *
 * Slugs verified by inspecting Zocdoc's own filter URLs (April 2026).
 * If a slug is wrong, Zocdoc shows "no results" — better to omit.
 */
const INSURANCE_SLUG_MAP: Record<string, string> = {
  Aetna: "aetna",
  Anthem: "anthem-blue-cross-blue-shield",
  BlueCross: "blue-cross-blue-shield",
  Cigna: "cigna",
  Kaiser: "kaiser-permanente",
  UnitedHealthcare: "united-healthcare",
};

/**
 * Values that should NOT produce an insurance_carrier param.
 * Wrong-insurance filter produces worse results than no filter.
 */
const SKIP_VALUES = new Set(["Other", "Skip", "", "other", "skip"]);

/**
 * Resolve the insurance carrier slug for Zocdoc URL.
 * Returns null if the value should be omitted (unknown, Skip, Other, blank).
 */
export function resolveInsuranceSlug(
  insuranceProvider: string | null | undefined,
): string | null {
  if (!insuranceProvider || SKIP_VALUES.has(insuranceProvider)) {
    return null;
  }
  return INSURANCE_SLUG_MAP[insuranceProvider] || null;
}

// ─── Zocdoc URL Builder (Smart) ────────────────────────────────

export interface SmartZocdocParams {
  /** ZIP from user settings */
  settingsZip: string | null | undefined;
  /** Insurance from user settings */
  settingsInsurance: string | null | undefined;
  /** Postal code from Vercel geo headers */
  geoPostalCode: string | null | undefined;
  /** City from Vercel geo headers */
  geoCity: string | null | undefined;
  /** Specialty (default: "pediatrician") */
  specialty?: string;
}

export interface SmartZocdocResult {
  /** The full Zocdoc search URL */
  url: string;
  /** Which layer provided the location */
  locationSource: LocationSource;
  /** Whether user has a saved ZIP (for UI hint logic) */
  hasSettingsZip: boolean;
}

/**
 * Build a smart Zocdoc search URL using three-layer location resolution.
 *
 * URL format: https://www.zocdoc.com/search?dr_specialty=pediatrician&address={ZIP}&insurance_carrier={SLUG}
 *
 * - address is always included (from one of the three layers)
 * - insurance_carrier is only included if user has a valid saved provider
 * - utm_source=kinloop is added for attribution
 */
export function buildSmartZocdocUrl(params: SmartZocdocParams): SmartZocdocResult {
  const { settingsZip, settingsInsurance, geoPostalCode, geoCity, specialty = "pediatrician" } = params;

  // Resolve location
  const location = resolveLocation(settingsZip, geoPostalCode, geoCity);

  // Build URL
  const url = new URL("https://www.zocdoc.com/search");
  url.searchParams.set("dr_specialty", specialty);
  url.searchParams.set("address", location.address);

  // Only add insurance if it maps to a valid slug
  const insuranceSlug = resolveInsuranceSlug(settingsInsurance);
  if (insuranceSlug) {
    url.searchParams.set("insurance_carrier", insuranceSlug);
  }

  // Attribution
  url.searchParams.set("utm_source", "kinloop");

  return {
    url: url.toString(),
    locationSource: location.source,
    hasSettingsZip: !!(settingsZip && settingsZip.trim().length >= 3),
  };
}
