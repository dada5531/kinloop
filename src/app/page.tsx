import Link from "next/link";

/**
 * Marketing landing page — public, no auth required.
 * TODO: Replace with full marketing design (hero, features, pricing, CTA).
 */
export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          KIN<span className="text-primary">LOOP</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          A 4-quadrant AI dashboard that turns the chaos of modern parenting — emails, PDFs, doctor
          notes, social links — into structured calendars, shopping lists, and personalized guidance.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 text-left">
          <div className="rounded-xl border bg-scheduler-muted p-4">
            <h3 className="font-semibold text-scheduler">Scheduler</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Forward an email, upload a PDF — events land on your calendar automatically.
            </p>
          </div>
          <div className="rounded-xl border bg-development-muted p-4">
            <h3 className="font-semibold text-development">Development</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload pediatrician notes — growth charts and milestones update instantly.
            </p>
          </div>
          <div className="rounded-xl border bg-play-muted p-4">
            <h3 className="font-semibold text-play">Play Lab</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste a YouTube link — get a structured activity plan with a materials shopping list.
            </p>
          </div>
          <div className="rounded-xl border bg-coach-muted p-4">
            <h3 className="font-semibold text-coach">Coach</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask anything — get evidence-based answers grounded in your child&apos;s context.
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/sign-up"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Get started
          </Link>
          <Link href="/sign-in" className="text-sm font-semibold text-foreground hover:underline">
            Sign in &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
