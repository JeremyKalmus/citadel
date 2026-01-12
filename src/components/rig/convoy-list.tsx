"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui";
import { ConvoyJourneyCompact } from "@/components/journey";
import { CostSparkline } from "@/components/cost";
import type { Convoy, Bead } from "@/lib/gastown";
import type { ConvoyJourneyState, ConvoyCost } from "@/lib/gastown/types";
import { JourneyStage } from "@/lib/gastown/types";
import { Truck } from "lucide-react";

interface ConvoyListProps {
  convoys: Convoy[];
  /** Optional cost data keyed by convoy ID */
  convoyCosts?: Map<string, ConvoyCost>;
  /** Optional beads data keyed by convoy ID */
  convoyBeads?: Map<string, Bead[]>;
  isLoading?: boolean;
}

function mapConvoyStatusToStatus(status: string): Status {
  switch (status.toLowerCase()) {
    case "active":
    case "running":
      return "active";
    case "open":
    case "pending":
    case "queued":
      return "thinking";
    case "blocked":
      return "blocked";
    case "completed":
    case "done":
      return "done";
    case "failed":
    case "error":
      return "dead";
    default:
      return "thinking";
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

/**
 * Map bead status to journey stage.
 */
function beadStatusToJourneyStage(status: string): JourneyStage {
  switch (status.toLowerCase()) {
    case "open":
      return JourneyStage.QUEUED;
    case "in_progress":
    case "hooked":
      return JourneyStage.WORKING;
    case "blocked":
      return JourneyStage.WORKING; // Blocked issues are still in working stage
    case "deferred":
      return JourneyStage.QUEUED; // Deferred treated as queued
    case "closed":
    case "done":
    case "completed":
      return JourneyStage.MERGED;
    default:
      return JourneyStage.QUEUED;
  }
}

/**
 * Derive journey state from convoy status and optional beads data.
 * When beads are provided, calculates real values from bead statuses.
 * Falls back to status-based estimation when beads are not available.
 */
function deriveConvoyJourneyState(convoy: Convoy, beads?: Bead[]): ConvoyJourneyState {
  const status = convoy.status.toLowerCase();

  // Initialize stage distribution
  const stageDistribution: Record<JourneyStage, number> = {
    [JourneyStage.QUEUED]: 0,
    [JourneyStage.CLAIMED]: 0,
    [JourneyStage.WORKING]: 0,
    [JourneyStage.PR_READY]: 0,
    [JourneyStage.REFINERY]: 0,
    [JourneyStage.MERGED]: 0,
  };

  // When beads are available, calculate real values
  if (beads && beads.length > 0) {
    const issueCount = beads.length;
    let completedCount = 0;

    // Count beads by stage
    for (const bead of beads) {
      const stage = beadStatusToJourneyStage(bead.status);
      stageDistribution[stage]++;
      if (bead.status === "closed") {
        completedCount++;
      }
    }

    const progressPercent = Math.round((completedCount / issueCount) * 100);

    return {
      convoyId: convoy.id,
      title: convoy.title || convoy.id,
      progressPercent,
      issueCount,
      completedCount,
      stageDistribution,
      issues: [], // Would be populated with full journey info
    };
  }

  // Fallback: estimate from convoy status when beads not available
  let progressPercent = 0;
  let completedCount = 0;
  const issueCount = 0; // Unknown without beads

  switch (status) {
    case "completed":
    case "done":
      stageDistribution[JourneyStage.MERGED] = 1;
      progressPercent = 100;
      completedCount = 1;
      break;
    case "active":
    case "running":
      stageDistribution[JourneyStage.WORKING] = 1;
      progressPercent = 50;
      break;
    case "open":
    case "pending":
    case "queued":
      stageDistribution[JourneyStage.QUEUED] = 1;
      progressPercent = 0;
      break;
    case "blocked":
      stageDistribution[JourneyStage.WORKING] = 1;
      progressPercent = 40;
      break;
    default:
      stageDistribution[JourneyStage.QUEUED] = 1;
      progressPercent = 0;
  }

  return {
    convoyId: convoy.id,
    title: convoy.title || convoy.id,
    progressPercent,
    issueCount,
    completedCount,
    stageDistribution,
    issues: [],
  };
}

export function ConvoyList({ convoys, convoyCosts, convoyBeads, isLoading }: ConvoyListProps) {
  if (isLoading) {
    return (
      <Panel>
        <PanelHeader icon="truck" title="Convoys" />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">Loading convoys...</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  if (!convoys || convoys.length === 0) {
    return (
      <Panel>
        <PanelHeader icon="truck" title="Convoys" />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Truck className="w-8 h-8 text-ash mb-2" />
            <span className="text-ash">No active convoys</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  const activeCount = convoys.filter(
    (c) => c.status.toLowerCase() === "active"
  ).length;

  return (
    <Panel>
      <PanelHeader
        icon="truck"
        title="Convoys"
        actions={
          <span className="text-xs text-ash">
            {activeCount} active / {convoys.length} total
          </span>
        }
      />
      <PanelBody className="p-0">
        <div className="divide-y divide-chrome-border/50">
          {convoys.map((convoy) => {
            const beads = convoyBeads?.get(convoy.id);
            const journeyState = deriveConvoyJourneyState(convoy, beads);
            const cost = convoyCosts?.get(convoy.id);

            return (
              <div
                key={convoy.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-carbon-black/30 transition-mechanical"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-bone truncate">
                      {convoy.title || convoy.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-ash font-mono">
                      {convoy.id}
                    </span>
                    <span className="text-xs text-ash">
                      {formatDate(convoy.created_at)}
                    </span>
                    {/* Journey progress indicator */}
                    <ConvoyJourneyCompact convoy={journeyState} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {cost && (
                    <CostSparkline
                      tokens={cost.totalTokens}
                      costUsd={cost.estimatedCostUsd}
                      size="sm"
                    />
                  )}
                  <StatusBadge
                    status={mapConvoyStatusToStatus(convoy.status)}
                    size="sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </PanelBody>
    </Panel>
  );
}
