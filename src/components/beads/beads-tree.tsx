"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Icon, GaugeCompact, type Status } from "@/components/ui";
import type { Bead as GasTownBead, BeadPriority } from "@/lib/gastown";

/**
 * Sort configuration
 */
type SortColumn = "type" | "status" | "priority" | "assignee" | "activity" | "id";
type SortDirection = "asc" | "desc";

/**
 * Re-export GasTown Bead type for external use
 */
export type Bead = GasTownBead;

/**
 * Convert priority string (P0-P4) to number (0-4)
 */
function priorityToNumber(priority: BeadPriority | string | number): number {
  if (typeof priority === "number") return priority;
  const match = String(priority).match(/P?(\d)/i);
  return match ? parseInt(match[1], 10) : 2;
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
    case "deferred":
      return "slow";
    case "closed":
    case "done":
    case "completed":
      return "done";
    default:
      return "thinking";
  }
}

/**
 * Priority badge styling
 */
function getPriorityStyle(priority: BeadPriority | string | number): string {
  const p = priorityToNumber(priority);
  switch (p) {
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
 * Group beads by epic (for use when beads are already filtered to a single rig)
 */
function groupBeadsByEpic(beads: Bead[]): BeadGroup[] {
  // Separate epics and issues
  const epics = beads.filter((b) => b.issue_type === "epic");
  const issues = beads.filter((b) => b.issue_type !== "epic");

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

  // Build epic groups
  const groups: BeadGroup[] = [];

  for (const epic of epics) {
    const epicIssues = epicMap.get(epic.id) || [];
    const allBeads = [epic, ...epicIssues];

    groups.push({
      id: epic.id,
      label: epic.title,
      type: "epic",
      beads: allBeads,
      stats: calculateGroupStats(allBeads),
    });
  }

  // Add orphan issues as a separate group if any
  if (orphanIssues.length > 0) {
    groups.push({
      id: "_orphans",
      label: "Ungrouped Issues",
      type: "epic",
      beads: orphanIssues,
      stats: calculateGroupStats(orphanIssues),
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
 * Format relative time for activity column
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

/**
 * Get status sort order (for sorting)
 */
function getStatusOrder(status: string): number {
  switch (status.toLowerCase()) {
    case "in_progress":
    case "hooked":
      return 0; // Active first
    case "blocked":
      return 1;
    case "open":
      return 2;
    case "deferred":
      return 3; // Deferred after open
    case "closed":
    case "done":
    case "completed":
      return 4; // Done last
    default:
      return 5;
  }
}

/**
 * Get status label and color
 */
function getStatusInfo(status: string): { label: string; color: string } {
  switch (status.toLowerCase()) {
    case "open":
      return { label: "Open", color: "text-ash" };
    case "in_progress":
    case "hooked":
      return { label: "In Progress", color: "text-fuel-yellow" };
    case "blocked":
      return { label: "Blocked", color: "text-rust-orange" };
    case "deferred":
      return { label: "Deferred", color: "text-chrome-border" };
    case "closed":
    case "done":
    case "completed":
      return { label: "Done", color: "text-acid-green" };
    default:
      return { label: status, color: "text-ash" };
  }
}

/**
 * Get type badge styling
 */
function getTypeBadge(type: string): { label: string; style: string } {
  switch (type.toLowerCase()) {
    case "epic":
      return {
        label: "EPIC",
        style: "text-fuel-yellow bg-fuel-yellow/10 border-fuel-yellow/30",
      };
    case "feature":
      return {
        label: "Feature",
        style: "text-acid-green bg-acid-green/10 border-acid-green/30",
      };
    case "bug":
      return {
        label: "Bug",
        style: "text-rust-orange bg-rust-orange/10 border-rust-orange/30",
      };
    case "chore":
      return {
        label: "Chore",
        style: "text-chrome-border bg-chrome-border/10 border-chrome-border/30",
      };
    case "task":
    default:
      return {
        label: "Task",
        style: "text-ash bg-ash/10 border-ash/30",
      };
  }
}

/**
 * Epic row component - visually distinct header for the epic
 */
function EpicRow({
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
  const statusInfo = getStatusInfo(bead.status);

  return (
    <button
      onClick={() => onSelect(bead)}
      className={cn(
        "w-full flex items-center gap-2 py-3 px-3 transition-mechanical cursor-pointer",
        "border-l-4 bg-gunmetal/50",
        isSelected
          ? "border-l-fuel-yellow bg-fuel-yellow/10"
          : "border-l-fuel-yellow/50 hover:bg-carbon-black/30"
      )}
      style={{ paddingLeft: `${16 + depth * 16}px` }}
    >
      {/* Epic icon */}
      <Icon name="layers" aria-label="Epic" size="sm" className="text-fuel-yellow shrink-0" />

      {/* Epic title */}
      <span className="flex-1 text-sm font-medium text-bone truncate text-left">
        {bead.title}
      </span>

      {/* Right side metadata - aligned with BeadRow columns */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Type badge - fixed width (same as BeadRow) */}
        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border w-14 text-center text-fuel-yellow bg-fuel-yellow/10 border-fuel-yellow/30">
          EPIC
        </span>

        {/* Status label - fixed width (same as BeadRow) */}
        <span className={cn("text-xs w-20 text-center font-medium", statusInfo.color)}>
          {statusInfo.label}
        </span>

        {/* Priority slot - empty for epic (same width as BeadRow) */}
        <span className="w-8" />

        {/* Assignee slot - empty for epic (same width as BeadRow) */}
        <span className="w-16" />

        {/* Activity - fixed width (same as BeadRow) */}
        <span className="text-[10px] text-ash w-16 text-center">
          {bead.updated_at ? formatRelativeTime(bead.updated_at) : "—"}
        </span>

        {/* ID - fixed width (same as BeadRow) */}
        <span className="font-mono text-[10px] text-ash/60 w-14 text-right">
          {bead.id}
        </span>
      </div>
    </button>
  );
}

/**
 * Sortable column header
 */
function SortableHeader({
  label,
  column,
  currentSort,
  currentDirection,
  onSort,
  width,
  align = "center",
}: {
  label: string;
  column: SortColumn;
  currentSort: SortColumn;
  currentDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  width: string;
  align?: "left" | "center" | "right";
}) {
  const isActive = currentSort === column;

  return (
    <button
      onClick={() => onSort(column)}
      className={cn(
        "flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium transition-colors",
        width,
        align === "left" && "justify-start",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
        isActive ? "text-fuel-yellow" : "text-ash hover:text-bone"
      )}
    >
      {label}
      {isActive && (
        <Icon
          name={currentDirection === "asc" ? "chevron-up" : "chevron-down"}
          aria-label={currentDirection === "asc" ? "Ascending" : "Descending"}
          size="xs"
          className="text-fuel-yellow"
        />
      )}
    </button>
  );
}

/**
 * Table header row for issues
 */
function IssuesHeader({
  sortColumn,
  sortDirection,
  onSort,
  depth = 0,
}: {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  depth?: number;
}) {
  return (
    <div
      className="flex items-center gap-2 py-2 px-3 border-b border-chrome-border/30 bg-carbon-black/30"
      style={{ paddingLeft: `${24 + depth * 16}px` }}
    >
      {/* Spacer for status dot */}
      <span className="w-2 shrink-0" />

      {/* Title - not sortable, takes remaining space */}
      <span className="flex-1 text-[10px] uppercase tracking-wider font-medium text-ash">
        Issue
      </span>

      {/* Sortable columns */}
      <div className="flex items-center gap-2 shrink-0">
        <SortableHeader
          label="Type"
          column="type"
          currentSort={sortColumn}
          currentDirection={sortDirection}
          onSort={onSort}
          width="w-14"
        />
        <SortableHeader
          label="Status"
          column="status"
          currentSort={sortColumn}
          currentDirection={sortDirection}
          onSort={onSort}
          width="w-20"
        />
        <SortableHeader
          label="Pri"
          column="priority"
          currentSort={sortColumn}
          currentDirection={sortDirection}
          onSort={onSort}
          width="w-8"
        />
        <SortableHeader
          label="Assignee"
          column="assignee"
          currentSort={sortColumn}
          currentDirection={sortDirection}
          onSort={onSort}
          width="w-16"
        />
        <SortableHeader
          label="Activity"
          column="activity"
          currentSort={sortColumn}
          currentDirection={sortDirection}
          onSort={onSort}
          width="w-16"
        />
        <SortableHeader
          label="ID"
          column="id"
          currentSort={sortColumn}
          currentDirection={sortDirection}
          onSort={onSort}
          width="w-14"
          align="right"
        />
      </div>
    </div>
  );
}

/**
 * Single bead row component - for issues under epics
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
  const statusInfo = getStatusInfo(bead.status);
  const typeBadge = getTypeBadge(bead.issue_type);
  const priority = priorityToNumber(bead.priority);

  // Extract worker name from assignee (e.g., "citadel/polecats/nux" -> "nux")
  const workerName = bead.assignee?.split("/").pop() || null;

  return (
    <button
      onClick={() => onSelect(bead)}
      className={cn(
        "w-full flex items-center gap-2 py-2.5 px-3 transition-mechanical cursor-pointer text-left",
        "border-l-2",
        isSelected
          ? "bg-fuel-yellow/10 border-l-fuel-yellow"
          : "hover:bg-carbon-black/30 border-l-transparent"
      )}
      style={{ paddingLeft: `${24 + depth * 16}px` }}
    >
      {/* Status indicator dot */}
      <span
        className={cn(
          "w-2 h-2 rounded-full shrink-0",
          statusInfo.color === "text-acid-green" && "bg-acid-green",
          statusInfo.color === "text-fuel-yellow" && "bg-fuel-yellow",
          statusInfo.color === "text-rust-orange" && "bg-rust-orange",
          statusInfo.color === "text-ash" && "bg-ash/50"
        )}
      />

      {/* Title */}
      <span className="flex-1 text-sm text-bone truncate">{bead.title}</span>

      {/* Right side metadata - fixed width columns for alignment */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Type badge - fixed width */}
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded border w-14 text-center",
            typeBadge.style
          )}
        >
          {typeBadge.label}
        </span>

        {/* Status label - fixed width */}
        <span className={cn("text-xs w-20 text-center", statusInfo.color)}>
          {statusInfo.label}
        </span>

        {/* Priority - fixed width slot (always reserve space) */}
        <span className="w-8 text-center">
          {priority <= 1 ? (
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block",
                getPriorityStyle(priority)
              )}
            >
              P{priority}
            </span>
          ) : null}
        </span>

        {/* Assignee - fixed width */}
        <span className="w-16 text-center">
          {workerName ? (
            <span className="text-xs text-ash bg-ash/10 px-1.5 py-0.5 rounded">
              {workerName}
            </span>
          ) : null}
        </span>

        {/* Activity - fixed width */}
        <span className="text-[10px] text-ash w-16 text-center">
          {bead.updated_at ? formatRelativeTime(bead.updated_at) : "—"}
        </span>

        {/* ID - fixed width */}
        <span className="font-mono text-[10px] text-ash/50 w-14 text-right">
          {bead.id}
        </span>
      </div>
    </button>
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

      {/* Progress gauge (for epics) */}
      {group.type === "epic" && group.stats.total > 0 && (
        <div className="w-24 shrink-0">
          <GaugeCompact value={progressPercent} />
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

  // Sort state - default to activity descending (newest first)
  const [sortColumn, setSortColumn] = useState<SortColumn>("activity");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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

  // Handle sort column click
  const handleSort = useCallback((column: SortColumn) => {
    setSortColumn((prev) => {
      if (prev === column) {
        // Toggle direction if same column
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      } else {
        // New column - default to desc for activity, asc for others
        setSortDirection(column === "activity" ? "desc" : "asc");
        return column;
      }
    });
  }, []);

  // Sort issues by selected column
  const sortIssues = useCallback(
    (issues: Bead[]): Bead[] => {
      return [...issues].sort((a, b) => {
        let comparison = 0;

        switch (sortColumn) {
          case "type":
            comparison = (a.issue_type || "").localeCompare(b.issue_type || "");
            break;
          case "status":
            comparison = getStatusOrder(a.status) - getStatusOrder(b.status);
            break;
          case "priority":
            comparison = priorityToNumber(a.priority) - priorityToNumber(b.priority);
            break;
          case "assignee":
            const aName = a.assignee?.split("/").pop() || "";
            const bName = b.assignee?.split("/").pop() || "";
            comparison = aName.localeCompare(bName);
            break;
          case "activity":
            const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
            const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
            comparison = aTime - bTime;
            break;
          case "id":
            comparison = a.id.localeCompare(b.id);
            break;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    },
    [sortColumn, sortDirection]
  );

  // Group beads hierarchically
  const groups = groupBeadsByEpic(beads);

  // Render group recursively
  const renderGroup = (group: BeadGroup, depth: number = 0) => {
    const isExpanded = expanded.has(group.id);
    const issuesInGroup = group.children
      ? []
      : group.beads.filter((b) => b.issue_type !== "epic");
    const epicsInGroup = group.beads.filter((b) => b.issue_type === "epic");

    // Sort issues (epic always stays on top)
    const sortedIssues = sortIssues(issuesInGroup);

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

            {/* Show epic FIRST at the top of its group */}
            {!group.children &&
              epicsInGroup.map((bead) => (
                <EpicRow
                  key={bead.id}
                  bead={bead}
                  isSelected={selectedBeadId === bead.id}
                  onSelect={handleBeadSelect}
                  depth={depth + 1}
                />
              ))}

            {/* Column headers for issues */}
            {!group.children && sortedIssues.length > 0 && (
              <IssuesHeader
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                depth={depth + 1}
              />
            )}

            {/* Then render sorted child issues below the epic */}
            {!group.children &&
              sortedIssues.map((bead) => (
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
