"use client"

import { cn } from "@/lib/utils"
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel"
import { CostSparkline } from "./cost-sparkline"
import {
  type WorkerCost,
  formatTokenCount,
  formatCostUsd,
} from "@/lib/gastown/types"
import { TrendingUp, TrendingDown, Zap, Clock, Target, Award } from "lucide-react"

/**
 * Calculate efficiency grade based on tokens per issue
 */
function getEfficiencyGrade(tokensPerIssue: number): {
  grade: string
  color: string
  label: string
} {
  // Lower is better - fewer tokens per issue means more efficient
  if (tokensPerIssue < 50000) {
    return { grade: "A", color: "text-acid-green", label: "Excellent" }
  }
  if (tokensPerIssue < 100000) {
    return { grade: "B", color: "text-fuel-yellow", label: "Good" }
  }
  if (tokensPerIssue < 200000) {
    return { grade: "C", color: "text-bone", label: "Average" }
  }
  if (tokensPerIssue < 400000) {
    return { grade: "D", color: "text-rust-orange", label: "Below Avg" }
  }
  return { grade: "F", color: "text-rust-orange", label: "Needs Work" }
}

/**
 * Single efficiency metric card
 */
function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  className,
}: {
  label: string
  value: string
  subtext?: string
  icon: typeof Zap
  trend?: "up" | "down" | "neutral"
  className?: string
}) {
  const trendColor = trend === "down" ? "text-acid-green" : trend === "up" ? "text-rust-orange" : "text-ash"

  return (
    <div className={cn("p-3 bg-gunmetal rounded-sm border border-chrome-border", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-ash" />
        <span className="text-[10px] uppercase tracking-wider text-ash">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-lg font-mono font-medium text-bone">{value}</span>
        {trend && trend !== "neutral" && (
          <span className={cn("text-xs", trendColor)}>
            {trend === "down" ? <TrendingDown className="w-3 h-3 inline" /> : <TrendingUp className="w-3 h-3 inline" />}
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-[10px] text-ash mt-1">{subtext}</p>
      )}
    </div>
  )
}

/**
 * Worker efficiency row
 */
function WorkerEfficiencyRow({
  worker,
  rank,
  avgTokensPerIssue,
}: {
  worker: WorkerCost
  rank: number
  avgTokensPerIssue: number
}) {
  const grade = worker.efficiencyScore ? getEfficiencyGrade(worker.efficiencyScore) : null
  const vsAvg = worker.efficiencyScore && avgTokensPerIssue > 0
    ? Math.round(((worker.efficiencyScore - avgTokensPerIssue) / avgTokensPerIssue) * 100)
    : null

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 hover:bg-carbon-black/30 transition-colors">
      {/* Rank */}
      <span className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium",
        rank <= 3 ? "bg-acid-green/20 text-acid-green" : "bg-chrome-border text-ash"
      )}>
        {rank}
      </span>

      {/* Worker info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-bone truncate">
            {worker.workerName}
          </span>
          <span className="text-xs text-ash">{worker.rig}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-ash">
          <span>{worker.issuesWorked.length} issues</span>
          <span>{worker.sessionCount} sessions</span>
          {worker.tokensPerMinute && (
            <span>{formatTokenCount(worker.tokensPerMinute)}/min</span>
          )}
        </div>
      </div>

      {/* Efficiency score */}
      <div className="flex items-center gap-3">
        {worker.efficiencyScore && (
          <div className="text-right">
            <span className="text-xs font-mono text-bone">
              {formatTokenCount(worker.efficiencyScore)}
            </span>
            <span className="text-[10px] text-ash">/issue</span>
          </div>
        )}

        {vsAvg !== null && (
          <span className={cn(
            "text-[10px] w-12 text-right",
            vsAvg < 0 ? "text-acid-green" : vsAvg > 0 ? "text-rust-orange" : "text-ash"
          )}>
            {vsAvg > 0 ? "+" : ""}{vsAvg}%
          </span>
        )}

        {grade && (
          <span className={cn(
            "w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold",
            "bg-carbon-black border border-chrome-border",
            grade.color
          )}>
            {grade.grade}
          </span>
        )}
      </div>
    </div>
  )
}

export interface EfficiencyMetricsProps {
  /** Worker cost data with efficiency scores */
  workers: WorkerCost[]
  /** Period label */
  periodLabel?: string
  /** Max workers to show in ranking */
  limit?: number
  /** Loading state */
  isLoading?: boolean
  /** Optional className */
  className?: string
}

/**
 * EfficiencyMetrics Component
 *
 * Dashboard panel showing cost efficiency metrics across workers.
 *
 * Displays:
 * - Overall efficiency stats (avg tokens/issue, tokens/min)
 * - Efficiency leaderboard
 * - Comparison vs average
 * - Efficiency grades (A-F)
 */
export function EfficiencyMetrics({
  workers,
  periodLabel = "This Week",
  limit = 10,
  isLoading,
  className,
}: EfficiencyMetricsProps) {
  // Filter to workers with efficiency data
  const workersWithEfficiency = workers.filter(
    (w) => w.efficiencyScore !== undefined && w.issuesWorked.length > 0
  )

  // Sort by efficiency (lower is better)
  const sortedWorkers = [...workersWithEfficiency].sort(
    (a, b) => (a.efficiencyScore ?? Infinity) - (b.efficiencyScore ?? Infinity)
  )

  // Calculate aggregate metrics
  const totalIssues = workers.reduce((sum, w) => sum + w.issuesWorked.length, 0)
  const totalTokens = workers.reduce((sum, w) => sum + w.totalTokens, 0)
  const totalCost = workers.reduce((sum, w) => sum + w.estimatedCostUsd, 0)
  const totalDuration = workers.reduce((sum, w) => sum + (w.durationMinutes ?? 0), 0)

  const avgTokensPerIssue = totalIssues > 0 ? Math.round(totalTokens / totalIssues) : 0
  const avgCostPerIssue = totalIssues > 0 ? totalCost / totalIssues : 0
  const avgTokensPerMinute = totalDuration > 0 ? Math.round(totalTokens / totalDuration) : 0

  // Best and worst performers
  const bestWorker = sortedWorkers[0]
  const worstWorker = sortedWorkers[sortedWorkers.length - 1]

  if (isLoading) {
    return (
      <Panel className={className}>
        <PanelHeader icon="zap" title="Efficiency" />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">Loading efficiency data...</span>
          </div>
        </PanelBody>
      </Panel>
    )
  }

  if (workersWithEfficiency.length === 0) {
    return (
      <Panel className={className}>
        <PanelHeader
          icon="zap"
          title="Efficiency"
          actions={
            <span className="text-xs text-ash">{periodLabel}</span>
          }
        />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">No efficiency data available</span>
          </div>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel className={className}>
      <PanelHeader
        icon="zap"
        title="Efficiency"
        actions={
          <span className="text-xs text-ash">{periodLabel}</span>
        }
      />
      <PanelBody className="space-y-4">
        {/* Summary metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Avg Tokens/Issue"
            value={formatTokenCount(avgTokensPerIssue)}
            subtext={`${totalIssues} issues total`}
            icon={Target}
          />
          <MetricCard
            label="Avg Cost/Issue"
            value={formatCostUsd(avgCostPerIssue)}
            subtext={`${formatCostUsd(totalCost)} total`}
            icon={Zap}
          />
          <MetricCard
            label="Tokens/Min"
            value={formatTokenCount(avgTokensPerMinute)}
            subtext={totalDuration > 0 ? `${Math.round(totalDuration / 60)}h total` : undefined}
            icon={Clock}
          />
          <MetricCard
            label="Active Workers"
            value={String(workersWithEfficiency.length)}
            subtext={bestWorker ? `Best: ${bestWorker.workerName}` : undefined}
            icon={Award}
          />
        </div>

        {/* Leaderboard */}
        <div>
          <p className="section-header mb-2">Efficiency Ranking</p>
          <div className="border border-chrome-border rounded-sm divide-y divide-chrome-border/50">
            {sortedWorkers.slice(0, limit).map((worker, index) => (
              <WorkerEfficiencyRow
                key={`${worker.rig}/${worker.workerName}`}
                worker={worker}
                rank={index + 1}
                avgTokensPerIssue={avgTokensPerIssue}
              />
            ))}
          </div>
          {sortedWorkers.length > limit && (
            <p className="text-xs text-ash text-center mt-2">
              +{sortedWorkers.length - limit} more workers
            </p>
          )}
        </div>

        {/* Best vs Worst comparison */}
        {bestWorker && worstWorker && bestWorker !== worstWorker && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-chrome-border/50">
            <div className="p-3 bg-acid-green/5 border border-acid-green/20 rounded-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-acid-green" />
                <span className="text-[10px] uppercase tracking-wider text-acid-green">Most Efficient</span>
              </div>
              <p className="text-sm font-medium text-bone">{bestWorker.workerName}</p>
              <p className="text-xs text-ash mt-0.5">
                {formatTokenCount(bestWorker.efficiencyScore ?? 0)}/issue
              </p>
            </div>
            <div className="p-3 bg-rust-orange/5 border border-rust-orange/20 rounded-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-rust-orange" />
                <span className="text-[10px] uppercase tracking-wider text-rust-orange">Needs Improvement</span>
              </div>
              <p className="text-sm font-medium text-bone">{worstWorker.workerName}</p>
              <p className="text-xs text-ash mt-0.5">
                {formatTokenCount(worstWorker.efficiencyScore ?? 0)}/issue
              </p>
            </div>
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}

/**
 * Compact efficiency summary for inline display
 */
export function EfficiencySummary({
  avgTokensPerIssue,
  avgCostPerIssue,
  className,
}: {
  avgTokensPerIssue: number
  avgCostPerIssue: number
  className?: string
}) {
  const grade = getEfficiencyGrade(avgTokensPerIssue)

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className={cn(
        "w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold",
        "bg-carbon-black border border-chrome-border",
        grade.color
      )}>
        {grade.grade}
      </span>
      <div className="text-xs">
        <span className="text-bone font-mono">{formatTokenCount(avgTokensPerIssue)}</span>
        <span className="text-ash">/issue</span>
        <span className="text-ash mx-1">•</span>
        <span className="text-acid-green font-mono">{formatCostUsd(avgCostPerIssue)}</span>
        <span className="text-ash">/issue</span>
      </div>
    </div>
  )
}
