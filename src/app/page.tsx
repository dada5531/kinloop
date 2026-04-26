import Link from "next/link";

/**
 * Marketing landing page — public, no auth required.
 */
export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif-display text-4xl font-semibold tracking-tight text-foreground">
          kin<span className="font-normal text-muted-foreground">loop</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
          A 4-quadrant AI dashboard that turns the chaos of modern parenting — emails, PDFs, doctor
          notes, social links — into structured calendars, shopping lists, and personalized
          guidance.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 text-left">
          <div className="relative overflow-hidden rounded-xl border-[0.5px] border-border bg-card p-4">
            <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-scheduler" />
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-scheduler">
              Scheduler
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Forward an email, upload a PDF — events land on your calendar automatically.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-xl border-[0.5px] border-border bg-card p-4">
            <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-development" />
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-development">
              Development
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Upload pediatrician notes — growth charts and milestones update instantly.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-xl border-[0.5px] border-border bg-card p-4">
            <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-play" />
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-play">Play Lab</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Paste a YouTube link — get a structured activity plan with a materials shopping list.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-xl border-[0.5px] border-border bg-card p-4">
            <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-coach" />
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-coach">Coach</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Ask anything — get evidence-based answers grounded in your child&apos;s context.
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-x-4">
          <Link
            href="/enter"
            className="rounded-full bg-foreground px-6 py-2.5 text-[13px] font-medium text-background transition-opacity hover:opacity-80"
          >
            Get started
          </Link>
          <Link
            href="/enter"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in &rarr;
          </Link>
        </div>

        <p className="mt-12 text-[11px] text-muted-foreground">
          AI-native parenting dashboard &middot; HBS MBA Capstone 2026
        </p>
      </div>
    </main>
  );
}
