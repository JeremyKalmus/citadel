"use client"

import { Panel, PanelHeader, PanelBody, Gauge, StatusBadge, type Status } from "@/components/ui"
import type { TownStatus, Polecat } from "@/lib/gastown"

interface HealthSummaryProps {
  status: TownStatus | null
  polecats: Polecat[] | null
  loading?: boolean
}

function calculateHealthScore(status: TownStatus | null, polecats: Polecat[] | null): number {
  if (!status || !polecats) return 0

  const totalPolecats = polecats.length
  if (totalPolecats === 0) return 100

  const activePolecats = polecats.filter(p => p.session_running).length
  const healthyRatio = activePolecats / totalPolecats

  return Math.round(healthyRatio * 100)
}

function getOverallStatus(polecats: Polecat[] | null): Status {
  if (!polecats || polecats.length === 0) return "done"

  const running = polecats.filter(p => p.session_running).length
  const blocked = polecats.filter(p => p.state === "blocked").length
  const dead = polecats.filter(p => p.state === "dead").length

  if (dead > 0) return "dead"
  if (blocked > 0) return "blocked"
  if (running > 0) return "active"
  return "done"
}

export function HealthSummary({ status, polecats, loading = false }: HealthSummaryProps) {
  const healthScore = calculateHealthScore(status, polecats)
  const overallStatus = getOverallStatus(polecats)

  const runningCount = polecats?.filter(p => p.session_running).length ?? 0
  const totalCount = polecats?.length ?? 0

  return (
    <Panel>
      <PanelHeader
        icon="activity"
        title="Town Health"
        actions={<StatusBadge status={overallStatus} size="sm" />}
      />
      <PanelBody>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <Gauge value={loading ? 0 : healthScore} size="lg" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="label text-ash">Active Workers</p>
              <p className="data-value">
                {loading ? "—" : `${runningCount} / ${totalCount}`}
              </p>
            </div>
            <div>
              <p className="label text-ash">Active Rigs</p>
              <p className="data-value">
                {loading ? "—" : status?.rigs.length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </PanelBody>
    </Panel>
  )
}
