"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { motion } from "framer-motion";
import MarqueeStrip from "@/components/MarqueeStrip";

/**
 * Password gate — v1.6.3 landing-motion.
 *
 * Same visual language as landing page but adjusted timing:
 * - Breathing wordmark at top center
 * - Password input fades in at 0.4s
 * - Enter button fades in at 0.8s
 * - Same marquee strip at bottom
 * - Footer note fades in at 1.2s
 */

function EnterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/dashboard";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || "Incorrect password.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="kl-viewport">
      {/* Breathing wordmark */}
      <div className="kl-wordmark">
        kin<span className="kl-wordmark-loop">loop</span>
      </div>

      {/* Center stage — password form */}
      <div className="kl-center-stage">
        <form onSubmit={handleSubmit} className="kl-enter-form">
          {/* Password input — fade in at 0.4s */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="w-full"
          >
            <label htmlFor="password" className="sr-only">
              Access Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Access password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              autoFocus
              autoComplete="off"
              className="kl-password-input"
            />
            {error && (
              <p className="mt-2 text-center text-sm text-red-500/90">{error}</p>
            )}
          </motion.div>

          {/* Enter button — fade in at 0.8s */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
            className="w-full"
          >
            <button
              type="submit"
              disabled={loading || !password}
              className="kl-btn-primary w-full"
            >
              {loading ? "Verifying..." : "Enter"}
            </button>
          </motion.div>
        </form>
      </div>

      {/* Bottom marquee strip */}
      <MarqueeStrip />

      {/* Footer note — fade in at 1.2s */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 1.2 }}
        className="kl-footer-note"
      >
        AI-native parenting dashboard &middot; HBS MBA Capstone 2026
      </motion.div>
    </div>
  );
}

export default function EnterPage() {
  return (
    <Suspense
      fallback={
        <div className="kl-viewport">
          <div className="kl-wordmark">
            kin<span className="kl-wordmark-loop">loop</span>
          </div>
          <div className="kl-center-stage">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <EnterForm />
    </Suspense>
  );
}
