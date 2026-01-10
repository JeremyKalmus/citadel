"use client"

import { cn } from "@/lib/utils"
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel"
import { CostSparkline } from "./cost-sparkline"
import {
  type ChartWorkerCost as WorkerCost,
  formatTokenCount,
  formatCostUsd,
} from "@/lib/gastown/types"
import { User, Zap, Hash, Clock } from "lucide-react"

/**
 * Single worker row in the cost breakdown
 */
function WorkerRow({
  worker,
  rank,
  maxTokens,
  showRig = true,
}: {
  worker: WorkerCost
  rank: number
  maxTokens: number
  showRig?: boolean
}) {
  const percentage = maxTokens > 0 ? (worker.totalTokens / maxTokens) * 100 : 0

  return (
    <div className="py-3 px-4 hover:bg-carbon-black/30 transition-colors">
      <div className="flex items-center gap-3">
        {/* Rank */}
        <span className="text-xs text-ash w-4 shrink-0">{rank}.</span>

        {/* Worker info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-ash shrink-0" />
            <span className="text-sm font-medium text-bone truncate">
              {worker.workerName}
            </span>
            {showRig && (
              <span className="text-xs text-ash">
                {worker.rig}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 h-1.5 bg-chrome-border rounded-sm overflow-hidden">
            <div
              className="h-full bg-acid-green/70 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 shrink-0">
          <CostSparkline
            tokens={worker.totalTokens}
            costUsd={worker.estimatedCostUsd}
            size="sm"
          />
        </div>
      </div>

      {/* Metadata row */}
      <div className="mt-2 ml-7 flex items-center gap-4 text-[10px] text-ash">
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {worker.sessionCount} sessions
        </span>
        {worker.issuesWorked.length > 0 && (
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {worker.issuesWorked.length} issue{worker.issuesWorked.length !== 1 ? "s" : ""}
          </span>
        )}
        {worker.tokensPerMinute && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTokenCount(worker.tokensPerMinute)}/min
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Summary stat for totals
 */
function SummaryStat({
  label,
  value,
  subtext,
}: {
  label: string
  value: string
  subtext?: string
}) {
  return (
    <div className="text-center">
      <span className="text-[10px] uppercase tracking-wider text-ash">{label}</span>
      <p className="text-lg font-mono font-medium text-bone">{value}</p>
      {subtext && (
        <span className="text-[10px] text-ash">{subtext}</span>
      )}
    </div>
  )
}

export interface WorkerCostPanelProps {
  /** Worker cost data */
  workers: WorkerCost[]
  /** Period label (e.g., "This Week") */
  periodLabel?: string
  /** Filter to specific rig */
  rigFilter?: string
  /** Max workers to show */
  limit?: number
  /** Loading state */
  isLoading?: boolean
  /** Optional className */
  className?: string
}

/**
 * WorkerCostPanel Component
 *
 * Dashboard panel showing token usage and cost breakdown by worker.
 *
 * Displays:
 * - Summary totals (workers, tokens, cost)
 * - Ranked list of workers by token usage
 * - Per-worker session count, issues worked, efficiency
 */
export function WorkerCostPanel({
  workers,
  periodLabel = "This Week",
  rigFilter,
  limit = 10,
  isLoading,
  className,
}: WorkerCostPanelProps) {
  // Filter by rig if specified
  const filteredWorkers = rigFilter
    ? workers.filter((w) => w.rig === rigFilter)
    : workers

  // Limit display
  const displayWorkers = filteredWorkers.slice(0, limit)

  // Calculate totals
  const totalTokens = filteredWorkers.reduce((sum, w) => sum + w.totalTokens, 0)
  const totalCost = filteredWorkers.reduce((sum, w) => sum + w.estimatedCostUsd, 0)
  const maxTokens = displayWorkers[0]?.totalTokens ?? 0

  if (isLoading) {
    return (
      <Panel className={className}>
        <PanelHeader icon="container" title="Worker Costs" />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">Loading worker costs...</span>
          </div>
        </PanelBody>
      </Panel>
    )
  }

  if (filteredWorkers.length === 0) {
    return (
      <Panel className={className}>
        <PanelHeader
          icon="container"
          title="Worker Costs"
          actions={
            <span className="text-xs text-ash">{periodLabel}</span>
          }
        />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">No worker activity recorded</span>
          </div>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel className={className}>
      <PanelHeader
        icon="container"
        title={rigFilter ? `Worker Costs: ${rigFilter}` : "Worker Costs"}
        actions={
          <span className="text-xs text-ash">{periodLabel}</span>
        }
      />
      <PanelBody className="space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-around py-3 border-b border-chrome-border/50">
          <SummaryStat
            label="Workers"
            value={String(filteredWorkers.length)}
          />
          <SummaryStat
            label="Total Tokens"
            value={formatTokenCount(totalTokens)}
          />
          <SummaryStat
            label="Total Cost"
            value={formatCostUsd(totalCost)}
            subtext={filteredWorkers.length > 0
              ? `${formatCostUsd(totalCost / filteredWorkers.length)} avg`
              : undefined
            }
          />
        </div>

        {/* Worker list */}
        <div className="border border-chrome-border rounded-sm divide-y divide-chrome-border/50">
          {displayWorkers.map((worker, index) => (
            <WorkerRow
              key={`${worker.rig}/${worker.workerName}`}
              worker={worker}
              rank={index + 1}
              maxTokens={maxTokens}
              showRig={!rigFilter}
            />
          ))}
        </div>

        {/* Show more indicator */}
        {filteredWorkers.length > limit && (
          <p className="text-xs text-ash text-center">
            +{filteredWorkers.length - limit} more workers
          </p>
        )}
      </PanelBody>
    </Panel>
  )
}

/**
 * Compact worker cost list for inline display
 */
export function WorkerCostList({
  workers,
  limit = 5,
  className,
}: {
  workers: WorkerCost[]
  limit?: number
  className?: string
}) {
  const displayWorkers = workers.slice(0, limit)

  return (
    <div className={cn("space-y-2", className)}>
      {displayWorkers.map((worker, index) => (
        <div
          key={`${worker.rig}/${worker.workerName}`}
          className="flex items-center gap-3"
        >
          <span className="text-xs text-ash w-4">{index + 1}.</span>
          <span className="flex-1 text-sm text-bone truncate">
            {worker.workerName}
          </span>
          <CostSparkline
            tokens={worker.totalTokens}
            costUsd={worker.estimatedCostUsd}
            size="sm"
          />
        </div>
      ))}
    </div>
  )
}
