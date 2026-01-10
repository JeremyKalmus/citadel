"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, Skeleton, type Status } from "@/components/ui";
import type { MergeQueue } from "@/lib/gastown";

interface MergeQueueStatsProps {
  mergeQueue?: MergeQueue | null;
  isLoading?: boolean;
  compact?: boolean;
}

function mapHealthToStatus(health: string): Status {
  switch (health.toLowerCase()) {
    case "healthy":
    case "ok":
      return "active";
    case "degraded":
    case "slow":
      return "slow";
    case "blocked":
      return "blocked";
    case "down":
    case "error":
      return "dead";
    default:
      return "thinking";
  }
}

/**
 * MergeQueueStats - Compact statistics display for merge queue
 *
 * Shows pending, in-flight, and blocked counts with health status.
 * Use `compact` prop for inline/dashboard contexts.
 */
export function MergeQueueStats({ mergeQueue, isLoading, compact = false }: MergeQueueStatsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton variant="stat" className="w-12 h-6" />
        <Skeleton variant="stat" className="w-12 h-6" />
        <Skeleton variant="stat" className="w-12 h-6" />
      </div>
    );
  }

  if (!mergeQueue) {
    return (
      <div className="text-ash text-sm">No queue data</div>
    );
  }

  const total = mergeQueue.pending + mergeQueue.in_flight + mergeQueue.blocked;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-fuel-yellow font-mono text-sm">{mergeQueue.pending}</span>
          <span className="text-ash text-xs">pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-acid-green font-mono text-sm">{mergeQueue.in_flight}</span>
          <span className="text-ash text-xs">in flight</span>
        </div>
        {mergeQueue.blocked > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-rust-orange font-mono text-sm">{mergeQueue.blocked}</span>
            <span className="text-ash text-xs">blocked</span>
          </div>
        )}
        <StatusBadge status={mapHealthToStatus(mergeQueue.health)} size="sm" showLabel={false} />
      </div>
    );
  }

  return (
    <Panel>
      <PanelHeader
        icon="road"
        title="Queue Stats"
        actions={<StatusBadge status={mapHealthToStatus(mergeQueue.health)} size="sm" />}
      />
      <PanelBody>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="data-value text-fuel-yellow">{mergeQueue.pending}</p>
            <p className="label mt-1">Pending</p>
          </div>
          <div className="text-center">
            <p className="data-value text-acid-green">{mergeQueue.in_flight}</p>
            <p className="label mt-1">In Flight</p>
          </div>
          <div className="text-center">
            <p className="data-value text-rust-orange">{mergeQueue.blocked}</p>
            <p className="label mt-1">Blocked</p>
          </div>
          <div className="text-center">
            <p className="data-value text-bone">{total}</p>
            <p className="label mt-1">Total</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-chrome-border/50">
          <div className="flex justify-between items-center">
            <span className="label">Queue State</span>
            <span className="text-xs text-bone font-mono">{mergeQueue.state}</span>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}
