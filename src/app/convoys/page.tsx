"use client"

import { ActionButton, Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui"
import { ConvoyCard } from "@/components/convoy"
import { useConvoys } from "@/hooks"
import { RefreshCw, Truck } from "lucide-react"

/**
 * Map convoy status string to UI Status type.
 * Handles all known convoy statuses including 'open'.
 */
function mapConvoyStatusToStatus(status: string): Status {
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

interface ConvoyStats {
  total: number
  active: number
  pending: number
  completed: number
  blocked: number
}

/**
 * Calculate convoy statistics from convoy list.
 * Properly handles 'open' status as pending.
 */
function calculateConvoyStats(convoys: { status: string }[]): ConvoyStats {
  return convoys.reduce(
    (acc, convoy) => {
      const status = convoy.status.toLowerCase()

      if (status === "active" || status === "running") {
        acc.active++
      } else if (status === "open" || status === "pending" || status === "queued") {
        acc.pending++
      } else if (status === "completed" || status === "done") {
        acc.completed++
      } else if (status === "blocked") {
        acc.blocked++
      }

      acc.total++
      return acc
    },
    { total: 0, active: 0, pending: 0, completed: 0, blocked: 0 }
  )
}

export default function ConvoysPage() {
  const { data: convoys, isLoading, refresh } = useConvoys({ refreshInterval: 30000 })

  const stats = convoys ? calculateConvoyStats(convoys) : null

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-bone truncate">Convoys</h1>
          <p className="body-text-muted mt-1 hidden sm:block">
            Active work batches across rigs
          </p>
        </div>
        <ActionButton
          variant="ghost"
          onClick={() => refresh()}
          loading={isLoading}
          icon={<RefreshCw className="w-4 h-4" />}
          className="shrink-0"
        >
          <span className="hidden sm:inline">Refresh</span>
        </ActionButton>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Panel className="p-4">
            <p className="label text-ash">Total</p>
            <p className="data-value">{stats.total}</p>
          </Panel>
          <Panel className="p-4">
            <p className="label text-ash">Active</p>
            <p className="data-value text-status-active">{stats.active}</p>
          </Panel>
          <Panel className="p-4">
            <p className="label text-ash">Pending</p>
            <p className="data-value text-status-thinking">{stats.pending}</p>
          </Panel>
          <Panel className="p-4">
            <p className="label text-ash">Completed</p>
            <p className="data-value text-status-done">{stats.completed}</p>
          </Panel>
        </div>
      )}

      {/* Convoys list */}
      <Panel>
        <PanelHeader
          icon="truck"
          title="All Convoys"
          actions={
            <span className="text-xs text-ash">
              {isLoading ? "—" : `${convoys?.length ?? 0} total`}
            </span>
          }
        />
        <PanelBody className="p-0">
          {isLoading ? (
            <div className="p-4 text-center">
              <p className="caption text-ash">Loading convoys...</p>
            </div>
          ) : !convoys || convoys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Truck className="w-8 h-8 text-ash mb-2" />
              <span className="text-ash">No convoys found</span>
            </div>
          ) : (
            <div className="divide-y divide-chrome-border/50">
              {convoys.map((convoy) => (
                <ConvoyCard key={convoy.id} convoy={convoy} />
              ))}
            </div>
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}
