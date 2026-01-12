"use client"

import { use } from "react"
import Link from "next/link"
import { ActionButton, Panel, PanelHeader, PanelBody } from "@/components/ui"
import { StatusExplanation, ActivityTimeline, type ActivityEvent } from "@/components/dashboard"
import { ConvoyBeads } from "@/components/convoy"
import { useConvoyDetail, useConvoyBeads } from "@/hooks"
import type { Status } from "@/components/ui"
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
    case "running":
      return "active"
    case "open":
    case "pending":
    case "queued":
      return "thinking"
    case "blocked":
      return "blocked"
    case "completed":
    case "done":
      return "done"
    case "failed":
    case "error":
      return "dead"
    default:
      return "thinking"
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
  status: string,
  createdAt: string
): ActivityEvent[] {
  const events: ActivityEvent[] = []

  if (createdAt) {
    events.push({
      id: "created",
      timestamp: createdAt,
      type: "work_started",
      title: "Convoy created",
      description: `Initial status: ${status}`,
    })
  }

  if (status === "active") {
    events.push({
      id: "active",
      timestamp: new Date().toISOString(),
      type: "info",
      title: "Convoy in progress",
      description: "Workers are processing assigned issues",
    })
  } else if (status === "completed" || status === "done") {
    events.push({
      id: "completed",
      timestamp: new Date().toISOString(),
      type: "work_completed",
      title: "Convoy completed",
      description: "All assigned work has been finished",
    })
  }

  return events
}

function WorkersList({ workers }: { workers: string[] }) {
  if (!workers || workers.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="caption text-ash">No workers assigned</p>
      </div>
    )
  }

  return (
    <div className="px-4">
      {workers.map((worker) => (
        <Link
          key={worker}
          href={`/worker/${worker.replace("/", "/")}`}
          className="flex items-center gap-3 py-3 border-b border-chrome-border/30 last:border-0 hover:bg-carbon-black/30 -mx-4 px-4 transition-colors"
        >
          <Icon name="terminal" aria-label="" variant="muted" size="sm" />
          <span className="body-text">{worker}</span>
        </Link>
      ))}
    </div>
  )
}

export default function ConvoyPage({ params }: ConvoyPageProps) {
  const { id } = use(params)
  const decodedId = decodeURIComponent(id)

  const { data: convoy, isLoading, error, refresh } = useConvoyDetail({
    id: decodedId,
    refreshInterval: 30000,
  })

  const { data: beads, isLoading: beadsLoading } = useConvoyBeads({
    convoyId: decodedId,
    refreshInterval: 30000,
  })

  const status = convoy
    ? convoyStatusToStatus(convoy.status)
    : "thinking"

  const details = convoy
    ? [
        { label: "ID", value: convoy.id },
        { label: "Status", value: convoy.status },
        { label: "Created", value: formatCreatedAt(convoy.created_at) },
        { label: "Issues", value: String(convoy.issues?.length ?? 0) },
        { label: "Workers", value: String(convoy.assigned_workers?.length ?? 0) },
      ]
    : []

  const activityEvents = convoy
    ? generateConvoyActivityEvents(convoy.status, convoy.created_at)
    : []

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
              {convoy?.title || decodedId}
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
      <ConvoyBeads beads={beads || []} isLoading={beadsLoading} />

      {/* Workers */}
      <Panel>
        <PanelHeader
          icon="truck"
          title="Assigned Workers"
          actions={
            <span className="caption text-ash">
              {convoy?.assigned_workers?.length ?? 0} total
            </span>
          }
        />
        <PanelBody className="p-0">
          {isLoading ? (
            <div className="p-4 text-center">
              <p className="caption text-ash">Loading...</p>
            </div>
          ) : (
            <WorkersList workers={convoy?.assigned_workers || []} />
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}
