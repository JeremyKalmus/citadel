"use client"

import { useMemo } from "react"
import { Panel, PanelHeader, PanelBody, StatusBadge } from "@/components/ui"
import { ActivityTimeline, type ActivityEvent } from "@/components/dashboard"
import { EpicJourneyTracker } from "@/components/journey/epic-journey-tracker"
import { SubIssuesList } from "./sub-issues-list"
import { EpicProgressGauge } from "./epic-progress-gauge"
import { Icon } from "@/components/ui/icon"
import type { Status } from "@/components/ui"
import type { BeadDetail, Bead } from "@/lib/gastown"
import {
  EpicJourneyStage,
  type EpicProgress,
  type EpicJourneyTimestamps,
  deriveEpicJourneyStage,
  calculateEpicProgress,
} from "@/lib/gastown/types"

// ============================================================================
// Type Definitions
// ============================================================================

export interface EpicDetailPanelProps {
  /** The epic bead data to display */
  epic: BeadDetail
  /** Children of the epic */
  children: Bead[]
  /** Whether the panel is in a loading state */
  loading?: boolean
  /** Callback when refresh is requested */
  onRefresh?: () => void
  /** Callback when a child is selected */
  onChildSelect?: (bead: Bead) => void
  /** Whether in compact mode (for side panels) */
  compact?: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map bead status string to Status type for StatusBadge
 */
function epicStatusToStatus(status: string | undefined | null): Status {
  if (!status) return "thinking"
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
 * Build epic journey timestamps from epic and children data
 */
function buildEpicJourneyTimestamps(
  epic: BeadDetail,
  children: Bead[],
  progress: EpicProgress
): EpicJourneyTimestamps {
  const timestamps: EpicJourneyTimestamps = {
    created: epic.created_at,
  }

  // Planned = when first child was created
  if (children.length > 0) {
    const sortedByCreated = [...children].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    timestamps.planned = sortedByCreated[0].created_at
  }

  // Activated = when first child entered in_progress
  const inProgressChildren = children.filter(
    (c) => c.status === "in_progress" || c.status === "hooked"
  )
  if (inProgressChildren.length > 0 || progress.closed > 0) {
    // If any are in progress or closed, we've been activated at some point
    timestamps.activated = epic.updated_at // Approximate
  }

  // Close-eligible = when all children closed (if 100%)
  if (progress.percentComplete === 100 && progress.total > 0) {
    const sortedByClosed = [...children].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    timestamps.closeEligible = sortedByClosed[0]?.updated_at
  }

  // Closed = when epic itself was closed
  if (epic.status === "closed") {
    timestamps.closed = epic.updated_at
  }

  return timestamps
}

/**
 * Generate activity events from epic and children data
 */
function generateEpicActivityEvents(
  epic: BeadDetail,
  children: Bead[],
  progress: EpicProgress
): ActivityEvent[] {
  const events: ActivityEvent[] = []

  // Epic created
  if (epic.created_at) {
    events.push({
      id: "created",
      timestamp: epic.created_at,
      type: "work_started",
      title: "Epic created",
      description: `Initial status: ${epic.status}`,
    })
  }

  // Children added
  if (children.length > 0) {
    const sortedByCreated = [...children].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    events.push({
      id: "first-child",
      timestamp: sortedByCreated[0].created_at,
      type: "state_change",
      title: "First sub-issue added",
      description: sortedByCreated[0].title,
    })
  }

  // Progress milestone
  if (progress.percentComplete >= 50 && progress.percentComplete < 100) {
    events.push({
      id: "halfway",
      timestamp: epic.updated_at,
      type: "info",
      title: "Milestone reached",
      description: `${progress.percentComplete}% complete (${progress.closed}/${progress.total})`,
    })
  }

  // Close-eligible
  if (progress.percentComplete === 100 && progress.total > 0 && epic.status !== "closed") {
    events.push({
      id: "close-eligible",
      timestamp: epic.updated_at,
      type: "work_completed",
      title: "Ready to close",
      description: `All ${progress.total} sub-issues completed`,
    })
  }

  // Closed
  if (epic.status === "closed") {
    events.push({
      id: "closed",
      timestamp: epic.updated_at,
      type: "work_completed",
      title: "Epic closed",
      description: "All work completed and epic finalized",
    })
  }

  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Status section for epic details
 */
function EpicStatusSection({
  status,
  details,
  loading,
  isCloseEligible,
}: {
  status: Status
  details: { label: string; value: string }[]
  loading: boolean
  isCloseEligible: boolean
}) {
  const statusExplanations: Record<string, string> = {
    thinking: "Epic is defined and tracking progress of sub-issues.",
    active: "Sub-issues are being actively worked on.",
    blocked: "Epic progress is blocked by dependencies or issues.",
    done: "Epic has been completed and closed.",
  }

  return (
    <Panel>
      <PanelHeader
        icon="activity"
        title="Epic Status"
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
                <Icon
                  name="brain"
                  aria-label=""
                  variant="muted"
                  size="sm"
                  className="flex-shrink-0 mt-0.5"
                />
                <p className="caption text-ash leading-relaxed">
                  {isCloseEligible
                    ? "All sub-issues are complete. This epic is ready to be closed."
                    : statusExplanations[status] || "Epic status unknown."}
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
 * Description panel for epic
 */
function DescriptionSection({ description }: { description?: string }) {
  if (!description) return null

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
 * EpicDetailPanel Component
 *
 * A comprehensive panel for displaying epic details including:
 * - Epic journey visualization (Created → Planned → Active → Close-Eligible → Closed)
 * - Progress gauge (children only, excludes epic itself)
 * - Sub-issues list (NOT parent epic)
 * - Status and metadata
 * - Activity timeline
 * - Description
 *
 * Key differences from BeadDetailPanel:
 * - Different journey lifecycle (container vs atomic work)
 * - Shows "Sub-Issues" instead of "Parent Epic"
 * - Close-eligible state is GREEN (ready to close)
 * - Gauge counts children only
 *
 * @example
 * ```tsx
 * <EpicDetailPanel
 *   epic={epicData}
 *   children={childBeads}
 *   loading={isLoading}
 *   onChildSelect={(bead) => navigate(`/bead/${bead.id}`)}
 * />
 * ```
 */
export function EpicDetailPanel({
  epic,
  children,
  loading = false,
  onChildSelect,
  compact = false,
}: EpicDetailPanelProps) {
  // Calculate progress from children (excludes epic itself)
  const progress = useMemo(() => calculateEpicProgress(children), [children])

  // Derive journey stage
  const journeyStage = useMemo(
    () => deriveEpicJourneyStage(epic.status, progress),
    [epic.status, progress]
  )

  // Build timestamps
  const timestamps = useMemo(
    () => buildEpicJourneyTimestamps(epic, children, progress),
    [epic, children, progress]
  )

  // Generate activity events
  const activityEvents = useMemo(
    () => generateEpicActivityEvents(epic, children, progress),
    [epic, children, progress]
  )

  const status = epicStatusToStatus(epic.status)
  const isCloseEligible = journeyStage === EpicJourneyStage.CLOSE_ELIGIBLE

  const details = [
    { label: "Title", value: epic.title },
    { label: "ID", value: epic.id },
    { label: "Type", value: "Epic" },
    { label: "Status", value: epic.status },
    { label: "Priority", value: priorityLabel(epic.priority) },
    ...(epic.assignee ? [{ label: "Owner", value: epic.assignee }] : []),
    ...(epic.created_by ? [{ label: "Created By", value: epic.created_by }] : []),
    { label: "Created", value: formatDate(epic.created_at) },
    { label: "Updated", value: formatDate(epic.updated_at) },
    { label: "Sub-Issues", value: `${progress.total}` },
    { label: "Progress", value: `${progress.percentComplete}%` },
  ]

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {/* Epic Journey Tracker */}
      <Panel>
        <PanelHeader icon="compass" title="Epic Journey" />
        <PanelBody>
          <EpicJourneyTracker
            epicId={epic.id}
            currentStage={journeyStage}
            timestamps={timestamps}
            progress={progress}
          />
        </PanelBody>
      </Panel>

      {/* Progress Gauge & Sub-Issues side by side */}
      <div className={`grid grid-cols-1 ${compact ? "" : "lg:grid-cols-2"} gap-4`}>
        {/* Progress Gauge */}
        <Panel>
          <PanelHeader
            icon="activity"
            title="Progress"
            actions={
              <span className="caption text-ash">
                {progress.closed}/{progress.total} complete
              </span>
            }
          />
          <PanelBody>
            <EpicProgressGauge
              progress={progress}
              showPercentage={true}
              showBreakdown={true}
            />
          </PanelBody>
        </Panel>

        {/* Activity Timeline */}
        <ActivityTimeline
          events={activityEvents}
          loading={loading}
          maxEvents={compact ? 5 : 10}
        />
      </div>

      {/* Sub-Issues List (NOT Parent Epic) */}
      <Panel>
        <PanelHeader
          icon="layers"
          title="Sub-Issues"
          actions={
            <span className="caption text-ash">
              {progress.total} items
            </span>
          }
        />
        <PanelBody className="p-0">
          {loading ? (
            <div className="p-4 text-center">
              <p className="caption text-ash">Loading sub-issues...</p>
            </div>
          ) : (
            <SubIssuesList
              children={children}
              onSelect={onChildSelect}
              progress={progress}
            />
          )}
        </PanelBody>
      </Panel>

      {/* Status & Metadata */}
      <EpicStatusSection
        status={status}
        details={details}
        loading={loading}
        isCloseEligible={isCloseEligible}
      />

      {/* Description */}
      <DescriptionSection description={epic.description} />
    </div>
  )
}

/**
 * Compact variant for side panels or overlays
 */
export function EpicDetailPanelCompact({
  epic,
  children,
  loading = false,
  onChildSelect,
}: Omit<EpicDetailPanelProps, "compact">) {
  return (
    <EpicDetailPanel
      epic={epic}
      children={children}
      loading={loading}
      onChildSelect={onChildSelect}
      compact={true}
    />
  )
}
