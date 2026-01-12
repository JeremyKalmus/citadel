"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui";
import { ConvoyJourneyCompact } from "@/components/journey";
import { CostSparkline } from "@/components/cost";
import type { Convoy } from "@/lib/gastown";
import type { ConvoyJourneyState, ConvoyCost } from "@/lib/gastown/types";
import { JourneyStage } from "@/lib/gastown/types";
import { Truck } from "lucide-react";

interface ConvoyListProps {
  convoys: Convoy[];
  /** Optional cost data keyed by convoy ID */
  convoyCosts?: Map<string, ConvoyCost>;
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
 * Derive journey state from convoy status.
 * This is a placeholder until we have proper journey tracking via convoy API.
 */
function deriveConvoyJourneyState(convoy: Convoy): ConvoyJourneyState {
  // Default distribution based on convoy status
  const status = convoy.status.toLowerCase();

  // Create a mock distribution based on status
  // In production, this would come from the API
  let stageDistribution: Record<JourneyStage, number> = {
    [JourneyStage.QUEUED]: 0,
    [JourneyStage.CLAIMED]: 0,
    [JourneyStage.WORKING]: 0,
    [JourneyStage.PR_READY]: 0,
    [JourneyStage.REFINERY]: 0,
    [JourneyStage.MERGED]: 0,
  };

  let progressPercent = 0;
  let completedCount = 0;
  const issueCount = 1; // Placeholder - would come from API

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
    issues: [], // Would be populated from API
  };
}

export function ConvoyList({ convoys, convoyCosts, isLoading }: ConvoyListProps) {
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
            const journeyState = deriveConvoyJourneyState(convoy);
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
