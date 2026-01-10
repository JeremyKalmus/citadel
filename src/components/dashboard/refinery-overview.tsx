"use client"

import { Panel, PanelHeader, PanelBody, StatusBadge, Gauge, Skeleton, type Status } from "@/components/ui"
import type { TownStatus, MergeQueue } from "@/lib/gastown"
import { GitMerge } from "lucide-react"

interface RefineryOverviewProps {
  status: TownStatus | null
  loading?: boolean
}

interface RigRefineryInfo {
  name: string
  hasRefinery: boolean
  mq: MergeQueue | null
}

function mapHealthToStatus(health: string): Status {
  switch (health.toLowerCase()) {
    case "healthy":
    case "ok":
      return "active"
    case "degraded":
    case "slow":
      return "slow"
    case "blocked":
      return "blocked"
    case "down":
    case "error":
      return "dead"
    default:
      return "thinking"
  }
}

function getAggregateStatus(rigs: RigRefineryInfo[]): Status {
  const rigsWithRefinery = rigs.filter(r => r.hasRefinery && r.mq)

  if (rigsWithRefinery.length === 0) return "done"

  // Check for any dead/error refineries
  const hasError = rigsWithRefinery.some(r =>
    r.mq && ["down", "error"].includes(r.mq.health.toLowerCase())
  )
  if (hasError) return "dead"

  // Check for any blocked refineries
  const hasBlocked = rigsWithRefinery.some(r =>
    r.mq && r.mq.health.toLowerCase() === "blocked"
  )
  if (hasBlocked) return "blocked"

  // Check for any slow/degraded refineries
  const hasSlow = rigsWithRefinery.some(r =>
    r.mq && ["degraded", "slow"].includes(r.mq.health.toLowerCase())
  )
  if (hasSlow) return "slow"

  return "active"
}

function calculateHealthScore(rigs: RigRefineryInfo[]): number {
  const rigsWithRefinery = rigs.filter(r => r.hasRefinery && r.mq)

  if (rigsWithRefinery.length === 0) return 100

  // Score based on: healthy = 100, degraded = 70, blocked = 30, error = 0
  const scoreMap: Record<string, number> = {
    "healthy": 100,
    "ok": 100,
    "degraded": 70,
    "slow": 70,
    "blocked": 30,
    "down": 0,
    "error": 0,
  }

  const totalScore = rigsWithRefinery.reduce((sum, r) => {
    const health = r.mq?.health.toLowerCase() ?? "ok"
    return sum + (scoreMap[health] ?? 50)
  }, 0)

  return Math.round(totalScore / rigsWithRefinery.length)
}

export function RefineryOverview({ status, loading = false }: RefineryOverviewProps) {
  // Extract rig refinery info
  const rigs: RigRefineryInfo[] = (status?.rigs ?? []).map(rig => ({
    name: rig.name,
    hasRefinery: rig.has_refinery,
    mq: rig.mq ?? null,
  }))

  const rigsWithRefinery = rigs.filter(r => r.hasRefinery)

  // Aggregate merge queue stats
  const totalPending = rigsWithRefinery.reduce((sum, r) => sum + (r.mq?.pending ?? 0), 0)
  const totalInFlight = rigsWithRefinery.reduce((sum, r) => sum + (r.mq?.in_flight ?? 0), 0)
  const totalBlocked = rigsWithRefinery.reduce((sum, r) => sum + (r.mq?.blocked ?? 0), 0)

  const overallStatus = getAggregateStatus(rigs)
  const healthScore = calculateHealthScore(rigs)

  // No refineries configured
  if (!loading && rigsWithRefinery.length === 0) {
    return (
      <Panel>
        <PanelHeader icon="road" title="Refineries" />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GitMerge className="w-8 h-8 text-ash mb-2" />
            <span className="text-ash">No refineries configured</span>
          </div>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel>
      <PanelHeader
        icon="road"
        title="Refineries"
        actions={loading ? <Skeleton variant="rect" className="w-16 h-5" /> : <StatusBadge status={overallStatus} size="sm" />}
      />
      <PanelBody>
        <div className="space-y-4">
          {/* Aggregate stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              {loading ? (
                <Skeleton variant="stat" className="h-8 w-12 mx-auto" />
              ) : (
                <p className="data-value text-fuel-yellow">{totalPending}</p>
              )}
              <p className="label mt-1">Pending</p>
            </div>
            <div className="text-center">
              {loading ? (
                <Skeleton variant="stat" className="h-8 w-12 mx-auto" />
              ) : (
                <p className="data-value text-acid-green">{totalInFlight}</p>
              )}
              <p className="label mt-1">In Flight</p>
            </div>
            <div className="text-center">
              {loading ? (
                <Skeleton variant="stat" className="h-8 w-12 mx-auto" />
              ) : (
                <p className="data-value text-rust-orange">{totalBlocked}</p>
              )}
              <p className="label mt-1">Blocked</p>
            </div>
          </div>

          {/* Health gauge */}
          <div className="flex items-center justify-center">
            {loading ? (
              <Skeleton variant="rect" className="w-24 h-24 rounded-full" />
            ) : (
              <div className="text-center">
                <Gauge value={healthScore} size="md" />
                <p className="label mt-2 text-ash">{rigsWithRefinery.length} refiner{rigsWithRefinery.length !== 1 ? 'ies' : 'y'}</p>
              </div>
            )}
          </div>

          {/* Per-rig breakdown */}
          {!loading && rigsWithRefinery.length > 0 && (
            <div className="border-t border-chrome-border/50 pt-4">
              <p className="label text-ash mb-2">By Rig</p>
              <div className="space-y-2">
                {rigsWithRefinery.map(rig => (
                  <div key={rig.name} className="flex items-center justify-between gap-2">
                    <span className="text-bone font-mono text-sm truncate">{rig.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {rig.mq && (
                        <>
                          <span className="text-xs text-ash">
                            {rig.mq.pending}p / {rig.mq.in_flight}f / {rig.mq.blocked}b
                          </span>
                          <StatusBadge
                            status={mapHealthToStatus(rig.mq.health)}
                            size="sm"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PanelBody>
    </Panel>
  )
}
