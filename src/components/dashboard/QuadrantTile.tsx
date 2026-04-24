import Link from "next/link";

import { cn } from "@/lib/utils";

interface QuadrantTileProps {
  title: string;
  description: string;
  href: string;
  color: "scheduler" | "development" | "play" | "coach";
  icon?: React.ReactNode;
  stats?: { label: string; value: string | number }[];
  recentItems?: { label: string; date?: string }[];
}

/**
 * QuadrantTile — A card component for the 2x2 dashboard grid.
 * Each tile represents one of the four KINLOOP quadrants.
 *
 * TODO: Implement with real data from tRPC/server actions.
 * See GitHub Issue #3 for requirements.
 */
export function QuadrantTile({
  title,
  description,
  href,
  color,
  icon,
  stats,
  recentItems,
}: QuadrantTileProps) {
  const colorMap = {
    scheduler: "border-scheduler/30 bg-scheduler-muted",
    development: "border-development/30 bg-development-muted",
    play: "border-play/30 bg-play-muted",
    coach: "border-coach/30 bg-coach-muted",
  };

  const textColorMap = {
    scheduler: "text-scheduler",
    development: "text-development",
    play: "text-play",
    coach: "text-coach",
  };

  return (
    <Link href={href}>
      <div
        className={cn(
          "rounded-xl border-2 p-6 transition-shadow hover:shadow-md",
          colorMap[color],
        )}
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className={cn("font-semibold", textColorMap[color])}>{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className="mt-4 flex gap-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {recentItems && recentItems.length > 0 && (
          <ul className="mt-4 space-y-1">
            {recentItems.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{item.label}</span>
                {item.date && (
                  <span className="text-muted-foreground">{item.date}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
