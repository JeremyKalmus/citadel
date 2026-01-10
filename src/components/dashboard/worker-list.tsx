"use client"

import Link from "next/link"
import { Panel, PanelHeader, PanelBody, StatusBadge, SkeletonRow, type Status } from "@/components/ui"
import { Icon } from "@/components/ui/icon"
import { CostSparkline } from "@/components/cost"
import type { Polecat } from "@/lib/gastown"
import type { ChartWorkerCost as WorkerCost } from "@/lib/gastown/types"

interface WorkerListProps {
  polecats: Polecat[] | null
  /** Optional cost data keyed by "rig/workerName" */
  workerCosts?: Map<string, WorkerCost>
  loading?: boolean
}

function getWorkerStatus(polecat: Polecat): Status {
  if (!polecat.session_running) return "unresponsive"
  switch (polecat.state) {
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

interface WorkerRowProps {
  polecat: Polecat
  cost?: WorkerCost
}

function WorkerRow({ polecat, cost }: WorkerRowProps) {
  const status = getWorkerStatus(polecat)

  return (
    <Link
      href={`/worker/${encodeURIComponent(polecat.rig)}/${encodeURIComponent(polecat.name)}`}
      className="flex items-center justify-between py-3 border-b border-chrome-border/30 last:border-0 hover:bg-carbon-black/30 -mx-4 px-4 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon name="terminal" aria-label="" variant="muted" size="md" />
        <div>
          <p className="body-text font-medium">{polecat.rig}/{polecat.name}</p>
          <p className="caption text-ash">
            {polecat.state}
            {polecat.last_activity && polecat.last_activity !== "0001-01-01T00:00:00Z" && (
              <> • last active {formatRelativeTime(polecat.last_activity)}</>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {cost && (
          <CostSparkline
            tokens={cost.totalTokens}
            costUsd={cost.estimatedCostUsd}
            size="sm"
          />
        )}
        <StatusBadge status={status} size="sm" />
      </div>
    </Link>
  )
}

function formatRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return ""
  }
}

export function WorkerList({ polecats, workerCosts, loading = false }: WorkerListProps) {
  const activeCount = polecats?.filter(p => p.session_running).length ?? 0

  return (
    <Panel>
      <PanelHeader
        icon="terminal"
        title="Workers"
        actions={
          <span className="caption text-ash">
            {loading ? "—" : `${activeCount} active / ${polecats?.length ?? 0} total`}
          </span>
        }
      />
      <PanelBody className="p-0">
        {loading ? (
          <div className="px-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : !polecats || polecats.length === 0 ? (
          <div className="p-4 text-center">
            <p className="caption text-ash">No workers found</p>
          </div>
        ) : (
          <div className="px-4">
            {polecats.map((polecat) => {
              const costKey = `${polecat.rig}/${polecat.name}`
              const cost = workerCosts?.get(costKey)
              return (
                <WorkerRow
                  key={`${polecat.rig}-${polecat.name}`}
                  polecat={polecat}
                  cost={cost}
                />
              )
            })}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
