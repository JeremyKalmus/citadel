"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/ui/icon";
import { StatusBadge, type Status } from "@/components/ui/status-badge";
import type { BeadDetail, BeadDependency } from "@/lib/gastown";
import { ChevronRight, ChevronDown, GitMerge } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface BeadTreeNode {
  id: string;
  title: string;
  status: string;
  priority: number;
  issue_type: string;
  assignee?: string;
  children?: BeadTreeNode[];
  /** Whether this bead is in the refinery queue (MERGE_READY) */
  inRefinery?: boolean;
  /** Refinery queue position (1-based) */
  refineryPosition?: number;
  /** Current refinery operation (rebasing, testing, merging) */
  refineryOperation?: "queued" | "rebasing" | "testing" | "merging";
}

export interface BeadsTreeProps {
  /** Root nodes of the tree (top-level beads) */
  nodes: BeadTreeNode[];
  /** Whether the tree is loading */
  isLoading?: boolean;
  /** Callback when a bead is selected */
  onSelect?: (id: string) => void;
  /** Currently selected bead ID */
  selectedId?: string;
  /** Whether to show refinery indicators */
  showRefineryIndicators?: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert bead status to StatusBadge status
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
 * Get icon for issue type
 */
function getIssueTypeIcon(issueType: string): IconName {
  switch (issueType.toLowerCase()) {
    case "epic":
      return "container";
    case "task":
      return "terminal";
    case "bug":
      return "exclamation-triangle";
    case "feature":
      return "play-circle";
    default:
      return "terminal";
  }
}

/**
 * Get refinery operation label
 */
function getRefineryLabel(operation?: "queued" | "rebasing" | "testing" | "merging"): string {
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

// ============================================================================
// RefineryIndicator Component
// ============================================================================

interface RefineryIndicatorProps {
  position?: number;
  operation?: "queued" | "rebasing" | "testing" | "merging";
  className?: string;
}

/**
 * RefineryIndicator - Shows refinery status for MERGE_READY issues
 *
 * Displays a compact badge indicating the issue is in the refinery queue,
 * with optional position and current operation.
 */
function RefineryIndicator({ position, operation, className }: RefineryIndicatorProps) {
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
      {!position && operation && (
        <span>{getRefineryLabel(operation)}</span>
      )}
    </span>
  );
}

// ============================================================================
// TreeNode Component
// ============================================================================

interface TreeNodeProps {
  node: BeadTreeNode;
  level: number;
  onSelect?: (id: string) => void;
  selectedId?: string;
  showRefineryIndicators?: boolean;
}

function TreeNode({
  node,
  level,
  onSelect,
  selectedId,
  showRefineryIndicators = true,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;
  const showRefinery = showRefineryIndicators && (node.inRefinery || isMergeReady(node.status));

  return (
    <div>
      {/* Node row */}
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-sm transition-colors cursor-pointer group",
          {
            "bg-chrome-border/30": isSelected,
            "hover:bg-carbon-black/50": !isSelected,
          }
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect?.(node.id)}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            className="p-0.5 text-ash hover:text-bone transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Issue type icon */}
        <Icon
          name={getIssueTypeIcon(node.issue_type)}
          aria-label={node.issue_type}
          variant="muted"
          size="sm"
        />

        {/* ID and title */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <Link
            href={`/bead/${encodeURIComponent(node.id)}`}
            className="font-mono text-xs text-fuel-yellow hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {node.id}
          </Link>
          <span className="truncate text-sm text-bone group-hover:text-bone/90">
            {node.title}
          </span>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1.5">
          {/* Refinery indicator for MERGE_READY issues */}
          {showRefinery && (
            <RefineryIndicator
              position={node.refineryPosition}
              operation={node.refineryOperation}
            />
          )}

          {/* Status badge */}
          <StatusBadge
            status={beadStatusToStatus(node.status)}
            size="sm"
            showLabel={false}
          />
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              showRefineryIndicators={showRefineryIndicators}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BeadsTree Component
// ============================================================================

/**
 * BeadsTree Component
 *
 * Displays a hierarchical tree view of beads (issues) with:
 * - Collapsible parent/child relationships
 * - Status indicators via StatusBadge
 * - Refinery indicators for MERGE_READY issues
 * - Click-to-navigate to bead detail
 *
 * Design tokens (DS2):
 * - fuel-yellow: Issue IDs, pending refinery
 * - acid-green: Active refinery operations
 * - ash: Muted text, icons
 * - bone: Primary text
 */
export function BeadsTree({
  nodes,
  isLoading,
  onSelect,
  selectedId,
  showRefineryIndicators = true,
}: BeadsTreeProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 bg-chrome-border/20 rounded-sm animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Icon
          name="container"
          aria-label=""
          variant="muted"
          size="xl"
          className="mb-3"
        />
        <span className="text-bone font-medium">No Beads Found</span>
        <span className="text-ash/60 text-xs mt-1">
          Create beads using the <code className="font-mono">bd</code> CLI
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          onSelect={onSelect}
          selectedId={selectedId}
          showRefineryIndicators={showRefineryIndicators}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Utility: Convert flat bead list to tree
// ============================================================================

/**
 * Convert a flat list of beads with parent references into a tree structure.
 *
 * @param beads - Flat list of bead details
 * @param refineryQueue - Optional map of bead IDs to refinery status
 * @returns Tree of BeadTreeNode
 */
export function beadsToTree(
  beads: BeadDetail[],
  refineryQueue?: Map<string, { position: number; operation?: "queued" | "rebasing" | "testing" | "merging" }>
): BeadTreeNode[] {
  const nodeMap = new Map<string, BeadTreeNode>();
  const roots: BeadTreeNode[] = [];

  // First pass: create all nodes
  for (const bead of beads) {
    const refineryInfo = refineryQueue?.get(bead.id);
    nodeMap.set(bead.id, {
      id: bead.id,
      title: bead.title,
      status: bead.status,
      priority: bead.priority,
      issue_type: bead.issue_type,
      assignee: bead.assignee,
      children: [],
      inRefinery: !!refineryInfo || isMergeReady(bead.status),
      refineryPosition: refineryInfo?.position,
      refineryOperation: refineryInfo?.operation,
    });
  }

  // Second pass: build hierarchy
  for (const bead of beads) {
    const node = nodeMap.get(bead.id)!;
    const parentId = bead.parent;

    if (parentId && nodeMap.has(parentId)) {
      const parent = nodeMap.get(parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children by priority
  function sortChildren(nodes: BeadTreeNode[]) {
    nodes.sort((a, b) => a.priority - b.priority);
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    }
  }

  sortChildren(roots);

  return roots;
}
