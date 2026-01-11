"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, StatusBadge, type Status } from "@/components/ui";
import type { Bead as GasTownBead, BeadPriority } from "@/lib/gastown";
import { GitMerge } from "lucide-react";

// Re-export the Bead type from gastown for consumers
export type Bead = GasTownBead & {
  blockedBy?: string[];
  description?: string;
  labels?: string[];
  convoy?: string;
  rig?: string;
  /** Whether this bead is in the refinery queue (MERGE_READY) */
  inRefinery?: boolean;
  /** Refinery queue position (1-based) */
  refineryPosition?: number;
  /** Current refinery operation */
  refineryOperation?: "queued" | "rebasing" | "testing" | "merging";
};

// Helper to convert priority string to number
function priorityToNumber(priority: BeadPriority): number {
  return parseInt(priority.replace('P', ''), 10);
}

/**
 * Stats for a bead group
 */
export interface BeadGroupStats {
  total: number;
  done: number;
  active: number;
  blocked: number;
}

/**
 * A group of beads (either rig-level or epic-level)
 */
export interface BeadGroup {
  id: string;
  label: string;
  type: "rig" | "epic";
  beads: Bead[];
  children?: BeadGroup[];
  stats: BeadGroupStats;
}

export interface BeadsTreeProps {
  beads: Bead[];
  groupBy?: "rig" | "epic" | "status" | "priority";
  expandedGroups?: Set<string>;
  onToggleGroup?: (groupId: string) => void;
  onBeadSelect?: (bead: Bead) => void;
  selectedBeadId?: string;
  className?: string;
}

const STORAGE_KEY = "beads-tree-expanded";

/**
 * Map bead status to StatusBadge status
 */
function beadStatusToStatus(status: string): Status {
  switch (status.toLowerCase()) {
    case "open":
      return "thinking";
    case "in_progress":
    case "hooked":
      return "active";
    case "blocked":
      return "blocked";
    case "closed":
    case "done":
    case "completed":
      return "done";
    case "merge_ready":
    case "pr_ready":
      return "active"; // Will show refinery indicator separately
    default:
      return "thinking";
  }
}

/**
 * Priority badge styling
 */
function getPriorityStyle(priority: number): string {
  switch (priority) {
    case 0:
      return "text-status-dead bg-status-dead/10 border-status-dead/30";
    case 1:
      return "text-rust-orange bg-rust-orange/10 border-rust-orange/30";
    case 2:
      return "text-fuel-yellow bg-fuel-yellow/10 border-fuel-yellow/30";
    case 3:
      return "text-ash bg-ash/10 border-ash/30";
    case 4:
      return "text-ash/50 bg-ash/5 border-ash/20";
    default:
      return "text-ash bg-ash/10 border-ash/30";
  }
}

/**
 * Check if a bead is in MERGE_READY state
 */
function isMergeReady(status: string): boolean {
  const normalized = status.toLowerCase();
  return (
    normalized === "merge_ready" ||
    normalized === "pr_ready" ||
    normalized === "review"
  );
}

/**
 * Get refinery operation label
 */
function getRefineryLabel(
  operation?: "queued" | "rebasing" | "testing" | "merging"
): string {
  switch (operation) {
    case "rebasing":
      return "Rebasing";
    case "testing":
      return "Testing";
    case "merging":
      return "Merging";
    case "queued":
    default:
      return "In Queue";
  }
}

/**
 * RefineryIndicator - Shows refinery status for MERGE_READY issues
 *
 * Displays a compact badge indicating the issue is in the refinery queue,
 * with optional position and current operation.
 */
interface RefineryIndicatorProps {
  position?: number;
  operation?: "queued" | "rebasing" | "testing" | "merging";
  className?: string;
}

function RefineryIndicator({
  position,
  operation,
  className,
}: RefineryIndicatorProps) {
  const operationColors: Record<string, string> = {
    queued: "text-fuel-yellow bg-fuel-yellow/10 border-fuel-yellow/30",
    rebasing: "text-acid-green bg-acid-green/10 border-acid-green/30",
    testing: "text-status-thinking bg-status-thinking/10 border-status-thinking/30",
    merging: "text-acid-green bg-acid-green/10 border-acid-green/30",
  };

  const colorClass = operationColors[operation || "queued"];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border text-[10px] font-medium uppercase tracking-wide",
        colorClass,
        className
      )}
      title={`Refinery: ${getRefineryLabel(operation)}${position ? ` (#${position})` : ""}`}
    >
      <GitMerge className="w-3 h-3" />
      {position !== undefined && <span>#{position}</span>}
      {!position && operation && <span>{getRefineryLabel(operation)}</span>}
    </span>
  );
}

/**
 * Calculate stats for a group of beads
 */
function calculateGroupStats(beads: Bead[]): BeadGroupStats {
  return beads.reduce(
    (acc, bead) => {
      acc.total++;
      const status = bead.status.toLowerCase();
      if (status === "closed" || status === "done" || status === "completed") {
        acc.done++;
      } else if (status === "blocked") {
        acc.blocked++;
      } else if (status === "in_progress" || status === "hooked") {
        acc.active++;
      }
      return acc;
    },
    { total: 0, done: 0, active: 0, blocked: 0 }
  );
}

/**
 * Group beads into hierarchical structure (Rig -> Epic -> Issues)
 */
function groupBeadsHierarchically(beads: Bead[]): BeadGroup[] {
  // Group by rig first
  const rigMap = new Map<string, Bead[]>();

  for (const bead of beads) {
    const rig = bead.rig || "unknown";
    if (!rigMap.has(rig)) {
      rigMap.set(rig, []);
    }
    rigMap.get(rig)!.push(bead);
  }

  // Convert to BeadGroup structure
  const groups: BeadGroup[] = [];

  for (const [rigName, rigBeads] of rigMap) {
    // Separate epics and issues
    const epics = rigBeads.filter((b) => b.type === "epic");
    const issues = rigBeads.filter((b) => b.type !== "epic");

    // Group issues by parent epic
    const epicMap = new Map<string, Bead[]>();
    const orphanIssues: Bead[] = [];

    for (const issue of issues) {
      if (issue.parent) {
        if (!epicMap.has(issue.parent)) {
          epicMap.set(issue.parent, []);
        }
        epicMap.get(issue.parent)!.push(issue);
      } else {
        orphanIssues.push(issue);
      }
    }

    // Build epic children groups
    const epicGroups: BeadGroup[] = [];

    for (const epic of epics) {
      const epicIssues = epicMap.get(epic.id) || [];
      const allBeads = [epic, ...epicIssues];

      epicGroups.push({
        id: `${rigName}/${epic.id}`,
        label: epic.title,
        type: "epic",
        beads: allBeads,
        stats: calculateGroupStats(allBeads),
      });
    }

    // Add orphan issues as a separate group if any
    if (orphanIssues.length > 0) {
      epicGroups.push({
        id: `${rigName}/_orphans`,
        label: "Ungrouped Issues",
        type: "epic",
        beads: orphanIssues,
        stats: calculateGroupStats(orphanIssues),
      });
    }

    groups.push({
      id: rigName,
      label: rigName,
      type: "rig",
      beads: rigBeads,
      children: epicGroups,
      stats: calculateGroupStats(rigBeads),
    });
  }

  return groups;
}

/**
 * Load expanded state from localStorage
 */
function loadExpandedState(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore storage errors
  }
  return new Set();
}

/**
 * Save expanded state to localStorage
 */
function saveExpandedState(expanded: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Single bead row component
 */
function BeadRow({
  bead,
  isSelected,
  onSelect,
  depth = 0,
}: {
  bead: Bead;
  isSelected: boolean;
  onSelect: (bead: Bead) => void;
  depth?: number;
}) {
  const status = beadStatusToStatus(bead.status);
  const hasBlockers = (bead.blockedBy?.length ?? 0) > 0;
  const showRefinery = bead.inRefinery || isMergeReady(bead.status);

  return (
    <Link
      href={`/bead/${bead.id}`}
      className={cn(
        "group flex items-center gap-3 py-2 px-3 transition-mechanical cursor-pointer",
        "border-l-2",
        isSelected
          ? "bg-fuel-yellow/10 border-l-fuel-yellow"
          : "hover:bg-carbon-black/30 border-l-transparent"
      )}
      style={{ paddingLeft: `${16 + depth * 16}px` }}
      onClick={(e) => {
        e.preventDefault();
        onSelect(bead);
      }}
    >
      {/* ID */}
      <span className="font-mono text-xs text-ash w-20 shrink-0 truncate">
        {bead.id}
      </span>

      {/* Title */}
      <span className="flex-1 text-sm text-bone truncate">{bead.title}</span>

      {/* Type badge (only for epics) */}
      {bead.type === "epic" && (
        <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-sm border text-fuel-yellow bg-fuel-yellow/10 border-fuel-yellow/30">
          EPIC
        </span>
      )}

      {/* Refinery indicator for MERGE_READY issues */}
      {showRefinery && (
        <RefineryIndicator
          position={bead.refineryPosition}
          operation={bead.refineryOperation}
        />
      )}

      {/* Status */}
      <StatusBadge status={status} size="sm" showLabel={false} />

      {/* Priority */}
      <span
        className={cn(
          "text-[10px] font-medium px-1.5 py-0.5 rounded-sm border shrink-0",
          getPriorityStyle(priorityToNumber(bead.priority))
        )}
      >
        {bead.priority}
      </span>

      {/* Assignee */}
      <span className="text-xs text-ash w-16 shrink-0 truncate text-right">
        {bead.assignee || "\u2014"}
      </span>

      {/* Blocked indicator */}
      {hasBlockers && (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm border text-rust-orange bg-rust-orange/10 border-rust-orange/30 shrink-0">
          {bead.blockedBy?.length}
        </span>
      )}
    </Link>
  );
}

/**
 * Group header component with collapse toggle
 */
function GroupHeader({
  group,
  isExpanded,
  onToggle,
  depth = 0,
}: {
  group: BeadGroup;
  isExpanded: boolean;
  onToggle: () => void;
  depth?: number;
}) {
  const progressPercent =
    group.stats.total > 0
      ? Math.round((group.stats.done / group.stats.total) * 100)
      : 0;

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-3 py-2.5 px-3 transition-mechanical",
        "hover:bg-carbon-black/30",
        group.type === "rig"
          ? "bg-gunmetal border-b border-chrome-border/50"
          : "bg-transparent"
      )}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
    >
      {/* Expand/collapse chevron */}
      <Icon
        name={isExpanded ? "chevron-down" : "chevron-right"}
        aria-label={isExpanded ? "Collapse" : "Expand"}
        size="sm"
        variant="muted"
        className="transition-transform duration-150"
      />

      {/* Group icon */}
      {group.type === "rig" && (
        <Icon name="container" aria-label="Rig" size="sm" variant="muted" />
      )}

      {/* Label */}
      <span
        className={cn(
          "flex-1 text-left truncate",
          group.type === "rig"
            ? "section-header text-bone"
            : "text-sm font-medium text-bone/90"
        )}
      >
        {group.label}
      </span>

      {/* Progress bar (for epics) */}
      {group.type === "epic" && group.stats.total > 0 && (
        <div className="w-24 h-1.5 bg-carbon-black/50 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-acid-green transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Stats */}
      <span className="text-xs text-ash shrink-0">
        {group.stats.done}/{group.stats.total}
        {group.stats.blocked > 0 && (
          <span className="text-rust-orange ml-1">
            ({group.stats.blocked} blocked)
          </span>
        )}
      </span>
    </button>
  );
}

/**
 * BeadsTree - Hierarchical collapsible tree view for beads
 *
 * Displays beads organized by Rig -> Epic -> Issue with collapsible groups,
 * progress indicators, and bead selection support.
 *
 * Per spec section 4.2:
 * - Default: Group by Rig -> Epic (two-level hierarchy)
 * - Collapsible groups with chevron toggle
 * - Progress indicator per group (X/Y done)
 * - Indentation: 16px per level
 * - Smooth expand/collapse animation (150ms)
 * - Remember expanded state in localStorage
 */
export function BeadsTree({
  beads,
  groupBy = "rig",
  expandedGroups: controlledExpanded,
  onToggleGroup,
  onBeadSelect,
  selectedBeadId,
  className,
}: BeadsTreeProps) {
  // Internal expanded state (used when uncontrolled)
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(() =>
    loadExpandedState()
  );

  // Use controlled or internal state
  const expanded = controlledExpanded ?? internalExpanded;

  // Load expanded state from localStorage on mount
  useEffect(() => {
    if (!controlledExpanded) {
      setInternalExpanded(loadExpandedState());
    }
  }, [controlledExpanded]);

  // Save expanded state to localStorage
  useEffect(() => {
    if (!controlledExpanded) {
      saveExpandedState(internalExpanded);
    }
  }, [internalExpanded, controlledExpanded]);

  const handleToggle = useCallback(
    (groupId: string) => {
      if (onToggleGroup) {
        onToggleGroup(groupId);
      } else {
        setInternalExpanded((prev) => {
          const next = new Set(prev);
          if (next.has(groupId)) {
            next.delete(groupId);
          } else {
            next.add(groupId);
          }
          return next;
        });
      }
    },
    [onToggleGroup]
  );

  const handleBeadSelect = useCallback(
    (bead: Bead) => {
      onBeadSelect?.(bead);
    },
    [onBeadSelect]
  );

  // Group beads hierarchically
  const groups = groupBeadsHierarchically(beads);

  // Render group recursively
  const renderGroup = (group: BeadGroup, depth: number = 0) => {
    const isExpanded = expanded.has(group.id);
    const beadsInGroup = group.children
      ? []
      : group.beads.filter((b) => b.type !== "epic");
    const epicsInGroup = group.beads.filter((b) => b.type === "epic");

    return (
      <div key={group.id} className="transition-all duration-150">
        <GroupHeader
          group={group}
          isExpanded={isExpanded}
          onToggle={() => handleToggle(group.id)}
          depth={depth}
        />

        {isExpanded && (
          <div className="overflow-hidden animate-in slide-in-from-top-1 duration-150">
            {/* Render child groups (epics under rigs) */}
            {group.children?.map((child) => renderGroup(child, depth + 1))}

            {/* Render beads directly if no children (issues under epic) */}
            {!group.children &&
              beadsInGroup.map((bead) => (
                <BeadRow
                  key={bead.id}
                  bead={bead}
                  isSelected={selectedBeadId === bead.id}
                  onSelect={handleBeadSelect}
                  depth={depth + 1}
                />
              ))}

            {/* Show epic itself at the top of its group */}
            {!group.children &&
              epicsInGroup.map((bead) => (
                <BeadRow
                  key={bead.id}
                  bead={bead}
                  isSelected={selectedBeadId === bead.id}
                  onSelect={handleBeadSelect}
                  depth={depth + 1}
                />
              ))}
          </div>
        )}
      </div>
    );
  };

  if (beads.length === 0) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <Icon
          name="circle"
          aria-label="No beads"
          size="xl"
          variant="muted"
          className="mx-auto mb-2"
        />
        <p className="text-sm text-ash">No beads found</p>
      </div>
    );
  }

  return (
    <div className={cn("divide-y divide-chrome-border/30", className)}>
      {groups.map((group) => renderGroup(group, 0))}
    </div>
  );
}
