/**
 * Development page affiliate product mapping.
 *
 * Maps milestone categories to contextually relevant Amazon product suggestions.
 * Also provides Zocdoc deep-link generation for scheduling pediatric checkups.
 *
 * All Amazon links route through /api/affiliate/amazon/redirect for tracking.
 * Zocdoc links route through /api/affiliate/zocdoc/redirect.
 */

import { generateAffiliateUrl, buildTrackedUrl } from "./index";

// ─── Milestone → Product Mapping ────────────────────────────────

export interface ProductSuggestion {
  /** Display name shown to user */
  name: string;
  /** Amazon search query */
  query: string;
  /** Age range in months (inclusive). null = any age */
  ageMin: number | null;
  ageMax: number | null;
}

/**
 * Static mapping of milestone categories to suggested products.
 * Products are ordered by relevance. The UI shows up to 3 per milestone.
 */
const CATEGORY_PRODUCTS: Record<string, ProductSuggestion[]> = {
  motor: [
    { name: "Balance bike", query: "kids balance bike toddler", ageMin: 18, ageMax: 48 },
    { name: "Safety scissors", query: "kids safety scissors preschool", ageMin: 24, ageMax: 60 },
    { name: "Activity cube", query: "toddler activity cube wooden", ageMin: 6, ageMax: 24 },
    { name: "Climbing triangle", query: "pikler triangle climbing toddler", ageMin: 12, ageMax: 48 },
    { name: "Play-Doh set", query: "Play-Doh kids activity set", ageMin: 24, ageMax: 60 },
    { name: "Tricycle", query: "kids tricycle toddler", ageMin: 24, ageMax: 48 },
    { name: "Ball pit", query: "toddler ball pit with balls", ageMin: 6, ageMax: 36 },
    { name: "Stacking rings", query: "baby stacking rings toy", ageMin: 6, ageMax: 18 },
  ],
  cognitive: [
    { name: "Shape sorter", query: "toddler shape sorter wooden", ageMin: 6, ageMax: 24 },
    { name: "Puzzle set", query: "kids wooden puzzle set age appropriate", ageMin: 12, ageMax: 60 },
    { name: "Counting bears", query: "counting bears math manipulatives kids", ageMin: 24, ageMax: 60 },
    { name: "Building blocks", query: "kids building blocks educational", ageMin: 12, ageMax: 48 },
    { name: "Memory game", query: "kids memory matching game", ageMin: 24, ageMax: 60 },
    { name: "STEM activity kit", query: "STEM activity kit preschool", ageMin: 36, ageMax: 60 },
    { name: "Magnetic tiles", query: "magnetic tiles building set kids", ageMin: 24, ageMax: 60 },
    { name: "Number flashcards", query: "toddler number flashcards", ageMin: 18, ageMax: 48 },
  ],
  language: [
    { name: "First words book", query: "baby first words board book", ageMin: 6, ageMax: 24 },
    { name: "Phonics set", query: "kids phonics learning set", ageMin: 24, ageMax: 60 },
    { name: "Story time books", query: "toddler story books set age appropriate", ageMin: 12, ageMax: 48 },
    { name: "Alphabet puzzle", query: "wooden alphabet puzzle toddler", ageMin: 18, ageMax: 48 },
    { name: "Finger puppets", query: "finger puppets storytelling kids", ageMin: 12, ageMax: 48 },
    { name: "Speech flashcards", query: "speech therapy flashcards toddler", ageMin: 18, ageMax: 48 },
    { name: "Rhyming games", query: "kids rhyming word games", ageMin: 36, ageMax: 60 },
    { name: "Picture dictionary", query: "kids picture dictionary first words", ageMin: 24, ageMax: 60 },
  ],
  social: [
    { name: "Cooperative board game", query: "cooperative board game kids preschool", ageMin: 36, ageMax: 60 },
    { name: "Emotion cards", query: "kids emotion flashcards feelings", ageMin: 18, ageMax: 48 },
    { name: "Pretend play kitchen", query: "kids pretend play kitchen set", ageMin: 18, ageMax: 48 },
    { name: "Doctor kit", query: "kids doctor kit pretend play", ageMin: 24, ageMax: 60 },
    { name: "Sharing games", query: "toddler sharing turn taking game", ageMin: 24, ageMax: 48 },
    { name: "Dollhouse", query: "kids dollhouse family play set", ageMin: 24, ageMax: 60 },
    { name: "Tea party set", query: "kids tea party set pretend play", ageMin: 24, ageMax: 48 },
    { name: "Puppet theater", query: "kids puppet theater hand puppets", ageMin: 24, ageMax: 60 },
  ],
};

/**
 * Get product suggestions for a milestone category, filtered by child's age.
 * Returns up to `limit` products (default 3).
 */
export function getProductSuggestions(
  category: string,
  ageMonths: number,
  limit = 3,
): ProductSuggestion[] {
  const products = CATEGORY_PRODUCTS[category] || [];
  return products
    .filter((p) => {
      if (p.ageMin !== null && ageMonths < p.ageMin) return false;
      if (p.ageMax !== null && ageMonths > p.ageMax) return false;
      return true;
    })
    .slice(0, limit);
}

/**
 * Build a tracked Amazon affiliate URL for a product suggestion.
 */
export function buildProductAffiliateUrl(
  product: ProductSuggestion,
  context: { source: string; milestoneId?: string; category?: string },
): string {
  const amazonUrl = generateAffiliateUrl("amazon", product.query);
  return buildTrackedUrl("amazon", amazonUrl, {
    source: context.source,
    ...(context.milestoneId ? { milestoneId: context.milestoneId } : {}),
    ...(context.category ? { category: context.category } : {}),
  });
}

// ─── Zocdoc Deep Link ───────────────────────────────────────────

export interface ZocdocParams {
  /** User's ZIP code from settings */
  zipCode?: string | null;
  /** User's insurance provider from settings */
  insurance?: string | null;
  /** Specialty to search (default: "pediatrician") */
  specialty?: string;
}

/**
 * Build a Zocdoc search URL for booking a pediatric checkup.
 * Pre-fills ZIP and insurance if available from user settings.
 */
export function buildZocdocUrl(params: ZocdocParams = {}): string {
  const { zipCode, insurance, specialty = "pediatrician" } = params;
  const url = new URL("https://www.zocdoc.com/search");
  url.searchParams.set("dr_specialty", specialty);
  if (zipCode) url.searchParams.set("address", zipCode);
  if (insurance) url.searchParams.set("insurance_carrier", insurance);
  return url.toString();
}

/**
 * Build a tracked Zocdoc affiliate URL that routes through our redirect endpoint.
 */
export function buildTrackedZocdocUrl(
  params: ZocdocParams = {},
  context: { source: string; recordId?: string },
): string {
  const zocdocUrl = buildZocdocUrl(params);
  return buildTrackedUrl("zocdoc", zocdocUrl, {
    source: context.source,
    ...(context.recordId ? { recordId: context.recordId } : {}),
  });
}

// ─── Next Checkup Recommendation ────────────────────────────────

/**
 * AAP well-child visit schedule (months).
 * Source: https://www.aap.org/en/practice-management/care-delivery-approaches/periodicity-schedule/
 */
const WELL_CHILD_SCHEDULE_MONTHS = [1, 2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60];

/**
 * Determine the next recommended well-child visit based on the child's age
 * and their last recorded visit date.
 *
 * Returns null if the child is past the 5-year schedule.
 */
export function getNextCheckupRecommendation(
  ageMonths: number,
  lastVisitDate: string | null,
): { nextVisitMonth: number; label: string; overdue: boolean } | null {
  // Find the next scheduled visit at or after the child's current age
  const nextVisit = WELL_CHILD_SCHEDULE_MONTHS.find((m) => m >= ageMonths);
  if (!nextVisit) return null;

  // Determine if overdue: if the child's age is past the scheduled month by 2+ months
  const overdue = ageMonths > nextVisit + 2;

  // Format the label
  let label: string;
  if (nextVisit < 12) {
    label = `${nextVisit}-month checkup`;
  } else if (nextVisit === 12) {
    label = "1-year checkup";
  } else if (nextVisit < 24) {
    label = `${nextVisit}-month checkup`;
  } else if (nextVisit === 24) {
    label = "2-year checkup";
  } else if (nextVisit === 36) {
    label = "3-year checkup";
  } else if (nextVisit === 48) {
    label = "4-year checkup";
  } else {
    label = "5-year checkup";
  }

  return { nextVisitMonth: nextVisit, label, overdue };
}
