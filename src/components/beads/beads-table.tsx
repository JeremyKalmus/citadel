"use client";

import Link from "next/link";
import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import type { Bead } from "@/lib/gastown";

interface BeadsTableProps {
  beads: Bead[] | null;
  isLoading?: boolean;
}

function mapBeadStatusToStatus(status: string): Status {
  switch (status.toLowerCase()) {
    case "in_progress":
    case "hooked":
      return "active";
    case "open":
      return "thinking";
    case "blocked":
      return "blocked";
    case "closed":
    case "done":
    case "tombstone":
      return "done";
    case "deferred":
      return "slow";
    default:
      return "thinking";
  }
}

function getPriorityLabel(priority: string): string {
  return priority; // Already in P0-P4 format
}

function getPriorityClass(priority: string): string {
  switch (priority) {
    case "P0":
      return "text-rust-orange";
    case "P1":
      return "text-fuel-yellow";
    case "P2":
      return "text-bone";
    case "P3":
    case "P4":
      return "text-ash";
    default:
      return "text-ash";
  }
}

function getTypeLabel(type: string): string {
  switch (type.toLowerCase()) {
    case "epic":
      return "Epic";
    case "task":
      return "Task";
    case "bug":
      return "Bug";
    case "feature":
      return "Feature";
    default:
      return type;
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function BeadsTable({ beads, isLoading }: BeadsTableProps) {
  if (isLoading) {
    return (
      <Panel>
        <PanelHeader icon="activity" title="Issues" />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">Loading issues...</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  if (!beads || beads.length === 0) {
    return (
      <Panel>
        <PanelHeader icon="activity" title="Issues" />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="check-circle" aria-label="No issues" size="xl" variant="muted" />
            <span className="text-ash mt-2">No issues found</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader
        icon="activity"
        title="Issues"
        actions={
          <span className="text-xs text-ash">
            {beads.length} {beads.length === 1 ? "issue" : "issues"}
          </span>
        }
      />
      <PanelBody className="p-0">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 px-4 py-2 border-b border-chrome-border/50 text-xs text-ash uppercase tracking-wide">
          <span>Issue</span>
          <span>Type</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Updated</span>
        </div>
        {/* Table rows */}
        <div className="divide-y divide-chrome-border/30">
          {beads.map((bead) => (
            <Link
              key={bead.id}
              href={`/beads/${bead.id}`}
              className="block hover:bg-carbon-black/30 transition-mechanical focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bone"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_80px_80px_80px_100px] gap-2 px-4 py-3 items-center">
                {/* Issue title and ID */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ash">{bead.id}</span>
                    {bead.assignee && (
                      <span className="text-xs text-fuel-yellow truncate">
                        @{bead.assignee.split("/").pop()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-bone truncate mt-0.5">{bead.title}</p>
                  {/* Mobile-only metadata */}
                  <div className="flex items-center gap-3 mt-1 md:hidden">
                    <span className="text-xs text-ash">{getTypeLabel(bead.type)}</span>
                    <span className={`text-xs ${getPriorityClass(bead.priority)}`}>
                      {getPriorityLabel(bead.priority)}
                    </span>
                    <StatusBadge status={mapBeadStatusToStatus(bead.status)} size="sm" />
                  </div>
                </div>
                {/* Type - desktop only */}
                <span className="hidden md:block text-xs text-ash">
                  {getTypeLabel(bead.type)}
                </span>
                {/* Priority - desktop only */}
                <span className={`hidden md:block text-xs font-mono ${getPriorityClass(bead.priority)}`}>
                  {getPriorityLabel(bead.priority)}
                </span>
                {/* Status - desktop only */}
                <div className="hidden md:block">
                  <StatusBadge status={mapBeadStatusToStatus(bead.status)} size="sm" />
                </div>
                {/* Updated - desktop only */}
                <span className="hidden md:block text-xs text-ash">
                  {formatDate(bead.updated)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
