import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";

interface QuadrantTransitionProps {
  /** The illustration component to display during the transition */
  illustration: React.ReactNode;
  /** Background color class for the transition overlay (e.g. "bg-scheduler-muted") */
  bgClass?: string;
  /** Accent color for the subtle glow ring */
  accentClass?: string;
  /** Called when the transition animation completes */
  onComplete?: () => void;
  /** Whether to play the transition (set false to skip) */
  play?: boolean;
  children: React.ReactNode;
}

/**
 * QuadrantTransition — 800ms 3-phase page entrance animation.
 *
 * Phase 1 (0–300ms):  Illustration fades in, scales 0.8 → 1.0
 * Phase 2 (300–700ms): Sub-animation plays (envelope tilts, sprout sways, etc.)
 * Phase 3 (700–800ms): Crossfade — overlay fades out while content fades in simultaneously
 *
 * prefers-reduced-motion: simpler 400ms appear + 200ms fade, no scale/sub-animation
 */
export default function QuadrantTransition({
  illustration,
  bgClass = "bg-background",
  accentClass,
  onComplete,
  play = true,
  children,
}: QuadrantTransitionProps) {
  const prefersReduced = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "hold" | "exit" | "done">(play ? "intro" : "done");

  const stableOnComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (!play) {
      setPhase("done");
      return;
    }

    if (prefersReduced) {
      // Reduced motion: 400ms appear, then 200ms fade
      const t1 = setTimeout(() => setPhase("exit"), 400);
      const t2 = setTimeout(() => {
        setPhase("done");
        stableOnComplete();
      }, 600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    // Full motion: intro(300ms) → hold(400ms) → exit(100ms crossfade)
    const t1 = setTimeout(() => setPhase("hold"), 300);
    const t2 = setTimeout(() => setPhase("exit"), 700);
    const t3 = setTimeout(() => {
      setPhase("done");
      stableOnComplete();
    }, 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [play, prefersReduced, stableOnComplete]);

  // After transition completes, render children directly (no wrapper overhead)
  if (phase === "done") {
    return <>{children}</>;
  }

  // During transition: overlay + content underneath that fades in during exit
  const showOverlay = phase === "intro" || phase === "hold" || phase === "exit";
  const contentVisible = phase === "exit";

  return (
    <div className="relative">
      {/* Page content — renders underneath, fades in during exit phase (crossfade) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: contentVisible ? 1 : 0 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        {children}
      </motion.div>

      {/* Transition overlay — fades out during exit phase (crossfade) */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="transition-overlay"
            className={`fixed inset-0 z-40 flex items-center justify-center ${bgClass}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "exit" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            <motion.div
              className={`relative flex items-center justify-center rounded-full p-8 ${accentClass ? `ring-2 ring-offset-4 ring-offset-background ${accentClass}` : ""}`}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={
                prefersReduced
                  ? { opacity: phase === "exit" ? 0 : 1 }
                  : {
                      opacity: phase === "exit" ? 0 : 1,
                      scale: 1,
                      rotate: phase === "hold" ? [0, -2, 2, -1, 0] : 0,
                    }
              }
              transition={
                prefersReduced
                  ? { duration: 0.3 }
                  : {
                      opacity: { duration: 0.25 },
                      scale: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
                      rotate: {
                        duration: 0.4,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1],
                      },
                    }
              }
            >
              <div className="h-24 w-24 md:h-32 md:w-32">{illustration}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
