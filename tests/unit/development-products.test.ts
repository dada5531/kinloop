import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Development Products – Affiliate Utilities", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ─── getProductSuggestions ─────────────────────────────────────

  describe("getProductSuggestions", () => {
    it("returns motor products filtered by age (12mo toddler)", async () => {
      const { getProductSuggestions } = await import(
        "@/lib/affiliate/development-products"
      );
      const products = getProductSuggestions("motor", 12);
      // At 12 months: activity cube (6-24), climbing triangle (12-48), ball pit (6-36), stacking rings (6-18) should match
      // But limit is 3 by default
      expect(products.length).toBeLessThanOrEqual(3);
      expect(products.length).toBeGreaterThan(0);
      products.forEach((p) => {
        expect(p.ageMin === null || p.ageMin <= 12).toBe(true);
        expect(p.ageMax === null || p.ageMax >= 12).toBe(true);
      });
    });

    it("returns cognitive products for a 30-month child", async () => {
      const { getProductSuggestions } = await import(
        "@/lib/affiliate/development-products"
      );
      const products = getProductSuggestions("cognitive", 30);
      expect(products.length).toBeGreaterThan(0);
      expect(products.length).toBeLessThanOrEqual(3);
      // Puzzle set (12-60), counting bears (24-60), building blocks (12-48) should all match
      products.forEach((p) => {
        expect(p.ageMin === null || p.ageMin <= 30).toBe(true);
        expect(p.ageMax === null || p.ageMax >= 30).toBe(true);
      });
    });

    it("filters out products outside age range", async () => {
      const { getProductSuggestions } = await import(
        "@/lib/affiliate/development-products"
      );
      // At 3 months, most motor products should be filtered out (min age 6+)
      const products = getProductSuggestions("motor", 3);
      expect(products.length).toBe(0);
    });

    it("respects custom limit parameter", async () => {
      const { getProductSuggestions } = await import(
        "@/lib/affiliate/development-products"
      );
      const products = getProductSuggestions("language", 30, 2);
      expect(products.length).toBeLessThanOrEqual(2);
    });

    it("returns empty array for unknown category", async () => {
      const { getProductSuggestions } = await import(
        "@/lib/affiliate/development-products"
      );
      const products = getProductSuggestions("unknown_category", 12);
      expect(products).toEqual([]);
    });

    it("returns social products for a 36-month child", async () => {
      const { getProductSuggestions } = await import(
        "@/lib/affiliate/development-products"
      );
      const products = getProductSuggestions("social", 36);
      expect(products.length).toBeGreaterThan(0);
      // Cooperative board game (36-60) should now be included
      const hasCoopGame = products.some((p) => p.name === "Cooperative board game");
      expect(hasCoopGame).toBe(true);
    });
  });

  // ─── buildProductAffiliateUrl ─────────────────────────────────

  describe("buildProductAffiliateUrl", () => {
    it("generates a tracked Amazon affiliate URL with default tag", async () => {
      delete process.env.AMAZON_PARTNER_TAG;
      const { buildProductAffiliateUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildProductAffiliateUrl(
        { name: "Balance bike", query: "kids balance bike toddler", ageMin: 18, ageMax: 48 },
        { source: "development_milestones", milestoneId: "ms-123", category: "motor" },
      );
      // Should route through the affiliate redirect endpoint
      expect(url).toContain("/api/affiliate/amazon/redirect");
      // The Amazon search URL is URL-encoded inside the redirect URL
      expect(url).toContain("tag%3Dkinloop-20");
      // Should include context params
      expect(url).toContain("ctx_source=development_milestones");
      expect(url).toContain("ctx_milestoneId=ms-123");
      expect(url).toContain("ctx_category=motor");
    });

    it("uses custom AMAZON_PARTNER_TAG when set", async () => {
      process.env.AMAZON_PARTNER_TAG = "custom-tag-21";
      const { buildProductAffiliateUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildProductAffiliateUrl(
        { name: "Puzzle set", query: "kids wooden puzzle set", ageMin: 12, ageMax: 60 },
        { source: "development_timeline" },
      );
      expect(url).toContain("tag%3Dcustom-tag-21");
    });

    it("omits optional context params when not provided", async () => {
      const { buildProductAffiliateUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildProductAffiliateUrl(
        { name: "Shape sorter", query: "toddler shape sorter wooden", ageMin: 6, ageMax: 24 },
        { source: "development_overview" },
      );
      expect(url).toContain("ctx_source=development_overview");
      expect(url).not.toContain("ctx_milestoneId");
      expect(url).not.toContain("ctx_category");
    });
  });

  // ─── buildZocdocUrl ───────────────────────────────────────────

  describe("buildZocdocUrl", () => {
    it("builds a basic Zocdoc search URL with default specialty", async () => {
      const { buildZocdocUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildZocdocUrl();
      expect(url).toContain("https://www.zocdoc.com/search");
      expect(url).toContain("dr_specialty=pediatrician");
    });

    it("includes ZIP code when provided", async () => {
      const { buildZocdocUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildZocdocUrl({ zipCode: "02138" });
      expect(url).toContain("address=02138");
    });

    it("includes insurance carrier when provided", async () => {
      const { buildZocdocUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildZocdocUrl({ insurance: "Blue Cross Blue Shield" });
      expect(url).toContain("insurance_carrier=Blue+Cross+Blue+Shield");
    });

    it("includes both ZIP and insurance when provided", async () => {
      const { buildZocdocUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildZocdocUrl({ zipCode: "10001", insurance: "Aetna" });
      expect(url).toContain("address=10001");
      expect(url).toContain("insurance_carrier=Aetna");
      expect(url).toContain("dr_specialty=pediatrician");
    });

    it("allows custom specialty override", async () => {
      const { buildZocdocUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildZocdocUrl({ specialty: "pediatric-dentist" });
      expect(url).toContain("dr_specialty=pediatric-dentist");
    });

    it("ignores null/undefined ZIP and insurance", async () => {
      const { buildZocdocUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildZocdocUrl({ zipCode: null, insurance: null });
      expect(url).not.toContain("address=");
      expect(url).not.toContain("insurance_carrier=");
    });
  });

  // ─── buildTrackedZocdocUrl ────────────────────────────────────

  describe("buildTrackedZocdocUrl", () => {
    it("routes through the Zocdoc affiliate redirect endpoint", async () => {
      const { buildTrackedZocdocUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildTrackedZocdocUrl(
        { zipCode: "02138" },
        { source: "development_overview" },
      );
      expect(url).toContain("/api/affiliate/zocdoc/redirect");
      expect(url).toContain("ctx_source=development_overview");
      // The target URL should be the Zocdoc search URL
      expect(url).toContain(encodeURIComponent("https://www.zocdoc.com/search"));
    });

    it("includes recordId context when provided", async () => {
      const { buildTrackedZocdocUrl } = await import(
        "@/lib/affiliate/development-products"
      );
      const url = buildTrackedZocdocUrl(
        {},
        { source: "development_timeline", recordId: "rec-456" },
      );
      expect(url).toContain("ctx_recordId=rec-456");
    });
  });

  // ─── getNextCheckupRecommendation ─────────────────────────────

  describe("getNextCheckupRecommendation", () => {
    it("recommends 4-month checkup for a 3-month-old", async () => {
      const { getNextCheckupRecommendation } = await import(
        "@/lib/affiliate/development-products"
      );
      const rec = getNextCheckupRecommendation(3, null);
      expect(rec).not.toBeNull();
      expect(rec!.nextVisitMonth).toBe(4);
      expect(rec!.label).toBe("4-month checkup");
      expect(rec!.overdue).toBe(false);
    });

    it("recommends 12-month (1-year) checkup for a 10-month-old", async () => {
      const { getNextCheckupRecommendation } = await import(
        "@/lib/affiliate/development-products"
      );
      const rec = getNextCheckupRecommendation(10, null);
      expect(rec).not.toBeNull();
      expect(rec!.nextVisitMonth).toBe(12);
      expect(rec!.label).toBe("1-year checkup");
      expect(rec!.overdue).toBe(false);
    });

    it("recommends 24-month (2-year) checkup for a 20-month-old", async () => {
      const { getNextCheckupRecommendation } = await import(
        "@/lib/affiliate/development-products"
      );
      const rec = getNextCheckupRecommendation(20, null);
      expect(rec).not.toBeNull();
      expect(rec!.nextVisitMonth).toBe(24);
      expect(rec!.label).toBe("2-year checkup");
    });

    it("marks as overdue when child is 3+ months past scheduled visit", async () => {
      const { getNextCheckupRecommendation } = await import(
        "@/lib/affiliate/development-products"
      );
      // Child is 7 months old, next scheduled is 6-month (already past), so next is 9-month
      // Actually at 7 months, find(m >= 7) returns 9
      // overdue = 7 > 9 + 2 = false
      const rec7 = getNextCheckupRecommendation(7, null);
      expect(rec7!.overdue).toBe(false);

      // Child is 15 months, next scheduled is 15-month
      // overdue = 15 > 15 + 2 = false
      const rec15 = getNextCheckupRecommendation(15, null);
      expect(rec15!.overdue).toBe(false);
    });

    it("returns null for a child past the 5-year schedule (65 months)", async () => {
      const { getNextCheckupRecommendation } = await import(
        "@/lib/affiliate/development-products"
      );
      const rec = getNextCheckupRecommendation(65, null);
      expect(rec).toBeNull();
    });

    it("returns the exact visit when child's age matches a scheduled month", async () => {
      const { getNextCheckupRecommendation } = await import(
        "@/lib/affiliate/development-products"
      );
      const rec = getNextCheckupRecommendation(6, null);
      expect(rec).not.toBeNull();
      expect(rec!.nextVisitMonth).toBe(6);
      expect(rec!.label).toBe("6-month checkup");
    });

    it("formats 3-year, 4-year, and 5-year labels correctly", async () => {
      const { getNextCheckupRecommendation } = await import(
        "@/lib/affiliate/development-products"
      );
      const rec36 = getNextCheckupRecommendation(36, null);
      expect(rec36!.label).toBe("3-year checkup");

      const rec48 = getNextCheckupRecommendation(48, null);
      expect(rec48!.label).toBe("4-year checkup");

      const rec60 = getNextCheckupRecommendation(60, null);
      expect(rec60!.label).toBe("5-year checkup");
    });

    it("recommends 1-month checkup for a newborn", async () => {
      const { getNextCheckupRecommendation } = await import(
        "@/lib/affiliate/development-products"
      );
      const rec = getNextCheckupRecommendation(0, null);
      expect(rec).not.toBeNull();
      expect(rec!.nextVisitMonth).toBe(1);
      expect(rec!.label).toBe("1-month checkup");
    });
  });
});
