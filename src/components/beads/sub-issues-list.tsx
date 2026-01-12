"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { StatusBadge, Icon } from "@/components/ui"
import type { Status } from "@/components/ui"
import type { Bead } from "@/lib/gastown"
import type { EpicProgress } from "@/lib/gastown/types"

export interface SubIssuesListProps {
  /** Child beads of the epic */
  children: Bead[]
  /** Callback when a child is selected */
  onSelect?: (bead: Bead) => void
  /** Currently selected child ID */
  selectedId?: string
  /** Progress stats */
  progress: EpicProgress
  /** Whether to show as compact list */
  compact?: boolean
  /** Custom className */
  className?: string
}

/**
 * Map bead status to StatusBadge status type
 */
function beadStatusToStatus(status: string | undefined | null): Status {
  if (!status) return "thinking"
  switch (status.toLowerCase()) {
    case "open":
      return "thinking"
    case "in_progress":
    case "hooked":
      return "active"
    case "blocked":
      return "blocked"
    case "deferred":
      return "slow"
    case "closed":
    case "done":
    case "completed":
      return "done"
    default:
      return "thinking"
  }
}

/**
 * Get badge styles for issue type
 */
function getTypeBadge(type: string): { label: string; style: string } {
  switch (type.toLowerCase()) {
    case "task":
      return {
        label: "Task",
        style: "text-fuel-yellow bg-fuel-yellow/10 border-fuel-yellow/30",
      }
    case "bug":
      return {
        label: "Bug",
        style: "text-rust-orange bg-rust-orange/10 border-rust-orange/30",
      }
    case "feature":
      return {
        label: "Feature",
        style: "text-acid-green bg-acid-green/10 border-acid-green/30",
      }
    case "chore":
      return {
        label: "Chore",
        style: "text-chrome-border bg-chrome-border/10 border-chrome-border/30",
      }
    default:
      return {
        label: type,
        style: "text-ash bg-ash/10 border-ash/30",
      }
  }
}

/**
 * Format relative time for display
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

/**
 * Single child row in the sub-issues list
 */
function SubIssueRow({
  bead,
  isSelected,
  onSelect,
  compact,
}: {
  bead: Bead
  isSelected: boolean
  onSelect?: (bead: Bead) => void
  compact?: boolean
}) {
  const status = beadStatusToStatus(bead.status)
  const typeBadge = getTypeBadge(bead.issue_type)

  const content = (
    <div
      className={cn(
        "group flex items-center gap-3 transition-mechanical cursor-pointer",
        compact ? "py-2 px-3" : "py-3 px-4",
        "border-l-2",
        isSelected
          ? "bg-fuel-yellow/10 border-l-fuel-yellow"
          : "hover:bg-carbon-black/30 border-l-transparent"
      )}
      onClick={() => onSelect?.(bead)}
    >
      {/* Status indicator */}
      <StatusBadge status={status} size="sm" showLabel={false} />

      {/* Title and ID */}
      <div className="flex-1 min-w-0">
        <span className="body-text text-bone truncate block">{bead.title}</span>
        {!compact && (
          <span className="caption text-ash font-mono">{bead.id}</span>
        )}
      </div>

      {/* Type badge */}
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-sm border shrink-0",
          typeBadge.style
        )}
      >
        {typeBadge.label}
      </span>

      {/* Timestamp */}
      {!compact && (
        <span className="text-xs text-ash w-16 shrink-0 text-right">
          {formatRelativeTime(bead.updated_at)}
        </span>
      )}
    </div>
  )

  // Wrap in Link if we have an ID to navigate to
  if (bead.id) {
    return (
      <Link href={`/bead/${bead.id}`} className="block">
        {content}
      </Link>
    )
  }

  return content
}

/**
 * Stats summary header for sub-issues
 */
function SubIssuesHeader({ progress }: { progress: EpicProgress }) {
  if (progress.total === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-chrome-border/30 bg-carbon-black/30">
      <span className="text-xs text-bone font-medium">
        {progress.total} sub-issues
      </span>
      <div className="flex items-center gap-3 text-[10px]">
        {progress.open > 0 && (
          <span className="text-ash">{progress.open} open</span>
        )}
        {progress.inProgress > 0 && (
          <span className="text-fuel-yellow">{progress.inProgress} active</span>
        )}
        {progress.blocked > 0 && (
          <span className="text-rust-orange">{progress.blocked} blocked</span>
        )}
        {progress.deferred > 0 && (
          <span className="text-chrome-border">{progress.deferred} deferred</span>
        )}
        {progress.closed > 0 && (
          <span className="text-acid-green">{progress.closed} closed</span>
        )}
      </div>
    </div>
  )
}

/**
 * SubIssuesList Component
 *
 * Displays the children of an epic as a list with:
 * - Status indicators
 * - Type badges
 * - Click to navigate to child detail
 * - Summary stats header
 *
 * Used in EpicDetailPanel instead of "Parent Epic" panel.
 */
export function SubIssuesList({
  children,
  onSelect,
  selectedId,
  progress,
  compact = false,
  className,
}: SubIssuesListProps) {
  if (children.length === 0) {
    return (
      <div className={cn("py-8 text-center", className)}>
        <Icon
          name="layers"
          aria-label="No sub-issues"
          size="xl"
          variant="muted"
          className="mx-auto mb-2"
        />
        <p className="body-text text-ash">No sub-issues yet</p>
        <p className="caption text-ash/70 mt-1">
          Create child issues with <code className="font-mono bg-carbon-black px-1 rounded">bd create --parent</code>
        </p>
      </div>
    )
  }

  // Sort children: in_progress first, then open, then blocked, then deferred, then closed
  const sortedChildren = [...children].sort((a, b) => {
    const statusOrder = (status: string) => {
      switch (status.toLowerCase()) {
        case "in_progress":
        case "hooked":
          return 0
        case "open":
          return 1
        case "blocked":
          return 2
        case "deferred":
          return 3
        case "closed":
        case "done":
        case "completed":
          return 4
        default:
          return 5
      }
    }
    return statusOrder(a.status) - statusOrder(b.status)
  })

  return (
    <div className={cn("divide-y divide-chrome-border/20", className)}>
      <SubIssuesHeader progress={progress} />
      {sortedChildren.map((bead) => (
        <SubIssueRow
          key={bead.id}
          bead={bead}
          isSelected={selectedId === bead.id}
          onSelect={onSelect}
          compact={compact}
        />
      ))}
    </div>
  )
}

/**
 * Compact variant for inline display
 */
export function SubIssuesListCompact({
  children,
  onSelect,
  progress,
}: Pick<SubIssuesListProps, "children" | "onSelect" | "progress">) {
  return (
    <SubIssuesList
      children={children}
      onSelect={onSelect}
      progress={progress}
      compact={true}
    />
  )
}
