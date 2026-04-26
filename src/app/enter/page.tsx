"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="animate-fade-in w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-serif-display text-3xl font-semibold tracking-tight text-foreground">
            kin<span className="font-normal text-muted-foreground">loop</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Demo access for HBS preview</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border-[0.5px] border-border bg-card p-6">
          <h2 className="text-center text-base font-semibold text-foreground">
            Welcome to Kinloop
          </h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Enter the access password to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-5">
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
              className="w-full rounded-xl border-[0.5px] border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
            />

            {error && <p className="animate-slide-fade-in mt-2 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || !password}
              className="mt-4 w-full rounded-full bg-foreground px-4 py-2.5 text-[13px] font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {loading ? "Verifying..." : "Enter"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          AI-native parenting dashboard &middot; HBS MBA Capstone 2026
        </p>
      </div>
    </main>
  );
}

export default function EnterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </main>
      }
    >
      <EnterForm />
    </Suspense>
  );
}
