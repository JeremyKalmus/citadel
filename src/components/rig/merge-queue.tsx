"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, Gauge, type Status } from "@/components/ui";
import type { MergeQueue as MergeQueueType } from "@/lib/gastown";
import { GitMerge } from "lucide-react";

interface MergeQueueProps {
  mergeQueue?: MergeQueueType | null;
  hasRefinery: boolean;
  isLoading?: boolean;
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

export function MergeQueue({ mergeQueue, hasRefinery, isLoading }: MergeQueueProps) {
  if (isLoading) {
    return (
      <Panel>
        <PanelHeader icon="road" title="Merge Queue" />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">Loading queue...</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  if (!hasRefinery) {
    return (
      <Panel>
        <PanelHeader icon="road" title="Merge Queue" />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GitMerge className="w-8 h-8 text-ash mb-2" />
            <span className="text-ash">No refinery configured</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  if (!mergeQueue) {
    return (
      <Panel>
        <PanelHeader icon="road" title="Merge Queue" />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GitMerge className="w-8 h-8 text-ash mb-2" />
            <span className="text-ash">Queue data unavailable</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  const total = mergeQueue.pending + mergeQueue.in_flight + mergeQueue.blocked;
  const completionRate = total > 0 ? Math.round((mergeQueue.in_flight / total) * 100) : 0;

  return (
    <Panel>
      <PanelHeader
        icon="road"
        title="Merge Queue"
        actions={
          <StatusBadge
            status={mapHealthToStatus(mergeQueue.health)}
            size="sm"
          />
        }
      />
      <PanelBody>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
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
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="label">Queue State</span>
              <span className="text-xs text-bone font-mono">{mergeQueue.state}</span>
            </div>
            <Gauge value={completionRate} size="sm" />
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}
