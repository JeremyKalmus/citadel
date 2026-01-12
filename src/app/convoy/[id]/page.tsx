"use client"

import { use } from "react"
import Link from "next/link"
import { ActionButton, Panel, PanelHeader, PanelBody } from "@/components/ui"
import { StatusExplanation, ActivityTimeline, type ActivityEvent } from "@/components/dashboard"
import { BeadStatusRow } from "@/components/convoy"
import { useEnhancedConvoyDetail } from "@/hooks"
import type { Status } from "@/components/ui"
import type { BeadJourneyState, EnhancedConvoyDetail } from "@/lib/gastown"
import { RefreshCw, ArrowLeft } from "lucide-react"
import { Icon } from "@/components/ui/icon"

interface ConvoyPageProps {
  params: Promise<{
    id: string
  }>
}

function convoyStatusToStatus(status: string): Status {
  switch (status.toLowerCase()) {
    case "active":
      return "active"
    case "pending":
      return "thinking"
    case "blocked":
      return "blocked"
    case "completed":
    case "done":
      return "done"
    case "failed":
      return "dead"
    default:
      return "active"
  }
}

function formatCreatedAt(createdAt: string): string {
  try {
    const date = new Date(createdAt)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return createdAt
  }
}

function generateConvoyActivityEvents(
  data: EnhancedConvoyDetail | null
): ActivityEvent[] {
  if (!data) return []

  const events: ActivityEvent[] = []

  // Convoy created event
  if (data.created_at) {
    events.push({
      id: "created",
      timestamp: data.created_at,
      type: "work_started",
      title: "Convoy created",
      description: `Status: ${data.status}`,
    })
  }

  // Add events from bead states
  for (const bead of data.beadStates) {
    if (bead.stage === "refinery" && bead.refinery) {
      events.push({
        id: `refinery-${bead.beadId}`,
        timestamp: bead.lastActivity,
        type: "info",
        title: `${bead.beadId} entered refinery`,
        description: `Queue position: #${bead.refinery.position} of ${bead.refinery.queueLength}`,
      })
    } else if (bead.stage === "merged") {
      events.push({
        id: `merged-${bead.beadId}`,
        timestamp: bead.lastActivity,
        type: "work_completed",
        title: `${bead.beadId} merged`,
        description: bead.title,
      })
    } else if (bead.needsNudge) {
      events.push({
        id: `nudge-${bead.beadId}`,
        timestamp: bead.lastActivity,
        type: "error",
        title: `${bead.beadId} needs nudge`,
        description: `Idle in ${bead.stage} stage`,
      })
    }
  }

  // Sort by timestamp descending (most recent first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return events
}

interface WorkerAssignment {
  worker: string
  beads: BeadJourneyState[]
}

function extractWorkerAssignments(beadStates: BeadJourneyState[]): WorkerAssignment[] {
  const workerMap = new Map<string, BeadJourneyState[]>()

  for (const bead of beadStates) {
    if (bead.worker) {
      const existing = workerMap.get(bead.worker) || []
      existing.push(bead)
      workerMap.set(bead.worker, existing)
    }
  }

  return Array.from(workerMap.entries()).map(([worker, beads]) => ({
    worker,
    beads,
  }))
}

function WorkersList({ assignments }: { assignments: WorkerAssignment[] }) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="caption text-ash">No workers assigned</p>
      </div>
    )
  }

  return (
    <div className="px-4">
      {assignments.map(({ worker, beads }) => (
        <Link
          key={worker}
          href={`/worker/${encodeURIComponent(worker)}`}
          className="flex items-center justify-between py-3 border-b border-chrome-border/30 last:border-0 hover:bg-carbon-black/30 -mx-4 px-4 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon name="terminal" aria-label="" variant="muted" size="sm" />
            <span className="body-text">{worker}</span>
          </div>
          <span className="caption text-ash">
            {beads.length} bead{beads.length !== 1 ? "s" : ""}
          </span>
        </Link>
      ))}
    </div>
  )
}

export default function ConvoyPage({ params }: ConvoyPageProps) {
  const { id } = use(params)
  const decodedId = decodeURIComponent(id)

  const { data, isLoading, error, refresh } = useEnhancedConvoyDetail({
    id: decodedId,
    refreshInterval: 5000,
  })

  const status = data
    ? convoyStatusToStatus(data.status)
    : "thinking"

  const workerAssignments = data ? extractWorkerAssignments(data.beadStates) : []

  const details = data
    ? [
        { label: "ID", value: data.id },
        { label: "Status", value: data.status },
        { label: "Created", value: formatCreatedAt(data.created_at) },
        { label: "Beads", value: String(data.beadStates.length) },
        { label: "Working", value: String(data.summary.working) },
        { label: "In Refinery", value: String(data.summary.inRefinery) },
        { label: "Merged", value: String(data.summary.merged) },
      ]
    : []

  const activityEvents = generateConvoyActivityEvents(data)

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <ActionButton variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </ActionButton>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-bone">{decodedId}</h1>
            <p className="body-text-muted mt-1">Convoy Detail View</p>
          </div>
        </div>
        <Panel>
          <PanelBody>
            <div className="text-center py-8">
              <Icon name="exclamation-triangle" aria-label="Error" variant="alert" size="xl" className="mx-auto mb-4" />
              <p className="body-text text-ash">Convoy not found or unavailable</p>
              <p className="caption text-ash mt-2">
                This convoy may have been completed or does not exist.
              </p>
            </div>
          </PanelBody>
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <ActionButton variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </ActionButton>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-bone">
              {data?.title || decodedId}
            </h1>
            <p className="body-text-muted mt-1">Convoy Detail View</p>
          </div>
        </div>
        <ActionButton
          variant="ghost"
          onClick={() => refresh()}
          loading={isLoading}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </ActionButton>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status explanation */}
        <StatusExplanation
          status={status}
          title="Convoy Status"
          details={details}
          loading={isLoading}
        />

        {/* Activity timeline */}
        <ActivityTimeline
          events={activityEvents}
          loading={isLoading}
          maxEvents={10}
        />
      </div>

      {/* Linked Beads */}
      <Panel>
        <PanelHeader
          icon="link"
          title="Linked Beads"
          actions={
            <span className="caption text-ash">
              {data?.beadStates.length ?? 0} total
            </span>
          }
        />
        <PanelBody className="p-0">
          {isLoading ? (
            <div className="p-4 text-center">
              <p className="caption text-ash">Loading beads...</p>
            </div>
          ) : data?.beadStates && data.beadStates.length > 0 ? (
            <div className="divide-y divide-chrome-border/20">
              {data.beadStates.map((bead) => (
                <BeadStatusRow key={bead.beadId} bead={bead} />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="caption text-ash">No beads linked to this convoy</p>
            </div>
          )}
        </PanelBody>
      </Panel>

      {/* Workers */}
      <Panel>
        <PanelHeader
          icon="truck"
          title="Assigned Workers"
          actions={
            <span className="caption text-ash">
              {workerAssignments.length} total
            </span>
          }
        />
        <PanelBody className="p-0">
          {isLoading ? (
            <div className="p-4 text-center">
              <p className="caption text-ash">Loading...</p>
            </div>
          ) : (
            <WorkersList assignments={workerAssignments} />
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}
