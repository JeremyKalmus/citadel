"use client"

import { use } from "react"
import Link from "next/link"
import { ActionButton, Panel, PanelHeader, PanelBody, StatusBadge } from "@/components/ui"
import { ActivityTimeline, type ActivityEvent } from "@/components/dashboard"
import { useBeadDetail } from "@/hooks"
import type { Status } from "@/components/ui"
import type { BeadDependency } from "@/lib/gastown"
import { RefreshCw, ArrowLeft, CheckCircle, XCircle, Edit2, Link2 } from "lucide-react"
import { Icon } from "@/components/ui/icon"

interface BeadPageProps {
  params: Promise<{
    id: string
  }>
}

function beadStatusToStatus(status: string): Status {
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

function generateBeadActivityEvents(
  status: string,
  createdAt: string,
  updatedAt: string
): ActivityEvent[] {
  const events: ActivityEvent[] = []

  if (createdAt) {
    events.push({
      id: "created",
      timestamp: createdAt,
      type: "work_started",
      title: "Bead created",
      description: `Initial status: open`,
    })
  }

  if (updatedAt && updatedAt !== createdAt) {
    events.push({
      id: "updated",
      timestamp: updatedAt,
      type: "state_change",
      title: "Status updated",
      description: `Current status: ${status}`,
    })
  }

  if (status === "in_progress" || status === "hooked") {
    events.push({
      id: "active",
      timestamp: new Date().toISOString(),
      type: "info",
      title: "Work in progress",
      description: "Assigned worker is actively working on this bead",
    })
  } else if (status === "closed" || status === "done" || status === "completed") {
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

function DependenciesList({ dependencies, type }: { dependencies: BeadDependency[], type: "blocks" | "parent-child" }) {
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

function BeadStatusPanel({
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
                    className="flex items-center justify-between py-2 border-b border-chrome-border/30 last:border-0"
                  >
                    <span className="label text-ash">{detail.label}</span>
                    <span className="body-text font-medium">{detail.value}</span>
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

function BeadActions({ beadId, status }: { beadId: string; status: string }) {
  const isOpen = status === "open" || status === "in_progress" || status === "hooked"

  return (
    <Panel>
      <PanelHeader icon="settings" title="Actions" />
      <PanelBody>
        <div className="flex flex-wrap gap-2">
          {isOpen && (
            <>
              <ActionButton
                variant="default"
                size="sm"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => {
                  // In a real implementation, this would call the API
                  alert(`Close bead ${beadId}? (Not implemented - read-only dashboard)`)
                }}
              >
                Close
              </ActionButton>
              <ActionButton
                variant="ghost"
                size="sm"
                icon={<Edit2 className="w-4 h-4" />}
                onClick={() => {
                  alert(`Edit bead ${beadId}? (Not implemented - read-only dashboard)`)
                }}
              >
                Edit
              </ActionButton>
            </>
          )}
          {!isOpen && (
            <ActionButton
              variant="ghost"
              size="sm"
              icon={<XCircle className="w-4 h-4" />}
              onClick={() => {
                alert(`Reopen bead ${beadId}? (Not implemented - read-only dashboard)`)
              }}
            >
              Reopen
            </ActionButton>
          )}
          <ActionButton
            variant="ghost"
            size="sm"
            icon={<Link2 className="w-4 h-4" />}
            onClick={() => {
              navigator.clipboard.writeText(beadId)
              alert(`Copied ${beadId} to clipboard`)
            }}
          >
            Copy ID
          </ActionButton>
        </div>
        <p className="caption text-ash mt-3">
          Actions are read-only in the dashboard. Use the <code className="font-mono text-bone">bd</code> CLI for modifications.
        </p>
      </PanelBody>
    </Panel>
  )
}

function DescriptionPanel({ description }: { description?: string }) {
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

export default function BeadPage({ params }: BeadPageProps) {
  const { id } = use(params)
  const decodedId = decodeURIComponent(id)

  const { data: bead, isLoading, error, refresh } = useBeadDetail({
    id: decodedId,
    refreshInterval: 30000,
  })

  const status = bead
    ? beadStatusToStatus(bead.status)
    : "thinking"

  const details = bead
    ? [
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
    : []

  const activityEvents = bead
    ? generateBeadActivityEvents(bead.status, bead.created_at, bead.updated_at)
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
            <h1 className="text-2xl sm:text-4xl font-bold text-bone break-all">{decodedId}</h1>
            <p className="body-text-muted mt-1">Bead Detail View</p>
          </div>
        </div>
        <Panel>
          <PanelBody>
            <div className="text-center py-8">
              <Icon name="exclamation-triangle" aria-label="Error" variant="alert" size="xl" className="mx-auto mb-4" />
              <p className="body-text text-ash">Bead not found or unavailable</p>
              <p className="caption text-ash mt-2">
                This bead may have been closed or does not exist.
              </p>
            </div>
          </PanelBody>
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page header - responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <Link href="/" className="mt-1 sm:mt-0">
            <ActionButton variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              <span className="hidden sm:inline">Back</span>
            </ActionButton>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-4xl font-bold text-bone break-words">
              {bead?.title || decodedId}
            </h1>
            <p className="body-text-muted mt-1 font-mono text-sm">{decodedId}</p>
          </div>
        </div>
        <ActionButton
          variant="ghost"
          onClick={() => refresh()}
          loading={isLoading}
          icon={<RefreshCw className="w-4 h-4" />}
          className="self-start sm:self-auto"
        >
          Refresh
        </ActionButton>
      </div>

      {/* Main content grid - responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Status panel */}
        <BeadStatusPanel
          status={status}
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

      {/* Description - full width */}
      {bead?.description && (
        <DescriptionPanel description={bead.description} />
      )}

      {/* Actions panel - responsive */}
      <BeadActions beadId={decodedId} status={bead?.status || "open"} />

      {/* Dependencies - responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Panel>
          <PanelHeader
            icon="lock"
            title="Blocked By"
            actions={
              <span className="caption text-ash">
                {bead?.dependencies?.filter(d => d.dependency_type === "blocks").length ?? 0} dependencies
              </span>
            }
          />
          <PanelBody className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                <p className="caption text-ash">Loading...</p>
              </div>
            ) : (
              <DependenciesList
                dependencies={bead?.dependencies || []}
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
              bead?.parent ? (
                <Link href={`/bead/${bead.parent}`} className="caption text-fuel-yellow hover:underline">
                  {bead.parent}
                </Link>
              ) : (
                <span className="caption text-ash">None</span>
              )
            }
          />
          <PanelBody className="p-0">
            {isLoading ? (
              <div className="p-4 text-center">
                <p className="caption text-ash">Loading...</p>
              </div>
            ) : (
              <DependenciesList
                dependencies={bead?.dependencies || []}
                type="parent-child"
              />
            )}
          </PanelBody>
        </Panel>
      </div>
    </div>
  )
}
