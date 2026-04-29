/**
 * Tests for src/lib/affiliate/location-resolution.ts
 *
 * Covers:
 * - Three-layer location resolution (settings → geo → fallback)
 * - Insurance slug mapping (valid slugs, Skip/Other/null → null)
 * - Smart Zocdoc URL builder (all combinations)
 */
import { describe, it, expect } from "vitest";
import {
  resolveLocation,
  resolveInsuranceSlug,
  buildSmartZocdocUrl,
} from "../../src/lib/affiliate/location-resolution";

// ─── resolveLocation ───────────────────────────────────────────

describe("resolveLocation", () => {
  it("prefers settings ZIP (layer 1) over geo and fallback", () => {
    const result = resolveLocation("10001", "02138", "Boston");
    expect(result.address).toBe("10001");
    expect(result.source).toBe("settings");
  });

  it("uses geo postal code (layer 2) when settings ZIP is null", () => {
    const result = resolveLocation(null, "94105", "San Francisco");
    expect(result.address).toBe("94105");
    expect(result.source).toBe("geo");
  });

  it("uses geo city (layer 2) when settings ZIP is null and geo postal is null", () => {
    const result = resolveLocation(null, null, "Cambridge");
    expect(result.address).toBe("Cambridge");
    expect(result.source).toBe("geo");
  });

  it("falls back to 02138 (layer 3) when all inputs are null", () => {
    const result = resolveLocation(null, null, null);
    expect(result.address).toBe("02138");
    expect(result.source).toBe("fallback");
  });

  it("falls back to 02138 when all inputs are empty strings", () => {
    const result = resolveLocation("", "", "");
    expect(result.address).toBe("02138");
    expect(result.source).toBe("fallback");
  });

  it("trims whitespace from settings ZIP", () => {
    const result = resolveLocation("  10001  ", null, null);
    expect(result.address).toBe("10001");
    expect(result.source).toBe("settings");
  });

  it("rejects settings ZIP shorter than 3 chars", () => {
    const result = resolveLocation("02", "94105", null);
    expect(result.address).toBe("94105");
    expect(result.source).toBe("geo");
  });

  it("handles undefined inputs gracefully", () => {
    const result = resolveLocation(undefined, undefined, undefined);
    expect(result.address).toBe("02138");
    expect(result.source).toBe("fallback");
  });
});

// ─── resolveInsuranceSlug ──────────────────────────────────────

describe("resolveInsuranceSlug", () => {
  it("maps Aetna to aetna", () => {
    expect(resolveInsuranceSlug("Aetna")).toBe("aetna");
  });

  it("maps Anthem to anthem-blue-cross-blue-shield", () => {
    expect(resolveInsuranceSlug("Anthem")).toBe("anthem-blue-cross-blue-shield");
  });

  it("maps BlueCross to blue-cross-blue-shield", () => {
    expect(resolveInsuranceSlug("BlueCross")).toBe("blue-cross-blue-shield");
  });

  it("maps Cigna to cigna", () => {
    expect(resolveInsuranceSlug("Cigna")).toBe("cigna");
  });

  it("maps Kaiser to kaiser-permanente", () => {
    expect(resolveInsuranceSlug("Kaiser")).toBe("kaiser-permanente");
  });

  it("maps UnitedHealthcare to united-healthcare", () => {
    expect(resolveInsuranceSlug("UnitedHealthcare")).toBe("united-healthcare");
  });

  it("returns null for 'Other'", () => {
    expect(resolveInsuranceSlug("Other")).toBeNull();
  });

  it("returns null for 'Skip'", () => {
    expect(resolveInsuranceSlug("Skip")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(resolveInsuranceSlug("")).toBeNull();
  });

  it("returns null for null", () => {
    expect(resolveInsuranceSlug(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(resolveInsuranceSlug(undefined)).toBeNull();
  });

  it("returns null for unknown provider", () => {
    expect(resolveInsuranceSlug("Humana")).toBeNull();
  });
});

// ─── buildSmartZocdocUrl ───────────────────────────────────────

describe("buildSmartZocdocUrl", () => {
  it("builds URL with settings ZIP and valid insurance", () => {
    const result = buildSmartZocdocUrl({
      settingsZip: "02138",
      settingsInsurance: "BlueCross",
      geoPostalCode: null,
      geoCity: null,
    });
    expect(result.url).toContain("dr_specialty=pediatrician");
    expect(result.url).toContain("address=02138");
    expect(result.url).toContain("insurance_carrier=blue-cross-blue-shield");
    expect(result.url).toContain("utm_source=kinloop");
    expect(result.locationSource).toBe("settings");
    expect(result.hasSettingsZip).toBe(true);
  });

  it("omits insurance_carrier when provider is Other", () => {
    const result = buildSmartZocdocUrl({
      settingsZip: "02138",
      settingsInsurance: "Other",
      geoPostalCode: null,
      geoCity: null,
    });
    expect(result.url).not.toContain("insurance_carrier");
    expect(result.url).toContain("address=02138");
  });

  it("omits insurance_carrier when provider is Skip", () => {
    const result = buildSmartZocdocUrl({
      settingsZip: "02138",
      settingsInsurance: "Skip",
      geoPostalCode: null,
      geoCity: null,
    });
    expect(result.url).not.toContain("insurance_carrier");
  });

  it("omits insurance_carrier when provider is null", () => {
    const result = buildSmartZocdocUrl({
      settingsZip: "02138",
      settingsInsurance: null,
      geoPostalCode: null,
      geoCity: null,
    });
    expect(result.url).not.toContain("insurance_carrier");
  });

  it("uses geo postal code when settings ZIP is null", () => {
    const result = buildSmartZocdocUrl({
      settingsZip: null,
      settingsInsurance: "Cigna",
      geoPostalCode: "94105",
      geoCity: "San Francisco",
    });
    expect(result.url).toContain("address=94105");
    expect(result.url).toContain("insurance_carrier=cigna");
    expect(result.locationSource).toBe("geo");
    expect(result.hasSettingsZip).toBe(false);
  });

  it("uses geo city when settings ZIP and geo postal are null", () => {
    const result = buildSmartZocdocUrl({
      settingsZip: null,
      settingsInsurance: null,
      geoPostalCode: null,
      geoCity: "Cambridge",
    });
    expect(result.url).toContain("address=Cambridge");
    expect(result.locationSource).toBe("geo");
    expect(result.hasSettingsZip).toBe(false);
  });

  it("falls back to 02138 when all location inputs are null", () => {
    const result = buildSmartZocdocUrl({
      settingsZip: null,
      settingsInsurance: null,
      geoPostalCode: null,
      geoCity: null,
    });
    expect(result.url).toContain("address=02138");
    expect(result.locationSource).toBe("fallback");
    expect(result.hasSettingsZip).toBe(false);
  });

  it("uses custom specialty when provided", () => {
    const result = buildSmartZocdocUrl({
      settingsZip: "02138",
      settingsInsurance: null,
      geoPostalCode: null,
      geoCity: null,
      specialty: "dentist",
    });
    expect(result.url).toContain("dr_specialty=dentist");
  });

  it("defaults to pediatrician specialty", () => {
    const result = buildSmartZocdocUrl({
      settingsZip: "02138",
      settingsInsurance: null,
      geoPostalCode: null,
      geoCity: null,
    });
    expect(result.url).toContain("dr_specialty=pediatrician");
  });

  it("URL starts with https://www.zocdoc.com/search", () => {
    const result = buildSmartZocdocUrl({
      settingsZip: "02138",
      settingsInsurance: "Aetna",
      geoPostalCode: null,
      geoCity: null,
    });
    expect(result.url).toMatch(/^https:\/\/www\.zocdoc\.com\/search\?/);
  });
});
