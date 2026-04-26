/**
 * WHO Child Growth Standards — Girls 0-5 years
 * Source: WHO Multicentre Growth Reference Study (MGRS)
 * https://www.who.int/tools/child-growth-standards
 *
 * Data points at key ages (months): 0, 3, 6, 9, 12, 18, 24, 36, 48, 60
 * Percentiles: 3rd, 15th, 50th, 85th, 97th
 */

export interface GrowthPercentile {
  month: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

// Weight-for-age (kg) — Girls 0-60 months
export const WHO_WEIGHT_GIRLS: GrowthPercentile[] = [
  { month: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
  { month: 3, p3: 4.4, p15: 4.9, p50: 5.5, p85: 6.2, p97: 7.0 },
  { month: 6, p3: 5.8, p15: 6.4, p50: 7.3, p85: 8.2, p97: 9.3 },
  { month: 9, p3: 6.6, p15: 7.3, p50: 8.2, p85: 9.3, p97: 10.5 },
  { month: 12, p3: 7.0, p15: 7.9, p50: 8.9, p85: 10.1, p97: 11.5 },
  { month: 18, p3: 8.1, p15: 9.0, p50: 10.2, p85: 11.6, p97: 13.2 },
  { month: 24, p3: 9.0, p15: 10.0, p50: 11.5, p85: 13.1, p97: 15.0 },
  { month: 36, p3: 10.8, p15: 12.0, p50: 13.9, p85: 16.0, p97: 18.6 },
  { month: 48, p3: 12.3, p15: 13.8, p50: 16.1, p85: 18.8, p97: 22.0 },
  { month: 60, p3: 13.7, p15: 15.5, p50: 18.2, p85: 21.5, p97: 25.4 },
];

// Length/Height-for-age (cm) — Girls 0-60 months
export const WHO_HEIGHT_GIRLS: GrowthPercentile[] = [
  { month: 0, p3: 45.4, p15: 47.0, p50: 49.1, p85: 51.1, p97: 52.9 },
  { month: 3, p3: 55.3, p15: 57.0, p50: 59.4, p85: 61.8, p97: 63.5 },
  { month: 6, p3: 61.2, p15: 63.0, p50: 65.7, p85: 68.4, p97: 70.3 },
  { month: 9, p3: 65.3, p15: 67.3, p50: 70.1, p85: 73.0, p97: 75.0 },
  { month: 12, p3: 68.9, p15: 71.0, p50: 74.0, p85: 77.0, p97: 79.2 },
  { month: 18, p3: 74.0, p15: 76.4, p50: 79.9, p85: 83.4, p97: 85.7 },
  { month: 24, p3: 80.0, p15: 82.5, p50: 86.4, p85: 90.2, p97: 92.9 },
  { month: 36, p3: 87.4, p15: 90.4, p50: 95.1, p85: 99.8, p97: 102.7 },
  { month: 48, p3: 94.1, p15: 97.6, p50: 102.7, p85: 107.8, p97: 111.3 },
  { month: 60, p3: 99.9, p15: 103.9, p50: 109.4, p85: 114.9, p97: 118.9 },
];

// Head circumference-for-age (cm) — Girls 0-36 months
export const WHO_HEAD_GIRLS: GrowthPercentile[] = [
  { month: 0, p3: 31.5, p15: 32.5, p50: 33.9, p85: 35.2, p97: 36.2 },
  { month: 3, p3: 37.1, p15: 38.0, p50: 39.5, p85: 41.0, p97: 42.0 },
  { month: 6, p3: 39.8, p15: 40.8, p50: 42.4, p85: 43.9, p97: 44.9 },
  { month: 9, p3: 41.3, p15: 42.4, p50: 44.0, p85: 45.6, p97: 46.6 },
  { month: 12, p3: 42.3, p15: 43.4, p50: 45.0, p85: 46.7, p97: 47.7 },
  { month: 18, p3: 43.5, p15: 44.6, p50: 46.2, p85: 47.9, p97: 48.9 },
  { month: 24, p3: 44.3, p15: 45.4, p50: 47.1, p85: 48.8, p97: 49.8 },
  { month: 36, p3: 45.3, p15: 46.4, p50: 48.1, p85: 49.8, p97: 50.8 },
];

/**
 * Compute percentile position for a given measurement value.
 * Returns approximate percentile (0-100) using linear interpolation.
 */
export function computePercentile(
  data: GrowthPercentile[],
  ageMonths: number,
  value: number,
): number | null {
  // Find the two nearest data points for interpolation
  let lower = data[0];
  let upper = data[data.length - 1];

  for (let i = 0; i < data.length - 1; i++) {
    if (ageMonths >= data[i].month && ageMonths <= data[i + 1].month) {
      lower = data[i];
      upper = data[i + 1];
      break;
    }
  }

  // Interpolate percentile values at the child's exact age
  const t =
    upper.month === lower.month ? 0 : (ageMonths - lower.month) / (upper.month - lower.month);
  const p3 = lower.p3 + t * (upper.p3 - lower.p3);
  const p15 = lower.p15 + t * (upper.p15 - lower.p15);
  const p50 = lower.p50 + t * (upper.p50 - lower.p50);
  const p85 = lower.p85 + t * (upper.p85 - lower.p85);
  const p97 = lower.p97 + t * (upper.p97 - lower.p97);

  // Map value to percentile using linear interpolation between bands
  const bands = [
    { pct: 3, val: p3 },
    { pct: 15, val: p15 },
    { pct: 50, val: p50 },
    { pct: 85, val: p85 },
    { pct: 97, val: p97 },
  ];

  if (value <= bands[0].val) return 1;
  if (value >= bands[bands.length - 1].val) return 99;

  for (let i = 0; i < bands.length - 1; i++) {
    if (value >= bands[i].val && value <= bands[i + 1].val) {
      const ratio = (value - bands[i].val) / (bands[i + 1].val - bands[i].val);
      return Math.round(bands[i].pct + ratio * (bands[i + 1].pct - bands[i].pct));
    }
  }

  return 50;
}
