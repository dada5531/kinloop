"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Marketing landing page — Abeto-inspired, editorial, warm.
 * Massive headline with letter-stagger animation, clean CTAs,
 * quadrant cards pushed below fold as secondary content.
 */

const headlineWords = ["Less", "chaos.", "More", "childhood."];

const letterVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
};

export default function LandingPage() {
  // Build a flat array of characters with their global index for stagger
  let globalIndex = 0;
  const wordElements = headlineWords.map((word, wordIdx) => {
    const chars = word.split("").map((char) => {
      const idx = globalIndex++;
      return (
        <motion.span
          key={`${wordIdx}-${idx}`}
          custom={idx}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          className="inline-block"
        >
          {char}
        </motion.span>
      );
    });
    // Add space between words (not after last)
    if (wordIdx < headlineWords.length - 1) {
      globalIndex++;
    }
    return (
      <span key={wordIdx} className="inline-block whitespace-nowrap">
        {chars}
        {wordIdx < headlineWords.length - 1 && (
          <span className="inline-block w-[0.3em]" />
        )}
      </span>
    );
  });

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* ─── Hero: above-fold ─── */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Wordmark */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 font-serif-display text-sm font-medium tracking-widest text-muted-foreground uppercase"
          >
            kinloop
          </motion.p>

          {/* Massive headline */}
          <h1 className="font-serif-display text-[clamp(2.25rem,6vw,5rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            {wordElements}
          </h1>

          {/* Supporting line */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted-foreground md:text-xl"
          >
            An AI dashboard that turns parenting chaos into calm.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-10 flex items-center justify-center gap-x-5"
          >
            <Link
              href="/enter"
              className="rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-all hover:opacity-85 active:scale-[0.98]"
            >
              Get started
            </Link>
            <Link
              href="/enter"
              className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
              <span className="inline-block transition-transform group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Below fold: quadrant cards ─── */}
      <section className="border-t border-border/50 bg-card/50 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Four quadrants, one dashboard
          </motion.p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                accent: "scheduler",
                title: "Scheduler",
                desc: "Forward an email, upload a PDF — events land on your calendar automatically.",
              },
              {
                accent: "development",
                title: "Development",
                desc: "Upload pediatrician notes — growth charts and milestones update instantly.",
              },
              {
                accent: "play",
                title: "Play Lab",
                desc: "Paste a YouTube link — get a structured activity plan with a materials shopping list.",
              },
              {
                accent: "coach",
                title: "Coach",
                desc: "Ask anything — get evidence-based answers grounded in your child's context.",
              },
            ].map((q, i) => (
              <motion.div
                key={q.accent}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative overflow-hidden rounded-xl border-[0.5px] border-border bg-card p-5"
              >
                <div
                  className={`absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-${q.accent}`}
                />
                <h3
                  className={`text-[11px] font-medium uppercase tracking-wider text-${q.accent}`}
                >
                  {q.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {q.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/30 px-6 py-8 text-center">
        <p className="text-[11px] text-muted-foreground">
          AI-native parenting dashboard &middot; HBS MBA Capstone 2026
        </p>
      </footer>
    </main>
  );
}
