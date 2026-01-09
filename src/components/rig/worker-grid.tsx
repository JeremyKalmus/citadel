"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui";
import type { Polecat } from "@/lib/gastown";
import { Terminal } from "lucide-react";

interface WorkerGridProps {
  polecats: Polecat[];
  isLoading?: boolean;
}

function mapStateToStatus(state: string, sessionRunning: boolean): Status {
  if (!sessionRunning) return "dead";
  switch (state.toLowerCase()) {
    case "active":
    case "running":
      return "active";
    case "thinking":
    case "processing":
      return "thinking";
    case "idle":
    case "waiting":
      return "slow";
    case "blocked":
      return "blocked";
    case "done":
    case "complete":
      return "done";
    default:
      return sessionRunning ? "active" : "unresponsive";
  }
}

export function WorkerGrid({ polecats, isLoading }: WorkerGridProps) {
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
          {polecats.map((polecat) => (
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
              <StatusBadge
                status={mapStateToStatus(polecat.state, polecat.session_running)}
                size="sm"
              />
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
