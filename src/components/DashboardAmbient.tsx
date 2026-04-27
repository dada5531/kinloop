"use client";

import {
  AmbientCloud,
  AmbientPlant,
  AmbientDiamond,
  AmbientSun,
} from "@/components/illustrations/ambient";

/**
 * DashboardAmbient — 4 peripheral drifting illustrations.
 *
 * Ported from kinloop-dashboard-reference.html.
 * position:fixed, z-index 1, 15-20% opacity, 15-22s drift loops.
 * The small sun (ambient-4) rotates 180° during its drift cycle.
 *
 * Mobile: drops ambient-3 and ambient-4 to reduce visual noise.
 * prefers-reduced-motion: all animations disabled via CSS.
 */
export default function DashboardAmbient() {
  return (
    <>
      {/* Upper-right: cloud/blob — 18s drift, 18% opacity */}
      <AmbientCloud className="kl-ambient kl-ambient-1" />

      {/* Lower-left: plant/stem — 22s drift, 15% opacity */}
      <AmbientPlant className="kl-ambient kl-ambient-2" />

      {/* Mid-right: diamond/star — 15s drift, 20% opacity */}
      <AmbientDiamond className="kl-ambient kl-ambient-3" />

      {/* Upper-left: small sun — 20s drift with 180° rotate, 16% opacity */}
      <AmbientSun className="kl-ambient kl-ambient-4" />
    </>
  );
}
