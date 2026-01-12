"use client";

import { Icon, type IconName } from "@/components/ui/icon";
import type { BeadJourneyState, BeadJourneyStage } from "@/lib/gastown";
import { RefineryQueueIndicator } from "./refinery-queue-indicator";

interface BeadStatusRowProps {
  bead: BeadJourneyState;
  showWorker?: boolean;
}

/**
 * Stage icon mapping for bead journey stages.
 */
const stageIcons: Record<BeadJourneyStage, IconName> = {
  queued: "clock",
  hooked: "lock",
  in_progress: "terminal",
  pr_ready: "link",
  refinery: "cog",
  merged: "check-circle",
};

/**
 * Stage color classes for bead journey stages.
 */
const stageColors: Record<BeadJourneyStage, string> = {
  queued: "text-ash",
  hooked: "text-fuel-yellow",
  in_progress: "text-acid-green",
  pr_ready: "text-fuel-yellow",
  refinery: "text-rust-orange",
  merged: "text-acid-green",
};

/**
 * Format time ago string from seconds.
 */
function formatTimeAgo(seconds: number): string {
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * BeadStatusRow displays a single bead with its journey stage, worker, and timing info.
 * Used in ConvoyCard expansion to show per-bead status.
 */
export function BeadStatusRow({ bead, showWorker = true }: BeadStatusRowProps) {
  const iconName = stageIcons[bead.stage];
  const colorClass = stageColors[bead.stage];

  return (
    <div className="flex items-center justify-between px-4 py-2 hover:bg-carbon-black/30 transition-mechanical">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Stage icon */}
        <Icon
          name={iconName}
          aria-label={bead.stage}
          size="sm"
          className={colorClass}
        />

        {/* Bead info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-ash">{bead.beadId}</span>
            {bead.needsNudge && (
              <Icon
                name="exclamation-triangle"
                aria-label="Needs nudge"
                size="xs"
                className="text-rust-orange"
              />
            )}
          </div>
          <span className="text-sm text-bone truncate block">{bead.title}</span>
        </div>
      </div>

      {/* Right side info */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Worker */}
        {showWorker && bead.worker && (
          <span className="text-xs text-ash font-mono">{bead.worker}</span>
        )}

        {/* Refinery position */}
        {bead.refinery && (
          <RefineryQueueIndicator
            position={bead.refinery.position}
            queueLength={bead.refinery.queueLength}
          />
        )}

        {/* Time ago */}
        <span className="text-xs text-ash w-16 text-right">
          {formatTimeAgo(bead.idleDuration)}
        </span>
      </div>
    </div>
  );
}
