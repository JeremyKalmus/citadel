"use client"

import { use } from "react"
import Link from "next/link"
import { ActionButton, Panel, PanelHeader, PanelBody } from "@/components/ui"
import { StatusExplanation, ActivityTimeline, type ActivityEvent } from "@/components/dashboard"
import { ConvoyBeads } from "@/components/convoy"
import { useConvoyDetail, useConvoyBeads } from "@/hooks"
import type { Status } from "@/components/ui"
import type { Bead } from "@/lib/gastown"
import { RefreshCw, ArrowLeft, Container, ArrowRight, Circle, User, Truck } from "lucide-react"
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

/**
 * Parse worker path to extract rig and worker name.
 */
function parseWorkerPath(path: string): { rig: string; worker: string; type: string } {
  const parts = path.split("/")
  if (parts.length >= 3) {
    return {
      rig: parts[0],
      worker: parts[parts.length - 1],
      type: parts[1] === "polecats" ? "polecat" : parts[1] === "crew" ? "crew" : "worker",
    }
  }
  return { rig: "", worker: path, type: "worker" }
}

/**
 * Group workers by their rig.
 */
function groupWorkersByRig(workers: string[]): Map<string, Array<{ path: string; worker: string; type: string }>> {
  const grouped = new Map<string, Array<{ path: string; worker: string; type: string }>>()

  for (const workerPath of workers) {
    const parsed = parseWorkerPath(workerPath)
    const rigName = parsed.rig || "unknown"

    if (!grouped.has(rigName)) {
      grouped.set(rigName, [])
    }
    grouped.get(rigName)!.push({
      path: workerPath,
      worker: parsed.worker,
      type: parsed.type,
    })
  }

  return grouped
}

/**
 * RelationshipBreadcrumb - Visual explanation of convoy→bead→rig hierarchy.
 */
function RelationshipBreadcrumb({ beadsCount, workersCount, rigsCount }: {
  beadsCount: number
  workersCount: number
  rigsCount: number
}) {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Convoy */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gunmetal">
          <Truck className="w-4 h-4 text-bone" />
          <span className="text-sm font-mono text-bone">Convoy</span>
        </div>

        <ArrowRight className="w-4 h-4 text-ash" />

        {/* Beads */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-acid-green/10 border border-acid-green/30">
          <Circle className="w-4 h-4 text-acid-green" />
          <span className="text-sm font-mono text-acid-green">{beadsCount} beads</span>
        </div>

        <ArrowRight className="w-4 h-4 text-ash" />

        {/* Rigs */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-chrome-border/30">
          <Container className="w-4 h-4 text-ash" />
          <span className="text-sm font-mono text-ash">{rigsCount} rig{rigsCount !== 1 ? "s" : ""}</span>
        </div>

        <ArrowRight className="w-4 h-4 text-ash" />

        {/* Workers */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-fuel-yellow/10 border border-fuel-yellow/30">
          <User className="w-4 h-4 text-fuel-yellow" />
          <span className="text-sm font-mono text-fuel-yellow">{workersCount} worker{workersCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <p className="text-xs text-ash text-center mt-3">
        Work flows from convoy → individual beads → processed by workers in rigs
      </p>
    </Panel>
  )
}

function WorkersList({ workers }: { workers: string[] }) {
  if (!workers || workers.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="caption text-ash">No workers assigned</p>
      </div>
    )
  }

  const groupedByRig = groupWorkersByRig(workers)

  return (
    <div className="divide-y divide-chrome-border/30">
      {Array.from(groupedByRig.entries()).map(([rigName, rigWorkers]) => (
        <div key={rigName} className="py-2">
          {/* Rig header */}
          <Link
            href={`/rig/${rigName}`}
            className="flex items-center gap-2 px-4 py-2 hover:bg-carbon-black/20 transition-colors"
          >
            <Container className="w-4 h-4 text-ash" />
            <span className="text-xs font-mono text-ash uppercase">{rigName}</span>
            <span className="text-xs text-ash">({rigWorkers.length} worker{rigWorkers.length !== 1 ? "s" : ""})</span>
          </Link>

          {/* Workers in this rig */}
          <div className="pl-8">
            {rigWorkers.map(({ path, worker, type }) => (
              <Link
                key={path}
                href={`/worker/${path}`}
                className="flex items-center gap-3 py-2 px-4 hover:bg-carbon-black/30 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-fuel-yellow" />
                <span className="body-text text-bone">{worker}</span>
                <span className="text-xs text-ash px-1.5 py-0.5 rounded bg-gunmetal">{type}</span>
              </Link>
            ))}
          </div>
        </div>
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
        { label: "Issues", value: String(convoy.tracked?.length ?? 0) },
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

      {/* Relationship breadcrumb - shows convoy→beads→rigs→workers flow */}
      {!isLoading && !beadsLoading && (
        <RelationshipBreadcrumb
          beadsCount={beads?.length ?? 0}
          workersCount={convoy?.assigned_workers?.length ?? 0}
          rigsCount={
            convoy?.assigned_workers
              ? new Set(
                  convoy.assigned_workers
                    .map((w) => w.split("/")[0])
                    .filter(Boolean)
                ).size
              : 0
          }
        />
      )}

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
