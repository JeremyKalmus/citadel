"use client"

import { cn } from "@/lib/utils"
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel"
import {
  type HourlyUsage,
  formatTokenCount,
  formatCostUsd,
} from "@/lib/gastown/types"
import { Users } from "lucide-react"

/**
 * Format hour for display (e.g., "2pm", "11am")
 */
function formatHour(isoString: string): string {
  const date = new Date(isoString)
  const hours = date.getHours()
  const ampm = hours >= 12 ? "p" : "a"
  const hour12 = hours % 12 || 12
  return `${hour12}${ampm}`
}

/**
 * Format hour for tooltip (e.g., "2:00 PM")
 */
function formatHourFull(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

/**
 * Single bar in the chart
 */
function ChartBar({
  data,
  maxTokens,
  showLabel,
  isHighlighted,
}: {
  data: HourlyUsage
  maxTokens: number
  showLabel: boolean
  isHighlighted?: boolean
}) {
  const percentage = maxTokens > 0 ? (data.tokens / maxTokens) * 100 : 0
  const hasActivity = data.tokens > 0

  return (
    <div
      className={cn(
        "flex flex-col items-center group relative",
        isHighlighted && "z-10"
      )}
      title={`${formatHourFull(data.hour)}: ${formatTokenCount(data.tokens)} tokens, ${formatCostUsd(data.costUsd)}, ${data.activeWorkers} workers`}
    >
      {/* Bar */}
      <div className="flex-1 w-full flex items-end justify-center">
        <div
          className={cn(
            "w-full max-w-[20px] rounded-t-sm transition-all duration-300",
            hasActivity
              ? "bg-acid-green/70 group-hover:bg-acid-green"
              : "bg-chrome-border/30",
            isHighlighted && "bg-acid-green ring-1 ring-acid-green/50"
          )}
          style={{
            height: `${Math.max(percentage, hasActivity ? 4 : 2)}%`,
            minHeight: hasActivity ? "4px" : "2px",
          }}
        />
      </div>

      {/* Hour label */}
      {showLabel && (
        <span className="mt-1 text-[9px] text-ash">
          {formatHour(data.hour)}
        </span>
      )}

      {/* Hover tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-20">
        <div className="bg-carbon-black border border-chrome-border rounded-sm px-2 py-1 whitespace-nowrap shadow-lg">
          <p className="text-xs text-bone font-medium">
            {formatHourFull(data.hour)}
          </p>
          <div className="mt-1 space-y-0.5 text-[10px]">
            <p className="text-ash">
              <span className="text-bone">{formatTokenCount(data.tokens)}</span> tokens
            </p>
            <p className="text-ash">
              <span className="text-acid-green">{formatCostUsd(data.costUsd)}</span> cost
            </p>
            {data.activeWorkers > 0 && (
              <p className="text-ash flex items-center gap-1">
                <Users className="w-3 h-3" />
                {data.activeWorkers} worker{data.activeWorkers !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Summary stats row
 */
function ChartSummary({
  data,
}: {
  data: HourlyUsage[]
}) {
  const totalTokens = data.reduce((sum, d) => sum + d.tokens, 0)
  const totalCost = data.reduce((sum, d) => sum + d.costUsd, 0)
  const peakHour = data.reduce((max, d) => d.tokens > max.tokens ? d : max, data[0])
  const activeHours = data.filter((d) => d.tokens > 0).length

  return (
    <div className="flex items-center justify-between text-xs border-b border-chrome-border/50 pb-3 mb-3">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-ash">Total: </span>
          <span className="font-mono text-bone">{formatTokenCount(totalTokens)}</span>
        </div>
        <div>
          <span className="text-ash">Cost: </span>
          <span className="font-mono text-acid-green">{formatCostUsd(totalCost)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {peakHour && peakHour.tokens > 0 && (
          <div>
            <span className="text-ash">Peak: </span>
            <span className="font-mono text-bone">{formatHour(peakHour.hour)}</span>
          </div>
        )}
        <div>
          <span className="text-ash">Active: </span>
          <span className="font-mono text-bone">{activeHours}h</span>
        </div>
      </div>
    </div>
  )
}

export interface HourlyUsageChartProps {
  /** Hourly usage data */
  data: HourlyUsage[]
  /** Chart title */
  title?: string
  /** Period label (e.g., "Last 24 Hours") */
  periodLabel?: string
  /** Height of the chart area */
  height?: number
  /** Show every Nth hour label (default 3) */
  labelInterval?: number
  /** Loading state */
  isLoading?: boolean
  /** Optional className */
  className?: string
}

/**
 * HourlyUsageChart Component
 *
 * Bar chart showing token usage over time.
 *
 * Features:
 * - Bars scaled to max value
 * - Hover tooltips with details
 * - Summary stats (total, peak, active hours)
 * - Hour labels at intervals
 */
export function HourlyUsageChart({
  data,
  title = "Usage Over Time",
  periodLabel = "Last 24 Hours",
  height = 120,
  labelInterval = 3,
  isLoading,
  className,
}: HourlyUsageChartProps) {
  const maxTokens = Math.max(...data.map((d) => d.tokens), 1)

  if (isLoading) {
    return (
      <Panel className={className}>
        <PanelHeader icon="activity" title={title} />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">Loading usage data...</span>
          </div>
        </PanelBody>
      </Panel>
    )
  }

  if (data.length === 0) {
    return (
      <Panel className={className}>
        <PanelHeader
          icon="activity"
          title={title}
          actions={
            <span className="text-xs text-ash">{periodLabel}</span>
          }
        />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">No usage data available</span>
          </div>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel className={className}>
      <PanelHeader
        icon="activity"
        title={title}
        actions={
          <span className="text-xs text-ash">{periodLabel}</span>
        }
      />
      <PanelBody>
        <ChartSummary data={data} />

        {/* Chart area */}
        <div
          className="flex items-end gap-0.5"
          style={{ height }}
        >
          {data.map((d, index) => (
            <ChartBar
              key={d.hour}
              data={d}
              maxTokens={maxTokens}
              showLabel={index % labelInterval === 0}
            />
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}

/**
 * Compact inline chart variant
 */
export function HourlyUsageSparkline({
  data,
  height = 32,
  className,
}: {
  data: HourlyUsage[]
  height?: number
  className?: string
}) {
  const maxTokens = Math.max(...data.map((d) => d.tokens), 1)

  return (
    <div
      className={cn("flex items-end gap-px", className)}
      style={{ height }}
    >
      {data.map((d) => {
        const percentage = maxTokens > 0 ? (d.tokens / maxTokens) * 100 : 0
        const hasActivity = d.tokens > 0

        return (
          <div
            key={d.hour}
            className={cn(
              "flex-1 rounded-t-[1px] transition-colors",
              hasActivity ? "bg-acid-green/60" : "bg-chrome-border/20"
            )}
            style={{
              height: `${Math.max(percentage, hasActivity ? 8 : 4)}%`,
              minHeight: hasActivity ? "2px" : "1px",
            }}
            title={`${formatHour(d.hour)}: ${formatTokenCount(d.tokens)}`}
          />
        )
      })}
    </div>
  )
}
