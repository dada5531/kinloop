import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to test the module with different env var states,
// so we use dynamic imports and reset modules between tests.

describe("Amazon PA-API Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("generateAmazonSearchUrl", () => {
    it("generates a valid Amazon search URL with default partner tag", async () => {
      delete process.env.AMAZON_PARTNER_TAG;
      const { generateAmazonSearchUrl } = await import(
        "@/lib/integrations/amazon-paapi"
      );

      const url = generateAmazonSearchUrl("baking soda");
      expect(url).toBe(
        "https://www.amazon.com/s?k=baking%20soda&tag=kinloop-20"
      );
    });

    it("uses custom partner tag from env var", async () => {
      process.env.AMAZON_PARTNER_TAG = "custom-tag-21";
      const { generateAmazonSearchUrl } = await import(
        "@/lib/integrations/amazon-paapi"
      );

      const url = generateAmazonSearchUrl("plastic dinosaurs");
      expect(url).toContain("tag=custom-tag-21");
    });

    it("uses explicit partner tag parameter over env var", async () => {
      process.env.AMAZON_PARTNER_TAG = "env-tag-21";
      const { generateAmazonSearchUrl } = await import(
        "@/lib/integrations/amazon-paapi"
      );

      const url = generateAmazonSearchUrl("spray bottle", "explicit-tag-22");
      expect(url).toContain("tag=explicit-tag-22");
    });

    it("encodes special characters in search query", async () => {
      const { generateAmazonSearchUrl } = await import(
        "@/lib/integrations/amazon-paapi"
      );

      const url = generateAmazonSearchUrl("kid's paint brush (set of 3)");
      expect(url).toContain("k=kid's%20paint%20brush%20(set%20of%203)");
    });

    it("trims whitespace from query", async () => {
      const { generateAmazonSearchUrl } = await import(
        "@/lib/integrations/amazon-paapi"
      );

      const url = generateAmazonSearchUrl("  baking soda  ");
      expect(url).toContain("k=baking%20soda");
      expect(url).not.toContain("%20%20");
    });
  });

  describe("generateAmazonBundleUrl", () => {
    it("combines required materials into a single search URL", async () => {
      const { generateAmazonBundleUrl } = await import(
        "@/lib/integrations/amazon-paapi"
      );

      const materials = [
        { name: "baking soda", required: true },
        { name: "plastic dinosaurs", required: true },
        { name: "spray bottle", required: true },
        { name: "food coloring", required: false },
      ];

      const url = generateAmazonBundleUrl(materials, "Dino Dig");
      // Should include required materials + "kids activity"
      expect(url).toContain("baking%20soda");
      expect(url).toContain("plastic%20dinosaurs");
      expect(url).toContain("spray%20bottle");
      expect(url).toContain("kids%20activity");
      expect(url).toContain("tag=kinloop-20");
    });

    it("uses all materials when fewer than 2 are required", async () => {
      const { generateAmazonBundleUrl } = await import(
        "@/lib/integrations/amazon-paapi"
      );

      const materials = [
        { name: "paper", required: true },
        { name: "crayons", required: false },
        { name: "glue stick", required: false },
      ];

      const url = generateAmazonBundleUrl(materials);
      expect(url).toContain("paper");
      expect(url).toContain("crayons");
      expect(url).toContain("glue%20stick");
    });

    it("limits to 5 materials in the search query", async () => {
      const { generateAmazonBundleUrl } = await import(
        "@/lib/integrations/amazon-paapi"
      );

      const materials = Array.from({ length: 10 }, (_, i) => ({
        name: `material-${i}`,
        required: true,
      }));

      const url = generateAmazonBundleUrl(materials);
      // Should only include first 5
      expect(url).toContain("material-0");
      expect(url).toContain("material-4");
      expect(url).not.toContain("material-5");
    });
  });

  describe("isPaApiConfigured", () => {
    it("returns false when no env vars are set", async () => {
      delete process.env.AMAZON_ACCESS_KEY;
      delete process.env.AMAZON_SECRET_KEY;
      delete process.env.AMAZON_PARTNER_TAG;

      const { isPaApiConfigured } = await import(
        "@/lib/integrations/amazon-paapi"
      );
      expect(isPaApiConfigured()).toBe(false);
    });

    it("returns false when only some env vars are set", async () => {
      process.env.AMAZON_ACCESS_KEY = "test-key";
      delete process.env.AMAZON_SECRET_KEY;
      delete process.env.AMAZON_PARTNER_TAG;

      const { isPaApiConfigured } = await import(
        "@/lib/integrations/amazon-paapi"
      );
      expect(isPaApiConfigured()).toBe(false);
    });

    it("returns true when all three env vars are set", async () => {
      process.env.AMAZON_ACCESS_KEY = "test-key";
      process.env.AMAZON_SECRET_KEY = "test-secret";
      process.env.AMAZON_PARTNER_TAG = "test-tag-20";

      const { isPaApiConfigured } = await import(
        "@/lib/integrations/amazon-paapi"
      );
      expect(isPaApiConfigured()).toBe(true);
    });
  });

  describe("enrichMaterialsWithAmazon", () => {
    it("returns search-link URLs for all materials (V1 fallback)", async () => {
      delete process.env.AMAZON_ACCESS_KEY;
      delete process.env.AMAZON_SECRET_KEY;
      delete process.env.AMAZON_PARTNER_TAG;

      const { enrichMaterialsWithAmazon } = await import(
        "@/lib/integrations/amazon-paapi"
      );

      const materials = [
        { name: "baking soda", quantity: "1 cup", required: true },
        { name: "water", quantity: null, required: true },
      ];

      const enriched = await enrichMaterialsWithAmazon(materials);

      expect(enriched).toHaveLength(2);
      expect(enriched[0].amazonUrl).toContain("amazon.com/s?k=baking%20soda");
      expect(enriched[0].name).toBe("baking soda");
      expect(enriched[0].quantity).toBe("1 cup");
      expect(enriched[0].required).toBe(true);
      expect(enriched[0].estimatedPrice).toBeNull();
      expect(enriched[0].productTitle).toBeNull();
      expect(enriched[0].imageUrl).toBeNull();
    });

    it("preserves all original material fields", async () => {
      const { enrichMaterialsWithAmazon } = await import(
        "@/lib/integrations/amazon-paapi"
      );

      const materials = [
        { name: "plastic dinosaurs", quantity: "3 pieces", required: false },
      ];

      const enriched = await enrichMaterialsWithAmazon(materials);

      expect(enriched[0].name).toBe("plastic dinosaurs");
      expect(enriched[0].quantity).toBe("3 pieces");
      expect(enriched[0].required).toBe(false);
    });
  });
});
