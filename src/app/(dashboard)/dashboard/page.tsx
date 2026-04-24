/**
 * Dashboard — 2x2 grid home view showing all four quadrants at a glance.
 * TODO: Implement with DashboardGrid and QuadrantTile components.
 * See GitHub Issue #3 for requirements.
 */
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Your 2x2 overview of Scheduler, Development, Play Lab, and Coach.
      </p>

      {/* TODO: Replace with DashboardGrid component */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border-2 border-dashed border-scheduler/30 bg-scheduler-muted p-8 text-center">
          <h2 className="font-semibold text-scheduler">Scheduler</h2>
          <p className="mt-2 text-sm text-muted-foreground">Emails → calendar events</p>
        </div>
        <div className="rounded-xl border-2 border-dashed border-development/30 bg-development-muted p-8 text-center">
          <h2 className="font-semibold text-development">Development</h2>
          <p className="mt-2 text-sm text-muted-foreground">Growth, milestones & health</p>
        </div>
        <div className="rounded-xl border-2 border-dashed border-play/30 bg-play-muted p-8 text-center">
          <h2 className="font-semibold text-play">Play Lab</h2>
          <p className="mt-2 text-sm text-muted-foreground">Activities from social links</p>
        </div>
        <div className="rounded-xl border-2 border-dashed border-coach/30 bg-coach-muted p-8 text-center">
          <h2 className="font-semibold text-coach">Coach</h2>
          <p className="mt-2 text-sm text-muted-foreground">Personalized parenting guidance</p>
        </div>
      </div>
    </div>
  );
}
