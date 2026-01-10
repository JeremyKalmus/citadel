"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, Gauge, Skeleton, SkeletonGauge, type Status } from "@/components/ui";
import type { MergeQueue, Rig } from "@/lib/gastown";
import { Cog } from "lucide-react";

interface RefineryHealthProps {
  rig?: Rig | null;
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

function calculateThroughputScore(mergeQueue?: MergeQueue | null): number {
  if (!mergeQueue) return 0;

  const total = mergeQueue.pending + mergeQueue.in_flight + mergeQueue.blocked;
  if (total === 0) return 100;

  // Score based on blocked ratio and health
  const blockedRatio = mergeQueue.blocked / total;
  const inFlightRatio = mergeQueue.in_flight / total;

  // Base score from health
  let healthScore = 100;
  switch (mergeQueue.health.toLowerCase()) {
    case "healthy":
    case "ok":
      healthScore = 100;
      break;
    case "degraded":
      healthScore = 70;
      break;
    case "slow":
      healthScore = 50;
      break;
    case "blocked":
      healthScore = 30;
      break;
    case "down":
    case "error":
      healthScore = 0;
      break;
  }

  // Adjust by blocked ratio (blocked items reduce score)
  const blockedPenalty = blockedRatio * 40;

  // Bonus for active throughput
  const throughputBonus = inFlightRatio * 20;

  return Math.round(Math.max(0, Math.min(100, healthScore - blockedPenalty + throughputBonus)));
}

/**
 * RefineryHealth - Shows refinery status and merge queue health
 *
 * Displays whether the refinery is configured, its health status,
 * and a throughput gauge based on queue state.
 */
export function RefineryHealth({ rig, isLoading }: RefineryHealthProps) {
  const hasRefinery = rig?.has_refinery ?? false;
  const mergeQueue = rig?.mq;
  const throughputScore = calculateThroughputScore(mergeQueue);
  const overallStatus = !hasRefinery
    ? "dead"
    : mergeQueue
    ? mapHealthToStatus(mergeQueue.health)
    : "thinking";

  if (isLoading) {
    return (
      <Panel>
        <PanelHeader
          icon="cog"
          title="Refinery Health"
          actions={<Skeleton variant="rect" className="w-16 h-5" />}
        />
        <PanelBody>
          <div className="flex items-center gap-6">
            <SkeletonGauge size="lg" />
            <div className="flex-1 space-y-3">
              <Skeleton variant="text" className="w-24" />
              <Skeleton variant="text" className="w-20" />
            </div>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  if (!hasRefinery) {
    return (
      <Panel>
        <PanelHeader
          icon="cog"
          title="Refinery Health"
          actions={<StatusBadge status="dead" size="sm" />}
        />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Cog className="w-8 h-8 text-ash mb-2" />
            <span className="text-ash">No refinery configured</span>
            <span className="text-ash/60 text-xs mt-1">Configure a refinery to enable merge queue processing</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  // Refinery configured but no merge queue data available yet
  // This can happen when the refinery agent isn't running or hasn't reported status
  if (!mergeQueue) {
    return (
      <Panel>
        <PanelHeader
          icon="cog"
          title="Refinery Health"
          actions={<StatusBadge status="thinking" size="sm" />}
        />
        <PanelBody>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <Gauge value={0} size="lg" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="label text-ash">Queue Health</p>
                <p className="data-value text-ash">Waiting for data</p>
              </div>
              <div>
                <p className="label text-ash">Status</p>
                <p className="text-sm text-ash/80">
                  Refinery configured but not reporting. Check if refinery agent is running.
                </p>
              </div>
            </div>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader
        icon="cog"
        title="Refinery Health"
        actions={<StatusBadge status={overallStatus} size="sm" />}
      />
      <PanelBody>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <Gauge value={throughputScore} size="lg" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="label text-ash">Queue Health</p>
              <p className="data-value capitalize">{mergeQueue.health}</p>
            </div>
            <div>
              <p className="label text-ash">Queue State</p>
              <p className="text-sm font-mono text-bone">{mergeQueue.state}</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span>
                <span className="text-fuel-yellow font-mono">{mergeQueue.pending}</span>
                <span className="text-ash ml-1">pending</span>
              </span>
              <span>
                <span className="text-acid-green font-mono">{mergeQueue.in_flight}</span>
                <span className="text-ash ml-1">active</span>
              </span>
              {mergeQueue.blocked > 0 && (
                <span>
                  <span className="text-rust-orange font-mono">{mergeQueue.blocked}</span>
                  <span className="text-ash ml-1">blocked</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}
