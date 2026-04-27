"use client";

import {
  PaperCrane,
  Plant,
  PaperAirplane,
  BalloonFlower,
  OpenBook,
  Seedling,
  Envelope,
  House,
} from "@/components/illustrations/marquee";

/**
 * MarqueeStrip — bottom illustration parade.
 *
 * 8 hand-drawn toddler-life SVGs scroll right-to-left in an infinite loop.
 * The set is duplicated for seamless looping (translateX(0) → translateX(-50%)).
 * Each item has its own bob/sway/tilt/float CSS animation at different periods.
 *
 * Desktop: 36s loop, 88px gap, 110px strip height
 * Mobile:  28s loop, 56px gap,  90px strip height
 *
 * Reduced motion: marquee frozen at -15%, all internal motions disabled.
 */

type Motion = "kl-bob" | "kl-sway" | "kl-tilt" | "kl-float";

const ITEMS: { Component: React.FC<{ className?: string }>; motion: Motion }[] = [
  { Component: PaperCrane, motion: "kl-bob" },
  { Component: Plant, motion: "kl-sway" },
  { Component: PaperAirplane, motion: "kl-tilt" },
  { Component: BalloonFlower, motion: "kl-float" },
  { Component: OpenBook, motion: "kl-bob" },
  { Component: Seedling, motion: "kl-sway" },
  { Component: Envelope, motion: "kl-tilt" },
  { Component: House, motion: "kl-bob" },
];

function ItemSet() {
  return (
    <>
      {ITEMS.map(({ Component, motion }, i) => (
        <div key={i} className={`kl-marquee-item ${motion}`}>
          <Component />
        </div>
      ))}
    </>
  );
}

export default function MarqueeStrip() {
  return (
    <div className="kl-marquee-strip" aria-hidden="true">
      <div className="kl-marquee-track">
        {/* Set 1 */}
        <ItemSet />
        {/* Set 2 — duplicate for seamless loop */}
        <ItemSet />
      </div>
    </div>
  );
}
