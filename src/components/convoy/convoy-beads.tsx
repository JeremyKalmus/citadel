"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import type { Bead } from "@/lib/gastown";
import { Circle } from "lucide-react";

interface ConvoyBeadsProps {
  beads: Bead[];
  isLoading?: boolean;
}

function mapBeadStatusToStatus(status: string): Status {
  switch (status.toLowerCase()) {
    case "in_progress":
    case "active":
      return "active";
    case "open":
    case "pending":
      return "thinking";
    case "blocked":
      return "blocked";
    case "closed":
    case "completed":
    case "done":
      return "done";
    case "hooked":
      return "active";
    default:
      return "thinking";
  }
}

function priorityLabel(priority: string): string {
  return priority; // Already in P0-P4 format
}

function priorityColor(priority: string): string {
  switch (priority) {
    case "P0":
      return "text-status-dead";
    case "P1":
      return "text-status-blocked";
    case "P2":
      return "text-status-slow";
    default:
      return "text-ash";
  }
}

interface BeadStats {
  open: number;
  in_progress: number;
  hooked: number;
  blocked: number;
  done: number;
  total: number;
}

function calculateStats(beads: Bead[]): BeadStats {
  const stats: BeadStats = {
    open: 0,
    in_progress: 0,
    hooked: 0,
    blocked: 0,
    done: 0,
    total: beads.length,
  };

  for (const bead of beads) {
    switch (bead.status.toLowerCase()) {
      case "open":
      case "pending":
        stats.open++;
        break;
      case "in_progress":
        stats.in_progress++;
        break;
      case "hooked":
        stats.hooked++;
        break;
      case "blocked":
        stats.blocked++;
        break;
      case "closed":
      case "completed":
      case "done":
        stats.done++;
        break;
    }
  }

  return stats;
}

function BeadStatsBar({ stats }: { stats: BeadStats }) {
  if (stats.total === 0) return null;

  return (
    <div className="flex items-center gap-3 text-xs">
      {stats.hooked > 0 && (
        <span className="flex items-center gap-1 text-status-active">
          <Circle className="w-2 h-2 fill-current" />
          {stats.hooked} hooked
        </span>
      )}
      {stats.in_progress > 0 && (
        <span className="flex items-center gap-1 text-status-thinking">
          <Circle className="w-2 h-2 fill-current" />
          {stats.in_progress} active
        </span>
      )}
      {stats.blocked > 0 && (
        <span className="flex items-center gap-1 text-status-blocked">
          <Circle className="w-2 h-2 fill-current" />
          {stats.blocked} blocked
        </span>
      )}
      {stats.open > 0 && (
        <span className="flex items-center gap-1 text-ash">
          <Circle className="w-2 h-2 fill-current" />
          {stats.open} open
        </span>
      )}
      {stats.done > 0 && (
        <span className="flex items-center gap-1 text-status-done">
          <Circle className="w-2 h-2 fill-current" />
          {stats.done} done
        </span>
      )}
    </div>
  );
}

export function ConvoyBeads({ beads, isLoading }: ConvoyBeadsProps) {
  if (isLoading) {
    return (
      <Panel>
        <PanelHeader icon="container" title="Linked Beads" />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">Loading beads...</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  if (!beads || beads.length === 0) {
    return (
      <Panel>
        <PanelHeader icon="container" title="Linked Beads" />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="container" aria-label="" variant="muted" size="lg" className="mb-2" />
            <span className="text-ash">No beads linked to this convoy</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  const stats = calculateStats(beads);

  return (
    <Panel>
      <PanelHeader
        icon="container"
        title="Linked Beads"
        actions={<BeadStatsBar stats={stats} />}
      />
      <PanelBody className="p-0">
        <div className="divide-y divide-chrome-border/50">
          {beads.map((bead) => (
            <div
              key={bead.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-carbon-black/30 transition-mechanical"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${priorityColor(bead.priority)}`}>
                    {priorityLabel(bead.priority)}
                  </span>
                  <span className="font-mono text-sm text-bone truncate">
                    {bead.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-ash font-mono">{bead.id}</span>
                  {bead.assignee && (
                    <span className="text-xs text-ash">
                      assigned: {bead.assignee.split("/").pop()}
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge
                status={mapBeadStatusToStatus(bead.status)}
                size="sm"
              />
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
