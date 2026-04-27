import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import React, { useEffect, useState } from "react";

interface AchievementMicroProps {
  /** The illustration component to show */
  illustration: React.ReactNode;
  /** Whether the achievement is currently visible */
  show: boolean;
  /** Called when the auto-dismiss completes */
  onDismiss?: () => void;
  /** Auto-dismiss delay in ms (default 1500) */
  duration?: number;
  /** Optional label text below the illustration */
  label?: string;
  /** Position on screen */
  position?: "center" | "top-right" | "bottom-center";
}

/**
 * AchievementMicro — spring-animated success overlay.
 *
 * Shows a small illustration with a spring pop-in, holds briefly,
 * then fades out. Used for micro-celebrations like "Activity scheduled!"
 *
 * prefers-reduced-motion: simple fade in/out, no spring or scale.
 */
export default function AchievementMicro({
  illustration,
  show,
  onDismiss,
  duration = 1500,
  label,
  position = "center",
}: AchievementMicroProps) {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Small delay for exit animation to complete
        setTimeout(() => onDismiss?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onDismiss]);

  const positionClasses = {
    center: "fixed inset-0 z-50 flex items-center justify-center pointer-events-none",
    "top-right": "fixed top-6 right-6 z-50 pointer-events-none",
    "bottom-center": "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none",
  };

  return (
    <AnimatePresence>
      {visible && (
        <div className={positionClasses[position]}>
          <motion.div
            className="flex flex-col items-center gap-2"
            initial={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.3, y: 20 }
            }
            animate={
              prefersReduced
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.8, y: -10 }
            }
            transition={
              prefersReduced
                ? { duration: 0.2 }
                : {
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    mass: 0.8,
                  }
            }
          >
            {/* Glow ring behind the illustration */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-amber-200/40 blur-xl"
                initial={{ scale: 0 }}
                animate={{ scale: prefersReduced ? 1 : [0, 1.4, 1.2] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <div className="relative h-16 w-16 md:h-20 md:w-20">
                {illustration}
              </div>
            </div>

            {/* Optional label */}
            {label && (
              <motion.span
                className="rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
              >
                {label}
              </motion.span>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
