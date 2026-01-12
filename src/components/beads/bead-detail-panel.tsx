"use client"

import Link from "next/link"
import { Panel, PanelHeader, PanelBody, StatusBadge } from "@/components/ui"
import { ActivityTimeline, type ActivityEvent } from "@/components/dashboard"
import { JourneyTracker } from "@/components/journey"
import { Icon } from "@/components/ui/icon"
import type { Status } from "@/components/ui"
import type { BeadDetail, BeadDependency } from "@/lib/gastown"
import {
  JourneyStage,
  type WorkingSubstage,
  type JourneyTimestamps,
} from "@/lib/gastown/types"

// ============================================================================
// Type Definitions
// ============================================================================

export interface BeadDetailPanelProps {
  /** The bead data to display */
  bead: BeadDetail
  /** Whether the panel is in a loading state */
  loading?: boolean
  /** Callback when refresh is requested */
  onRefresh?: () => void
  /** Whether in compact mode (for side panels) */
  compact?: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map bead status string to Status type for StatusBadge
 */
function beadStatusToStatus(status: string | undefined | null): Status {
  if (!status) {
    return "thinking"
  }
  switch (status.toLowerCase()) {
    case "open":
      return "thinking"
    case "in_progress":
    case "hooked":
      return "active"
    case "blocked":
      return "blocked"
    case "closed":
    case "done":
    case "completed":
      return "done"
    default:
      return "thinking"
  }
}

/**
 * Get human-readable priority label
 */
function priorityLabel(priority: number): string {
  switch (priority) {
    case 0:
      return "P0 - Critical"
    case 1:
      return "P1 - High"
    case 2:
      return "P2 - Medium"
    case 3:
      return "P3 - Low"
    case 4:
      return "P4 - Backlog"
    default:
      return `P${priority}`
  }
}

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

/**
 * Derive journey stage from bead status
 */
function deriveJourneyStage(status: string | undefined | null): JourneyStage {
  if (!status) {
    return JourneyStage.QUEUED
  }
  switch (status.toLowerCase()) {
    case "open":
      return JourneyStage.QUEUED
    case "in_progress":
    case "hooked":
      return JourneyStage.WORKING
    case "blocked":
      return JourneyStage.WORKING
    case "closed":
    case "done":
    case "completed":
      return JourneyStage.MERGED
    default:
      return JourneyStage.QUEUED
  }
}

/**
 * Derive working substage from status (placeholder until proper event tracking)
 */
function deriveSubstage(status: string | undefined | null): WorkingSubstage | undefined {
  if (!status) {
    return undefined
  }
  if (status === "in_progress" || status === "hooked") {
    return "2b" // Default to coding substage
  }
  return undefined
}

/**
 * Build journey timestamps from bead data
 */
function buildJourneyTimestamps(bead: BeadDetail): JourneyTimestamps {
  const stage = deriveJourneyStage(bead.status)

  return {
    queued: bead.created_at,
    claimed: stage >= JourneyStage.CLAIMED ? bead.created_at : undefined,
    workStarted: stage >= JourneyStage.WORKING ? bead.updated_at : undefined,
    merged: stage >= JourneyStage.MERGED ? bead.updated_at : undefined,
  }
}

/**
 * Generate activity events from bead data
 */
function generateBeadActivityEvents(bead: BeadDetail): ActivityEvent[] {
  const events: ActivityEvent[] = []

  if (bead.created_at) {
    events.push({
      id: "created",
      timestamp: bead.created_at,
      type: "work_started",
      title: "Bead created",
      description: `Initial status: open`,
    })
  }

  if (bead.updated_at && bead.updated_at !== bead.created_at) {
    events.push({
      id: "updated",
      timestamp: bead.updated_at,
      type: "state_change",
      title: "Status updated",
      description: `Current status: ${bead.status}`,
    })
  }

  if (bead.status === "in_progress" || bead.status === "hooked") {
    events.push({
      id: "active",
      timestamp: new Date().toISOString(),
      type: "info",
      title: "Work in progress",
      description: bead.assignee
        ? `Assigned to ${bead.assignee}`
        : "Assigned worker is actively working on this bead",
    })
  } else if (bead.status === "closed" || bead.status === "done" || bead.status === "completed") {
    events.push({
      id: "completed",
      timestamp: new Date().toISOString(),
      type: "work_completed",
      title: "Bead completed",
      description: "All work has been finished",
    })
  }

  return events
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Dependencies list showing blocking or parent-child relationships
 */
function DependenciesList({
  dependencies,
  type
}: {
  dependencies: BeadDependency[]
  type: "blocks" | "parent-child"
}) {
  const filtered = dependencies.filter(d => d.dependency_type === type)

  if (filtered.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="caption text-ash">
          {type === "blocks" ? "No blocking dependencies" : "No parent relationship"}
        </p>
      </div>
    )
  }

  return (
    <div className="px-4">
      {filtered.map((dep) => (
        <Link
          key={dep.id}
          href={`/bead/${dep.id}`}
          className="flex items-center justify-between gap-3 py-3 border-b border-chrome-border/30 last:border-0 hover:bg-carbon-black/30 -mx-4 px-4 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Icon name="terminal" aria-label="" variant="muted" size="sm" />
            <div className="min-w-0">
              <span className="body-text font-mono block truncate">{dep.id}</span>
              <span className="caption text-ash block truncate">{dep.title}</span>
            </div>
          </div>
          <StatusBadge status={beadStatusToStatus(dep.status)} size="sm" />
        </Link>
      ))}
    </div>
  )
}

/**
 * Status panel showing bead status and metadata
 */
function BeadStatusSection({
  status,
  details,
  loading,
}: {
  status: Status
  details: { label: string; value: string }[]
  loading: boolean
}) {
  const statusExplanations: Record<string, string> = {
    thinking: "Bead is open and waiting to be picked up by a worker.",
    active: "A worker is actively working on this bead.",
    blocked: "Bead is blocked by dependencies that need to be resolved first.",
    done: "Bead has been completed successfully.",
  }

  return (
    <Panel>
      <PanelHeader
        icon="activity"
        title="Bead Status"
        actions={<StatusBadge status={status} size="sm" />}
      />
      <PanelBody>
        {loading ? (
          <div className="text-center py-2">
            <p className="caption text-ash">Loading status...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <div className="flex gap-2">
                <Icon name="brain" aria-label="" variant="muted" size="sm" className="flex-shrink-0 mt-0.5" />
                <p className="caption text-ash leading-relaxed">
                  {statusExplanations[status] || "Unknown status."}
                </p>
              </div>
            </div>

            {details.length > 0 && (
              <div>
                {details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 py-2 border-b border-chrome-border/30 last:border-0"
                  >
                    <span className="label text-ash shrink-0">{detail.label}</span>
                    <span
                      className="body-text font-medium text-right truncate min-w-0"
                      title={detail.value}
                    >
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}

/**
 * Description panel for bead details
 */
function DescriptionSection({ description }: { description?: string }) {
  if (!description) {
    return null
  }

  return (
    <Panel>
      <PanelHeader icon="terminal" title="Description" />
      <PanelBody>
        <pre className="whitespace-pre-wrap font-mono text-sm text-ash leading-relaxed">
          {description}
        </pre>
      </PanelBody>
    </Panel>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * BeadDetailPanel Component
 *
 * A comprehensive panel for displaying bead details including:
 * - Work journey visualization (JourneyTracker)
 * - Status and metadata
 * - Activity timeline
 * - Description
 * - Dependencies
 *
 * Can be used as a standalone panel or embedded in a page layout.
 *
 * @example
 * ```tsx
 * <BeadDetailPanel
 *   bead={beadData}
 *   loading={isLoading}
 * />
 * ```
 */
export function BeadDetailPanel({
  bead,
  loading = false,
  compact = false,
}: BeadDetailPanelProps) {
  const status = beadStatusToStatus(bead.status)
  const journeyStage = deriveJourneyStage(bead.status)
  const substage = deriveSubstage(bead.status)
  const timestamps = buildJourneyTimestamps(bead)
  const activityEvents = generateBeadActivityEvents(bead)

  const details = [
    { label: "Title", value: bead.title },
    { label: "ID", value: bead.id },
    { label: "Type", value: bead.issue_type },
    { label: "Status", value: bead.status },
    { label: "Priority", value: priorityLabel(bead.priority) },
    ...(bead.assignee ? [{ label: "Assignee", value: bead.assignee }] : []),
    ...(bead.created_by ? [{ label: "Created By", value: bead.created_by }] : []),
    { label: "Created", value: formatDate(bead.created_at) },
    { label: "Updated", value: formatDate(bead.updated_at) },
    ...(bead.parent ? [{ label: "Parent", value: bead.parent }] : []),
  ]

  const isBlocked = bead.status === "blocked" ||
    (bead.dependencies?.some(d =>
      d.dependency_type === "blocks" &&
      d.status !== "closed" &&
      d.status !== "done" &&
      d.status !== "completed"
    ) ?? false)

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {/* Journey Tracker */}
      <Panel>
        <PanelHeader icon="road" title="Work Journey" />
        <PanelBody>
          <JourneyTracker
            issueId={bead.id}
            currentStage={journeyStage}
            substage={substage}
            timestamps={timestamps}
            actor={bead.assignee}
            blocked={isBlocked}
          />
        </PanelBody>
      </Panel>

      {/* Dependencies - Blocked By & Parent Epic */}
      <div className={`grid grid-cols-1 ${compact ? "" : "lg:grid-cols-2"} gap-4`}>
        <Panel>
          <PanelHeader
            icon="lock"
            title="Blocked By"
            actions={
              <span className="caption text-ash">
                {bead.dependencies?.filter(d => d.dependency_type === "blocks").length ?? 0} dependencies
              </span>
            }
          />
          <PanelBody className="p-0">
            {loading ? (
              <div className="p-4 text-center">
                <p className="caption text-ash">Loading...</p>
              </div>
            ) : (
              <DependenciesList
                dependencies={bead.dependencies || []}
                type="blocks"
              />
            )}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            icon="container"
            title="Parent Epic"
            actions={
              bead.parent ? (
                <Link href={`/bead/${bead.parent}`} className="caption text-fuel-yellow hover:underline">
                  {bead.parent}
                </Link>
              ) : (
                <span className="caption text-ash">None</span>
              )
            }
          />
          <PanelBody className="p-0">
            {loading ? (
              <div className="p-4 text-center">
                <p className="caption text-ash">Loading...</p>
              </div>
            ) : (
              <DependenciesList
                dependencies={bead.dependencies || []}
                type="parent-child"
              />
            )}
          </PanelBody>
        </Panel>
      </div>

      {/* Main content grid - Status & Activity */}
      <div className={`grid grid-cols-1 ${compact ? "" : "lg:grid-cols-2"} gap-4`}>
        {/* Status panel */}
        <BeadStatusSection
          status={status}
          details={details}
          loading={loading}
        />

        {/* Activity timeline */}
        <ActivityTimeline
          events={activityEvents}
          loading={loading}
          maxEvents={compact ? 5 : 10}
        />
      </div>

      {/* Description */}
      <DescriptionSection description={bead.description} />
    </div>
  )
}

/**
 * Compact variant of BeadDetailPanel for side panels or overlays.
 * Shows only essential information in a condensed layout.
 */
export function BeadDetailPanelCompact({
  bead,
  loading = false,
}: Pick<BeadDetailPanelProps, "bead" | "loading">) {
  return (
    <BeadDetailPanel
      bead={bead}
      loading={loading}
      compact={true}
    />
  )
}
