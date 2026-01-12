"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import type { Bead } from "@/lib/gastown";
import { Circle, Container, User } from "lucide-react";
import Link from "next/link";

/**
 * Parse a worker path to extract rig and worker name.
 * Examples:
 * - "citadel/polecats/furiosa" → { rig: "citadel", worker: "furiosa", type: "polecat" }
 * - "citadel/crew/alpha" → { rig: "citadel", worker: "alpha", type: "crew" }
 */
function parseWorkerPath(path?: string): { rig: string; worker: string; type: string } | null {
  if (!path) return null;

  const parts = path.split("/");
  if (parts.length >= 3) {
    return {
      rig: parts[0],
      worker: parts[parts.length - 1],
      type: parts[1] === "polecats" ? "polecat" : parts[1] === "crew" ? "crew" : "worker",
    };
  }
  // Simple name without path
  return { rig: "", worker: path, type: "worker" };
}

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

function priorityLabel(priority: number): string {
  return `P${priority}`; // Convert number to P0-P4 format
}

function priorityColor(priority: number): string {
  switch (priority) {
    case 0:
      return "text-status-dead";
    case 1:
      return "text-status-blocked";
    case 2:
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
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-ash font-mono">{bead.id}</span>
                  {bead.assignee && (() => {
                    const parsed = parseWorkerPath(bead.assignee);
                    if (!parsed) return null;

                    return (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-ash">→</span>
                        {/* Rig indicator */}
                        {parsed.rig && (
                          <Link
                            href={`/rig/${parsed.rig}`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gunmetal hover:bg-chrome-border/50 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Container className="w-2.5 h-2.5 text-ash" />
                            <span className="text-[10px] text-ash font-mono">{parsed.rig}</span>
                          </Link>
                        )}
                        {/* Worker indicator */}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-fuel-yellow/10 border border-fuel-yellow/20">
                          <User className="w-2.5 h-2.5 text-fuel-yellow" />
                          <span className="text-[10px] text-fuel-yellow font-mono">{parsed.worker}</span>
                        </span>
                      </div>
                    );
                  })()}
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
