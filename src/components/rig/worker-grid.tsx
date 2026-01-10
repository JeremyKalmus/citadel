"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui";
import { CostSparkline } from "@/components/cost";
import type { Polecat, Hook } from "@/lib/gastown";
import type { ChartWorkerCost as WorkerCost } from "@/lib/gastown/types";
import { Terminal } from "lucide-react";

interface WorkerGridProps {
  polecats: Polecat[];
  /** Optional hooks data from rig to determine work assignment */
  hooks?: Hook[];
  /** Optional cost data keyed by "rig/workerName" */
  workerCosts?: Map<string, WorkerCost>;
  isLoading?: boolean;
}

/**
 * Determine worker status using proper journey detection logic.
 *
 * This aligns with Gas Town's detectJourneyStage() which considers:
 * 1. Polecat state (working, blocked, done, etc.)
 * 2. Session running status
 * 3. Hook assignment (whether work is slung to the worker)
 *
 * Without hook context, workers without sessions show as "dead" even when
 * they just finished work successfully.
 */
function mapStateToStatus(state: string, sessionRunning: boolean, hasAssignedWork: boolean): Status {
  const normalizedState = state.toLowerCase();

  // Dead state - worker crashed
  if (normalizedState === "dead") return "dead";

  // Done state - work completed
  if (normalizedState === "done" && !sessionRunning) return "done";

  // Blocked state
  if (normalizedState === "blocked") return "blocked";

  // Working state - actively executing
  if ((normalizedState === "working" || normalizedState === "waiting") && sessionRunning) {
    return "active";
  }

  // Assigned but not started - work slung but session not running
  if (hasAssignedWork && !sessionRunning) return "thinking";

  // Processing states
  if (normalizedState === "thinking" || normalizedState === "processing") {
    return "thinking";
  }

  // Session running without clear state
  if (sessionRunning) return "active";

  // Idle - no work assigned, no session
  return "slow";
}

/**
 * Find hook for a polecat to determine if it has assigned work.
 * Hooks can reference workers by name alone or rig/name format.
 */
function findHookForPolecat(polecat: Polecat, hooks?: Hook[]): Hook | undefined {
  if (!hooks) return undefined;
  return hooks.find(
    (h) => h.agent === polecat.name || h.agent === `${polecat.rig}/${polecat.name}`
  );
}

export function WorkerGrid({ polecats, hooks, workerCosts, isLoading }: WorkerGridProps) {
  if (isLoading) {
    return (
      <Panel>
        <PanelHeader icon="terminal" title="Workers" />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">Loading workers...</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  if (!polecats || polecats.length === 0) {
    return (
      <Panel>
        <PanelHeader icon="terminal" title="Workers" />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Terminal className="w-8 h-8 text-ash mb-2" />
            <span className="text-ash">No workers assigned</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader
        icon="terminal"
        title="Workers"
        actions={
          <span className="text-xs text-ash">{polecats.length} total</span>
        }
      />
      <PanelBody className="p-0">
        <div className="divide-y divide-chrome-border/50">
          {polecats.map((polecat) => {
            const costKey = `${polecat.rig}/${polecat.name}`;
            const cost = workerCosts?.get(costKey);
            const hook = findHookForPolecat(polecat, hooks);
            const hasAssignedWork = hook?.has_work ?? false;

            return (
              <div
                key={polecat.name}
                className="flex items-center justify-between px-4 py-3 hover:bg-carbon-black/30 transition-mechanical"
              >
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-ash" />
                  <div>
                    <span className="font-mono text-sm text-bone">
                      {polecat.name}
                    </span>
                    {polecat.state && (
                      <span className="ml-2 text-xs text-ash">
                        {polecat.state}
                      </span>
                    )}
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
                    status={mapStateToStatus(polecat.state, polecat.session_running, hasAssignedWork)}
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
