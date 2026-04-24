import { QuadrantTile } from "./QuadrantTile";

/**
 * DashboardGrid — The 2x2 grid layout for the dashboard home.
 * Fetches summary data for each quadrant and renders QuadrantTile components.
 *
 * TODO: Implement with real data fetching.
 * See GitHub Issue #3 for requirements.
 */
export function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <QuadrantTile
        title="Scheduler"
        description="Emails → calendar events"
        href="/scheduler"
        color="scheduler"
        recentItems={[]}
      />
      <QuadrantTile
        title="Development"
        description="Growth, milestones & health"
        href="/development"
        color="development"
        recentItems={[]}
      />
      <QuadrantTile
        title="Play Lab"
        description="Activities from social links"
        href="/play"
        color="play"
        recentItems={[]}
      />
      <QuadrantTile
        title="Coach"
        description="Personalized parenting guidance"
        href="/coach"
        color="coach"
        recentItems={[]}
      />
    </div>
  );
}
