"use client"

import { cn } from "@/lib/utils"
import { Panel, PanelHeader, PanelBody, Gauge } from "@/components/ui"
import { CostSparkline } from "./cost-sparkline"
import {
  type CostTrend,
  type IssueCost,
  formatTokenCount,
  formatCostUsd,
  calculateTrend,
  calculatePercentChange,
} from "@/lib/gastown/types"
import type { GuzzolineStats } from "@/lib/gastown"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

/**
 * Agent type breakdown bar
 */
function AgentTypeBar({
  label,
  tokens,
  costUsd,
  totalTokens,
}: {
  label: string
  tokens: number
  costUsd: number
  totalTokens: number
}) {
  const percentage = totalTokens > 0 ? (tokens / totalTokens) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ash w-20 shrink-0">{label}</span>
      <Gauge
        value={percentage}
        size="sm"
        segments={10}
        showLabel={false}
        className="flex-1"
      />
      <span className="text-xs font-mono text-bone tabular-nums w-12 text-right">
        {formatTokenCount(tokens)}
      </span>
      <span className="text-xs font-mono text-acid-green tabular-nums w-14 text-right">
        {formatCostUsd(costUsd)}
      </span>
    </div>
  )
}

/**
 * Top consumer row
 */
function ConsumerRow({
  rank,
  id,
  title,
  tokens,
  costUsd,
}: {
  rank: number
  id: string
  title: string
  tokens: number
  costUsd: number
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 hover:bg-carbon-black/30 transition-colors">
      <span className="text-xs text-ash w-4">{rank}.</span>
      <span className="font-mono text-xs text-ash w-16 shrink-0">{id}</span>
      <span className="flex-1 text-sm text-bone truncate">{title}</span>
      <CostSparkline tokens={tokens} costUsd={costUsd} size="sm" />
    </div>
  )
}

/**
 * Stat card for totals
 */
function StatCard({
  label,
  value,
  subtext,
  trend,
  className,
}: {
  label: string
  value: string
  subtext?: string
  trend?: CostTrend
  className?: string
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-rust-orange" : trend === "down" ? "text-acid-green" : "text-ash"

  return (
    <div className={cn("p-4 bg-gunmetal rounded-sm border border-chrome-border", className)}>
      <span className="section-header">{label}</span>
      <div className="mt-2 flex items-end gap-2">
        <span className="data-value-sm">{value}</span>
        {trend && (
          <TrendIcon className={cn("w-4 h-4 mb-1", trendColor)} />
        )}
      </div>
      {subtext && (
        <p className="text-xs text-ash mt-1">{subtext}</p>
      )}
    </div>
  )
}

export interface CostPanelProps {
  /** Guzzoline stats from API */
  stats: GuzzolineStats
  /** Previous period stats for comparison */
  previousStats?: GuzzolineStats
  /** Top consuming issues (optional) */
  topIssues?: IssueCost[]
  /** Period label (e.g., "Today", "This Week") */
  periodLabel?: string
  /** Loading state */
  isLoading?: boolean
  /** Optional className */
  className?: string
}

/**
 * CostPanel Component
 *
 * Dashboard panel showing token usage and cost breakdown.
 *
 * From spec section 2.4:
 * - Total tokens and estimated cost
 * - Breakdown by agent type (polecats, witness, refinery, mayor)
 * - Top consumers (issues)
 * - Trend indicators vs previous period
 */
export function CostPanel({
  stats,
  previousStats,
  topIssues,
  periodLabel = "Today",
  isLoading,
  className,
}: CostPanelProps) {
  // Calculate costs from token counts (rough estimate based on output-heavy assumption)
  const estimateCost = (tokens: number) => {
    // Assume 70% output, 30% input for agents
    const inputTokens = tokens * 0.3
    const outputTokens = tokens * 0.7
    return (inputTokens * 3 + outputTokens * 15) / 1_000_000
  }

  const totalCostToday = estimateCost(stats.total_tokens_today)
  const totalCostPrevious = previousStats ? estimateCost(previousStats.total_tokens_today) : 0
  const tokenTrend = previousStats
    ? calculateTrend(stats.total_tokens_today, previousStats.total_tokens_today)
    : undefined
  const percentChange = previousStats
    ? calculatePercentChange(stats.total_tokens_today, previousStats.total_tokens_today)
    : 0

  const agentTypes = [
    { label: "Polecats", tokens: stats.by_agent_type.polecat },
    { label: "Witness", tokens: stats.by_agent_type.witness },
    { label: "Refinery", tokens: stats.by_agent_type.refinery },
    { label: "Mayor", tokens: stats.by_agent_type.mayor },
  ]

  if (isLoading) {
    return (
      <Panel className={className}>
        <PanelHeader icon="fuel" title="Guzzoline" />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">Loading token stats...</span>
          </div>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel className={className}>
      <PanelHeader
        icon="fuel"
        title="Guzzoline"
        actions={
          <span className="text-xs text-ash">{periodLabel}</span>
        }
      />
      <PanelBody className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total Tokens"
            value={formatTokenCount(stats.total_tokens_today)}
            subtext={tokenTrend && percentChange !== 0
              ? `${percentChange > 0 ? "+" : ""}${percentChange}% vs yesterday`
              : undefined
            }
            trend={tokenTrend}
          />
          <StatCard
            label="Estimated Cost"
            value={formatCostUsd(totalCostToday)}
            subtext={stats.sessions_today > 0
              ? `${formatCostUsd(totalCostToday / stats.sessions_today)} avg/session`
              : undefined
            }
          />
        </div>

        {/* Agent type breakdown */}
        <div>
          <p className="section-header mb-3">By Agent Type</p>
          <div className="space-y-2">
            {agentTypes.map(({ label, tokens }) => (
              <AgentTypeBar
                key={label}
                label={label}
                tokens={tokens}
                costUsd={estimateCost(tokens)}
                totalTokens={stats.total_tokens_today}
              />
            ))}
          </div>
        </div>

        {/* Top consumers */}
        {topIssues && topIssues.length > 0 && (
          <div>
            <p className="section-header mb-2">Top Consumers</p>
            <div className="border border-chrome-border rounded-sm divide-y divide-chrome-border/50">
              {topIssues.slice(0, 5).map((issue, index) => (
                <ConsumerRow
                  key={issue.issueId}
                  rank={index + 1}
                  id={issue.issueId}
                  title={issue.issueId} // Would be issue title from API
                  tokens={issue.totalTokens}
                  costUsd={issue.estimatedCostUsd}
                />
              ))}
            </div>
          </div>
        )}

        {/* Budget warnings */}
        {stats.budget_warnings > 0 && (
          <div className="flex items-center gap-2 p-3 bg-rust-orange/10 border border-rust-orange/30 rounded-sm">
            <span className="w-2 h-2 rounded-full bg-rust-orange animate-pulse" />
            <span className="text-sm text-rust-orange">
              {stats.budget_warnings} budget warning{stats.budget_warnings > 1 ? "s" : ""} today
            </span>
          </div>
        )}

        {/* Session count */}
        <div className="flex items-center justify-between pt-4 border-t border-chrome-border/50">
          <span className="text-xs text-ash">Sessions today</span>
          <span className="text-sm font-mono text-bone">{stats.sessions_today}</span>
        </div>
      </PanelBody>
    </Panel>
  )
}

/**
 * Compact cost summary for inline display
 */
export function CostSummary({
  tokens,
  costUsd,
  trend,
  className,
}: {
  tokens: number
  costUsd: number
  trend?: CostTrend
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-ash">Tokens</span>
        <span className="text-sm font-mono text-bone tabular-nums">
          {formatTokenCount(tokens)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-ash">Cost</span>
        <CostSparkline
          tokens={tokens}
          costUsd={costUsd}
          trend={trend}
          showTokens={false}
          size="sm"
        />
      </div>
    </div>
  )
}
