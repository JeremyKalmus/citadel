"use client"

import { use } from "react"
import Link from "next/link"
import { ActionButton } from "@/components/ui"
import { StatusExplanation, ActivityTimeline, type ActivityEvent } from "@/components/dashboard"
import { usePolecatDetail } from "@/hooks"
import type { Status } from "@/components/ui"
import { RefreshCw, ArrowLeft } from "lucide-react"

interface WorkerPageProps {
  params: Promise<{
    rig: string
    name: string
  }>
}

function stateToStatus(state: string, sessionRunning: boolean): Status {
  if (!sessionRunning) return "unresponsive"
  switch (state) {
    case "working":
      return "active"
    case "blocked":
      return "blocked"
    case "waiting":
      return "thinking"
    case "dead":
      return "dead"
    case "done":
      return "done"
    default:
      return "active"
  }
}

function formatLastActivity(lastActivity: string): string {
  try {
    const date = new Date(lastActivity)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  } catch {
    return lastActivity
  }
}

function generateActivityEvents(
  state: string,
  lastActivity: string,
  sessionRunning: boolean
): ActivityEvent[] {
  const events: ActivityEvent[] = []
  const now = new Date()

  if (lastActivity && lastActivity !== "0001-01-01T00:00:00Z") {
    events.push({
      id: "last-activity",
      timestamp: lastActivity,
      type: sessionRunning ? "work_started" : "state_change",
      title: sessionRunning ? "Session active" : "Session ended",
      description: `Worker state: ${state}`,
    })
  }

  if (sessionRunning && state === "working") {
    events.push({
      id: "working",
      timestamp: now.toISOString(),
      type: "info",
      title: "Currently working",
      description: "Processing assigned tasks",
    })
  }

  return events
}

export default function WorkerPage({ params }: WorkerPageProps) {
  const { rig, name } = use(params)
  const decodedRig = decodeURIComponent(rig)
  const decodedName = decodeURIComponent(name)

  const { data: polecat, isLoading, refresh } = usePolecatDetail({
    rig: decodedRig,
    name: decodedName,
    refreshInterval: 30000,
  })

  const status = polecat
    ? stateToStatus(polecat.state, polecat.session_running)
    : "unresponsive"

  const details = polecat
    ? [
        { label: "Rig", value: polecat.rig },
        { label: "Branch", value: polecat.branch.split("/").pop() || polecat.branch },
        { label: "Session ID", value: polecat.session_id },
        { label: "Windows", value: String(polecat.windows) },
        { label: "Last Activity", value: formatLastActivity(polecat.last_activity) },
      ]
    : []

  const activityEvents = polecat
    ? generateActivityEvents(polecat.state, polecat.last_activity, polecat.session_running)
    : []

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
              {decodedRig}/{decodedName}
            </h1>
            <p className="body-text-muted mt-1">Worker Detail View</p>
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
          title="Worker Status"
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

      {/* Path info */}
      {polecat && (
        <div className="p-4 rounded-sm bg-gunmetal border-2 border-chrome-border">
          <p className="label text-ash mb-1">Clone Path</p>
          <p className="font-mono text-sm text-bone break-all">{polecat.clone_path}</p>
        </div>
      )}
    </div>
  )
}
