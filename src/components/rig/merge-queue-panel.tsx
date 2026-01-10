"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, Gauge, Skeleton, SkeletonGauge, type Status } from "@/components/ui";
import type { MergeQueue, Rig } from "@/lib/gastown";
import { GitMerge, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react";

interface MergeQueuePanelProps {
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

function getStateIcon(state: string) {
  const stateNorm = state.toLowerCase();
  if (stateNorm === "processing" || stateNorm === "running") {
    return <Zap className="w-4 h-4 text-acid-green" />;
  }
  if (stateNorm === "idle" || stateNorm === "waiting") {
    return <Clock className="w-4 h-4 text-ash" />;
  }
  if (stateNorm === "blocked" || stateNorm === "error") {
    return <AlertTriangle className="w-4 h-4 text-rust-orange" />;
  }
  return <CheckCircle className="w-4 h-4 text-bone" />;
}

/**
 * MergeQueuePanel - Main Refinery View
 *
 * A comprehensive panel showing refinery status, merge queue health,
 * throughput metrics, and queue state. Combines health gauge with
 * queue statistics for full visibility into refinery operations.
 */
export function MergeQueuePanel({ rig, isLoading }: MergeQueuePanelProps) {
  const hasRefinery = rig?.has_refinery ?? false;
  const mergeQueue = rig?.mq;
  const throughputScore = calculateThroughputScore(mergeQueue);
  const overallStatus = !hasRefinery
    ? "dead"
    : mergeQueue
    ? mapHealthToStatus(mergeQueue.health)
    : "thinking";

  // Loading state
  if (isLoading) {
    return (
      <Panel>
        <PanelHeader
          icon="road"
          title="Refinery"
          actions={<Skeleton variant="rect" className="w-16 h-5" />}
        />
        <PanelBody>
          <div className="space-y-6">
            {/* Health gauge skeleton */}
            <div className="flex items-center gap-6">
              <SkeletonGauge size="lg" />
              <div className="flex-1 space-y-3">
                <Skeleton variant="text" className="w-24" />
                <Skeleton variant="text" className="w-20" />
              </div>
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-chrome-border/50">
              <Skeleton variant="stat" className="h-12" />
              <Skeleton variant="stat" className="h-12" />
              <Skeleton variant="stat" className="h-12" />
            </div>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  // No refinery configured
  if (!hasRefinery) {
    return (
      <Panel>
        <PanelHeader
          icon="road"
          title="Refinery"
          actions={<StatusBadge status="dead" size="sm" />}
        />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GitMerge className="w-10 h-10 text-ash mb-3" />
            <span className="text-bone font-medium">No Refinery Configured</span>
            <span className="text-ash/60 text-xs mt-1 max-w-[200px]">
              Configure a refinery to enable merge queue processing for this rig
            </span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  // No queue data available - refinery configured but not reporting
  if (!mergeQueue) {
    return (
      <Panel>
        <PanelHeader
          icon="road"
          title="Refinery"
          actions={<StatusBadge status="thinking" size="sm" />}
        />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GitMerge className="w-10 h-10 text-ash mb-3" />
            <span className="text-bone font-medium">Waiting for Data</span>
            <span className="text-ash/60 text-xs mt-1 max-w-[250px]">
              Refinery is configured but not reporting status. Check if the refinery agent is running.
            </span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  const total = mergeQueue.pending + mergeQueue.in_flight + mergeQueue.blocked;

  return (
    <Panel>
      <PanelHeader
        icon="road"
        title="Refinery"
        actions={<StatusBadge status={overallStatus} size="sm" />}
      />
      <PanelBody>
        <div className="space-y-6">
          {/* Health & Throughput Section */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <Gauge value={throughputScore} size="lg" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="label text-ash">Queue Health</p>
                <p className="data-value capitalize">{mergeQueue.health}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStateIcon(mergeQueue.state)}
                <span className="text-sm font-mono text-bone">{mergeQueue.state}</span>
              </div>
            </div>
          </div>

          {/* Queue Stats Grid */}
          <div className="pt-4 border-t border-chrome-border/50">
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
          </div>

          {/* Blocked Warning */}
          {mergeQueue.blocked > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-rust-orange/10 border border-rust-orange/30 rounded-sm">
              <AlertTriangle className="w-4 h-4 text-rust-orange flex-shrink-0" />
              <span className="text-xs text-rust-orange">
                {mergeQueue.blocked} PR{mergeQueue.blocked !== 1 ? "s" : ""} blocked in queue
              </span>
            </div>
          )}
        </div>
      </PanelBody>
    </Panel>
  );
}
