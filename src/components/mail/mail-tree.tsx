"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Icon, StatusBadge, type Status } from "@/components/ui";
import type { Bead } from "@/lib/gastown";
import { isStale, STALE_COMMUNICATION_THRESHOLD_MS } from "@/lib/bead-types";

/**
 * Stats for a mail group
 */
interface MailGroupStats {
  total: number;
  recent: number;  // Within 24h
  pending: number; // Open/hooked
  stale: number;   // Older than 7 days
}

/**
 * A group of mail items (by convoy or ungrouped)
 */
interface MailGroup {
  id: string;
  label: string;
  beads: Bead[];
  stats: MailGroupStats;
  hasStaleItems: boolean;
}

interface MailTreeProps {
  beads: Bead[];
  onMailSelect?: (bead: Bead) => void;
  selectedMailId?: string;
  className?: string;
}

const STORAGE_KEY = "mail-tree-expanded";
const STALE_COLLAPSED_KEY = "mail-tree-stale-collapsed";

/**
 * Map mail status to StatusBadge status
 */
function mailStatusToStatus(status: string): Status {
  switch (status.toLowerCase()) {
    case "open":
    case "unread":
      return "thinking";
    case "in_progress":
    case "hooked":
      return "active";
    case "blocked":
      return "blocked";
    case "deferred":
      return "slow";
    case "closed":
    case "read":
    case "archived":
      return "done";
    default:
      return "thinking";
  }
}

/**
 * Extract sender from bead (created_by field or parse from ID)
 */
function extractSender(bead: Bead): string {
  // If we have created_by info (from BeadDetail), use it
  const raw = (bead as unknown as { created_by?: string }).created_by;
  if (raw) {
    // Extract just the actor name (e.g., "mayor" from "mayor/session")
    const parts = raw.split("/");
    return parts[0];
  }
  // Otherwise infer from ID prefix or return unknown
  if (bead.id.startsWith("hq-")) return "hq";
  return "unknown";
}

/**
 * Format relative time
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
  return date.toLocaleDateString();
}

/**
 * Calculate stats for a group of mail items
 */
function calculateGroupStats(beads: Bead[]): MailGroupStats {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  return beads.reduce(
    (acc, bead) => {
      acc.total++;
      const updated = new Date(bead.updated_at).getTime();

      // Recent = within 24 hours
      if (now - updated < oneDayMs) {
        acc.recent++;
      }

      // Pending = open or hooked
      const status = bead.status.toLowerCase();
      if (status === "open" || status === "hooked" || status === "in_progress") {
        acc.pending++;
      }

      // Stale = older than 7 days
      if (isStale(bead.updated_at)) {
        acc.stale++;
      }

      return acc;
    },
    { total: 0, recent: 0, pending: 0, stale: 0 }
  );
}

/**
 * Group mail by convoy (parent field)
 */
function groupMailByConvoy(beads: Bead[]): MailGroup[] {
  const convoyMap = new Map<string | null, Bead[]>();

  for (const bead of beads) {
    const convoyId = bead.parent || null;
    const existing = convoyMap.get(convoyId) || [];
    existing.push(bead);
    convoyMap.set(convoyId, existing);
  }

  const groups: MailGroup[] = [];

  // Add grouped items first (by convoy)
  for (const [convoyId, convoyBeads] of convoyMap) {
    if (convoyId !== null) {
      const stats = calculateGroupStats(convoyBeads);
      groups.push({
        id: convoyId,
        label: `Convoy: ${convoyId}`,
        beads: convoyBeads.sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ),
        stats,
        hasStaleItems: stats.stale > 0,
      });
    }
  }

  // Add ungrouped items last
  const ungrouped = convoyMap.get(null);
  if (ungrouped && ungrouped.length > 0) {
    const stats = calculateGroupStats(ungrouped);
    groups.push({
      id: "_ungrouped",
      label: "Ungrouped Mail",
      beads: ungrouped.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ),
      stats,
      hasStaleItems: stats.stale > 0,
    });
  }

  // Sort groups by most recent activity
  return groups.sort((a, b) => {
    const aLatest = a.beads[0]?.updated_at || "";
    const bLatest = b.beads[0]?.updated_at || "";
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });
}

/**
 * Load expanded state from localStorage
 */
function loadExpandedState(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {
    // Ignore
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
    // Ignore
  }
}

/**
 * Load stale-collapsed state
 */
function loadStaleCollapsedState(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STALE_COLLAPSED_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {
    // Ignore
  }
  // Default: all groups have stale items collapsed
  return new Set(["_all"]);
}

/**
 * Single mail row component
 */
function MailRow({
  bead,
  isSelected,
  onSelect,
  isStale: mailIsStale,
}: {
  bead: Bead;
  isSelected: boolean;
  onSelect: (bead: Bead) => void;
  isStale: boolean;
}) {
  const status = mailStatusToStatus(bead.status);
  const sender = extractSender(bead);

  return (
    <button
      onClick={() => onSelect(bead)}
      className={cn(
        "w-full group flex items-center gap-3 py-2.5 px-3 transition-mechanical cursor-pointer text-left",
        "border-l-2",
        isSelected
          ? "bg-fuel-yellow/10 border-l-fuel-yellow"
          : "hover:bg-carbon-black/30 border-l-transparent",
        mailIsStale && "opacity-60"
      )}
    >
      {/* Status indicator */}
      <StatusBadge status={status} size="sm" showLabel={false} />

      {/* Sender */}
      <span className={cn(
        "text-xs font-medium w-16 shrink-0 capitalize",
        sender === "mayor" && "text-fuel-yellow",
        sender === "witness" && "text-acid-green",
        sender === "deacon" && "text-rust-orange",
        !["mayor", "witness", "deacon"].includes(sender) && "text-ash"
      )}>
        {sender}
      </span>

      {/* Title */}
      <span className="flex-1 text-sm text-bone truncate">{bead.title}</span>

      {/* Type badge */}
      <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-sm border text-ash bg-ash/10 border-ash/30">
        {bead.issue_type}
      </span>

      {/* Timestamp */}
      <span className="text-xs text-ash w-16 shrink-0 text-right">
        {formatRelativeTime(bead.updated_at)}
      </span>
    </button>
  );
}

/**
 * Group header component
 */
function GroupHeader({
  group,
  isExpanded,
  onToggle,
  staleCollapsed,
  onToggleStale,
}: {
  group: MailGroup;
  isExpanded: boolean;
  onToggle: () => void;
  staleCollapsed: boolean;
  onToggleStale: () => void;
}) {
  return (
    <div className="flex items-center bg-gunmetal border-b border-chrome-border/50">
      <button
        onClick={onToggle}
        className="flex-1 flex items-center gap-3 py-2.5 px-3 transition-mechanical hover:bg-carbon-black/30"
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
        <Icon name="mail" aria-label="Mail" size="sm" variant="muted" />

        {/* Label */}
        <span className="flex-1 text-left section-header text-bone truncate">
          {group.label}
        </span>

        {/* Stats */}
        <span className="text-xs text-ash shrink-0">
          {group.stats.pending > 0 && (
            <span className="text-fuel-yellow mr-2">
              {group.stats.pending} pending
            </span>
          )}
          {group.stats.total} items
        </span>
      </button>

      {/* Stale toggle (only show if has stale items) */}
      {group.hasStaleItems && isExpanded && (
        <button
          onClick={onToggleStale}
          className="px-3 py-2.5 text-xs text-ash hover:text-bone transition-colors"
          title={staleCollapsed ? "Show older items" : "Hide older items"}
        >
          {staleCollapsed
            ? `+${group.stats.stale} older`
            : "Hide older"}
        </button>
      )}
    </div>
  );
}

/**
 * MailTree - Hierarchical view for town mail grouped by convoy
 *
 * Features:
 * - Group by convoy (parent field)
 * - Auto-collapse items older than 7 days
 * - Show sender prominently (mayor, witness, deacon)
 * - Timestamp display
 * - Collapsible groups with persist to localStorage
 */
export function MailTree({
  beads,
  onMailSelect,
  selectedMailId,
  className,
}: MailTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => loadExpandedState());
  const [staleCollapsed, setStaleCollapsed] = useState<Set<string>>(() =>
    loadStaleCollapsedState()
  );

  // Load state on mount
  useEffect(() => {
    setExpanded(loadExpandedState());
    setStaleCollapsed(loadStaleCollapsedState());
  }, []);

  // Save expanded state
  useEffect(() => {
    saveExpandedState(expanded);
  }, [expanded]);

  // Save stale collapsed state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STALE_COLLAPSED_KEY, JSON.stringify([...staleCollapsed]));
    } catch {
      // Ignore
    }
  }, [staleCollapsed]);

  const handleToggle = useCallback((groupId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const handleToggleStale = useCallback((groupId: string) => {
    setStaleCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const handleMailSelect = useCallback(
    (bead: Bead) => {
      onMailSelect?.(bead);
    },
    [onMailSelect]
  );

  // Group beads by convoy
  const groups = useMemo(() => groupMailByConvoy(beads), [beads]);

  // Render group
  const renderGroup = (group: MailGroup) => {
    const isExpanded = expanded.has(group.id);
    const hideStale = staleCollapsed.has(group.id) || staleCollapsed.has("_all");

    // Filter beads - hide stale if collapsed
    const visibleBeads = hideStale
      ? group.beads.filter((b) => !isStale(b.updated_at))
      : group.beads;

    const hiddenCount = group.beads.length - visibleBeads.length;

    return (
      <div key={group.id} className="transition-all duration-150">
        <GroupHeader
          group={group}
          isExpanded={isExpanded}
          onToggle={() => handleToggle(group.id)}
          staleCollapsed={hideStale}
          onToggleStale={() => handleToggleStale(group.id)}
        />

        {isExpanded && (
          <div className="overflow-hidden animate-in slide-in-from-top-1 duration-150">
            {visibleBeads.map((bead) => (
              <MailRow
                key={bead.id}
                bead={bead}
                isSelected={selectedMailId === bead.id}
                onSelect={handleMailSelect}
                isStale={isStale(bead.updated_at)}
              />
            ))}

            {/* Show count of hidden stale items */}
            {hiddenCount > 0 && hideStale && (
              <button
                onClick={() => handleToggleStale(group.id)}
                className="w-full py-2 px-3 text-xs text-ash hover:text-bone text-center transition-colors border-t border-chrome-border/20"
              >
                +{hiddenCount} older items (click to show)
              </button>
            )}

            {visibleBeads.length === 0 && (
              <div className="py-4 text-center text-sm text-ash">
                {hiddenCount > 0
                  ? `${hiddenCount} older items hidden`
                  : "No mail in this group"}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (beads.length === 0) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <Icon
          name="inbox"
          aria-label="No mail"
          size="xl"
          variant="muted"
          className="mx-auto mb-2"
        />
        <p className="text-sm text-ash">No mail found</p>
      </div>
    );
  }

  return (
    <div className={cn("divide-y divide-chrome-border/30", className)}>
      {groups.map((group) => renderGroup(group))}
    </div>
  );
}

export type { MailGroup, MailGroupStats, MailTreeProps };
