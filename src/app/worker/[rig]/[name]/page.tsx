"use client"

import { use, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ActionButton, ConfirmDialog } from "@/components/ui"
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel"
import { StatusExplanation, ActivityTimeline, type ActivityEvent } from "@/components/dashboard"
import { JourneyTracker } from "@/components/journey"
import { usePolecatDetail, usePolecatActions } from "@/hooks"
import type { Status } from "@/components/ui"
import {
  JourneyStage,
  type WorkingSubstage,
} from "@/lib/gastown/types"
import { RefreshCw, ArrowLeft, MessageSquare, Skull, ArrowRightLeft } from "lucide-react"

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

/**
 * Derive journey stage from polecat state.
 * This is a temporary mapping until we have proper journey tracking via events.
 */
function deriveJourneyStage(state: string, sessionRunning: boolean): JourneyStage {
  if (!sessionRunning) {
    // If session not running, could be done or stalled
    return state === "done" ? JourneyStage.MERGED : JourneyStage.CLAIMED
  }
  switch (state) {
    case "waiting":
      return JourneyStage.CLAIMED
    case "working":
      return JourneyStage.WORKING
    case "done":
      return JourneyStage.MERGED
    case "blocked":
      return JourneyStage.WORKING // Still working, just blocked
    default:
      return JourneyStage.WORKING
  }
}

/**
 * Derive working substage from state (placeholder until proper event tracking).
 */
function deriveSubstage(state: string): WorkingSubstage | undefined {
  // For now, default to "coding" substage when working
  if (state === "working") return "2b"
  return undefined
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

type DialogType = "nudge" | "kill" | "reassign" | null

export default function WorkerPage({ params }: WorkerPageProps) {
  const { rig, name } = use(params)
  const decodedRig = decodeURIComponent(rig)
  const decodedName = decodeURIComponent(name)
  const router = useRouter()

  const { data: polecat, isLoading, refresh } = usePolecatDetail({
    rig: decodedRig,
    name: decodedName,
    refreshInterval: 30000,
  })

  const { nudge, kill, reassign, isLoading: actionLoading } = usePolecatActions({
    rig: decodedRig,
    name: decodedName,
    onSuccess: () => {
      setActiveDialog(null)
      refresh()
    },
  })

  const [activeDialog, setActiveDialog] = useState<DialogType>(null)
  const [nudgeMessage, setNudgeMessage] = useState("")
  const [reassignTarget, setReassignTarget] = useState({ rig: "", name: "" })

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Don't trigger if a dialog is open
      if (activeDialog) return

      switch (e.key.toLowerCase()) {
        case "n":
          setActiveDialog("nudge")
          break
        case "k":
          setActiveDialog("kill")
          break
        case "r":
          setActiveDialog("reassign")
          break
      }
    },
    [activeDialog]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

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

  const handleNudgeConfirm = async () => {
    if (!nudgeMessage.trim()) return
    const success = await nudge(nudgeMessage)
    if (success) {
      setNudgeMessage("")
    }
  }

  const handleKillConfirm = async () => {
    const success = await kill(false)
    if (success) {
      // Navigate back after kill
      router.push("/")
    }
  }

  const handleReassignConfirm = async () => {
    if (!reassignTarget.rig.trim() || !reassignTarget.name.trim()) return
    const success = await reassign(reassignTarget.rig, reassignTarget.name)
    if (success) {
      setReassignTarget({ rig: "", name: "" })
    }
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
              {decodedRig}/{decodedName}
            </h1>
            <p className="body-text-muted mt-1">Worker Detail View</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton
            variant="ghost"
            onClick={() => refresh()}
            loading={isLoading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </ActionButton>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <ActionButton
          onClick={() => setActiveDialog("nudge")}
          icon={<MessageSquare className="w-4 h-4" />}
        >
          Nudge
          <kbd className="ml-2 px-1 py-0.5 text-xs bg-gunmetal rounded">N</kbd>
        </ActionButton>
        <ActionButton
          variant="danger"
          onClick={() => setActiveDialog("kill")}
          icon={<Skull className="w-4 h-4" />}
        >
          Kill
          <kbd className="ml-2 px-1 py-0.5 text-xs bg-gunmetal rounded">K</kbd>
        </ActionButton>
        <ActionButton
          variant="ghost"
          onClick={() => setActiveDialog("reassign")}
          icon={<ArrowRightLeft className="w-4 h-4" />}
        >
          Reassign
          <kbd className="ml-2 px-1 py-0.5 text-xs bg-gunmetal rounded">R</kbd>
        </ActionButton>
      </div>

      {/* Journey tracker */}
      {polecat && (
        <Panel>
          <PanelHeader icon="route" title="Work Journey" />
          <PanelBody>
            <JourneyTracker
              issueId={polecat.branch.split("/").pop() || ""}
              currentStage={deriveJourneyStage(polecat.state, polecat.session_running)}
              substage={deriveSubstage(polecat.state)}
              timestamps={{
                queued: undefined, // TODO: Get from events
                claimed: polecat.last_activity !== "0001-01-01T00:00:00Z" ? polecat.last_activity : undefined,
                workStarted: polecat.session_running ? polecat.last_activity : undefined,
              }}
              actor={`${polecat.rig}/${polecat.name}`}
              blocked={polecat.state === "blocked"}
            />
          </PanelBody>
        </Panel>
      )}

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

      {/* Nudge Dialog */}
      <ConfirmDialog
        open={activeDialog === "nudge"}
        onClose={() => {
          setActiveDialog(null)
          setNudgeMessage("")
        }}
        onConfirm={handleNudgeConfirm}
        title="Nudge Worker"
        description={`Send a message to ${decodedRig}/${decodedName}'s Claude session.`}
        confirmLabel="Send"
        loading={actionLoading}
      >
        <textarea
          value={nudgeMessage}
          onChange={(e) => setNudgeMessage(e.target.value)}
          placeholder="Enter your message..."
          className="w-full h-24 px-3 py-2 rounded-sm bg-carbon-black border-2 border-chrome-border text-bone placeholder:text-ash resize-none focus:outline-none focus:border-bone"
          autoFocus
        />
      </ConfirmDialog>

      {/* Kill Dialog */}
      <ConfirmDialog
        open={activeDialog === "kill"}
        onClose={() => setActiveDialog(null)}
        onConfirm={handleKillConfirm}
        title="Kill Worker"
        description={`This will completely destroy ${decodedRig}/${decodedName}, including its session, worktree, branch, and agent bead. This action cannot be undone.`}
        confirmLabel="Kill"
        variant="danger"
        loading={actionLoading}
      />

      {/* Reassign Dialog */}
      <ConfirmDialog
        open={activeDialog === "reassign"}
        onClose={() => {
          setActiveDialog(null)
          setReassignTarget({ rig: "", name: "" })
        }}
        onConfirm={handleReassignConfirm}
        title="Reassign Work"
        description={`Transfer hooked work from ${decodedRig}/${decodedName} to another worker.`}
        confirmLabel="Reassign"
        loading={actionLoading}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-ash mb-1">Target Rig</label>
            <input
              type="text"
              value={reassignTarget.rig}
              onChange={(e) =>
                setReassignTarget((prev) => ({ ...prev, rig: e.target.value }))
              }
              placeholder="e.g., greenplace"
              className="w-full px-3 py-2 rounded-sm bg-carbon-black border-2 border-chrome-border text-bone placeholder:text-ash focus:outline-none focus:border-bone"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-ash mb-1">Target Worker</label>
            <input
              type="text"
              value={reassignTarget.name}
              onChange={(e) =>
                setReassignTarget((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Toast"
              className="w-full px-3 py-2 rounded-sm bg-carbon-black border-2 border-chrome-border text-bone placeholder:text-ash focus:outline-none focus:border-bone"
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
