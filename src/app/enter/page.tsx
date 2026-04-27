"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { motion } from "framer-motion";
import SigninCenterpiece from "@/components/illustrations/SigninCenterpiece";

/**
 * Sign-in page — v1.6.3 surface-motion.
 *
 * Calm, welcoming, focused. Different animation language from landing page.
 * - Centered ambient illustration (envelope/letters motif) at 12% opacity, floats behind card
 * - 6 small decorative dots in quadrant accent colors, stagger fade-in 0.5-1.5s
 * - Frosted glass sign-in card (backdrop-filter blur 8px, 85% opacity bg)
 * - Card fades up from translateY(12px) at 0.6s
 * - "Demo access for HBS preview" helper text fades in at 0.3s
 * - Breathing wordmark at top
 * - NO marquee — would compete with the password input
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

      {/* "Demo access" helper text — fades in at 0.3s */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        className="kl-hello-text"
      >
        Demo access for HBS preview
      </motion.div>

      {/* Centerpiece — large ambient illustration floating behind the card */}
      <SigninCenterpiece className="kl-centerpiece" />

      {/* Decorative dots scattered around the form */}
      <div className="kl-dot kl-dot-1" />
      <div className="kl-dot kl-dot-2" />
      <div className="kl-dot kl-dot-3" />
      <div className="kl-dot kl-dot-4" />
      <div className="kl-dot kl-dot-5" />
      <div className="kl-dot kl-dot-6" />

      {/* Frosted glass sign-in card — fades up at 0.6s */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        className="kl-signin-card"
      >
        <h1 className="kl-signin-title">Welcome to Kinloop</h1>
        <p className="kl-signin-helper">
          Enter the access password to continue.
        </p>
        <form onSubmit={handleSubmit}>
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
            className="kl-signin-input"
          />
          {error && (
            <p className="mt-1 mb-2 text-center text-sm text-red-500/90">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="kl-signin-button"
          >
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </motion.div>

      {/* Footer note — fades in at 1.4s */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 1.4 }}
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
