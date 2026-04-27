"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import MarqueeStrip from "@/components/MarqueeStrip";

/**
 * Landing page — v1.6.3 landing-motion.
 *
 * Exact port of kinloop-landing-reference-v2.html:
 * - Breathing wordmark at top center
 * - Fraunces subtitle fades up at 0.4s
 * - CTAs fade up at 1.0s
 * - Bottom marquee strip with 8 hand-drawn illustrations
 * - Footer note fades up at 1.6s
 * - No headline text
 */

export default function LandingPage() {
  return (
    <div className="kl-viewport">
      {/* Wordmark with breathing animation */}
      <div className="kl-wordmark">
        kin<span className="kl-wordmark-loop">loop</span>
      </div>

      {/* Center stage — subtitle and CTAs only */}
      <div className="kl-center-stage">
        {/* Subtitle — Fraunces serif, fade up at 0.4s */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="kl-subtitle"
        >
          An AI-native operating system for the people raising small humans.
        </motion.p>

        {/* CTAs — fade up at 1.0s */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.0 }}
          className="kl-cta-row"
        >
          <Link href="/enter" className="kl-btn-primary">
            Get started
          </Link>
          <Link href="/enter" className="kl-btn-ghost">
            Sign in &rarr;
          </Link>
        </motion.div>
      </div>

      {/* Bottom marquee strip */}
      <MarqueeStrip />

      {/* Footer note — fade up at 1.6s */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 1.6 }}
        className="kl-footer-note"
      >
        AI-native parenting dashboard &middot; HBS MBA Capstone 2026
      </motion.div>
    </div>
  );
}
