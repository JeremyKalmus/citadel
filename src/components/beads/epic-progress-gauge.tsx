"use client"

import { cn } from "@/lib/utils"
import type { EpicProgress } from "@/lib/gastown/types"

export interface EpicProgressGaugeProps {
  /** Progress stats for epic children */
  progress: EpicProgress
  /** Show percentage label */
  showPercentage?: boolean
  /** Show detailed breakdown */
  showBreakdown?: boolean
  /** Custom className */
  className?: string
}

/**
 * Progress segment colors matching DS2 design tokens
 */
const SEGMENT_COLORS = {
  closed: "bg-acid-green", // #27AE60 - completed
  inProgress: "bg-fuel-yellow", // #F2C94C - active work
  blocked: "bg-rust-orange", // #FF7A00 - blocked
  deferred: "bg-chrome-border", // Gray - deferred
  open: "bg-ash/30", // Light gray - not started
}

const SEGMENT_TEXT_COLORS = {
  closed: "text-acid-green",
  inProgress: "text-fuel-yellow",
  blocked: "text-rust-orange",
  deferred: "text-chrome-border",
  open: "text-ash",
}

/**
 * Segmented progress bar showing breakdown by status
 */
function ProgressBar({ progress }: { progress: EpicProgress }) {
  if (progress.total === 0) {
    return (
      <div className="h-3 rounded-full bg-chrome-border/30 overflow-hidden">
        <div className="h-full w-0" />
      </div>
    )
  }

  const segments = [
    { key: "closed", value: progress.closed, color: SEGMENT_COLORS.closed },
    { key: "inProgress", value: progress.inProgress, color: SEGMENT_COLORS.inProgress },
    { key: "blocked", value: progress.blocked, color: SEGMENT_COLORS.blocked },
    { key: "deferred", value: progress.deferred, color: SEGMENT_COLORS.deferred },
    { key: "open", value: progress.open, color: SEGMENT_COLORS.open },
  ]

  return (
    <div className="h-3 rounded-full bg-carbon-black overflow-hidden flex">
      {segments.map(
        (segment) =>
          segment.value > 0 && (
            <div
              key={segment.key}
              className={cn(
                segment.color,
                "h-full transition-all duration-300"
              )}
              style={{ width: `${(segment.value / progress.total) * 100}%` }}
            />
          )
      )}
    </div>
  )
}

/**
 * Breakdown legend showing counts per status
 */
function BreakdownLegend({ progress }: { progress: EpicProgress }) {
  const items = [
    { label: "Closed", value: progress.closed, color: SEGMENT_TEXT_COLORS.closed },
    { label: "Active", value: progress.inProgress, color: SEGMENT_TEXT_COLORS.inProgress },
    { label: "Blocked", value: progress.blocked, color: SEGMENT_TEXT_COLORS.blocked },
    { label: "Deferred", value: progress.deferred, color: SEGMENT_TEXT_COLORS.deferred },
    { label: "Open", value: progress.open, color: SEGMENT_TEXT_COLORS.open },
  ].filter((item) => item.value > 0)

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", item.color.replace("text-", "bg-"))} />
          <span className={cn("text-xs", item.color)}>
            {item.value} {item.label.toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Circular progress indicator (alternative visualization)
 */
function CircularProgress({
  percent,
  size = 80,
}: {
  percent: number
  size?: number
}) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-chrome-border/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-all duration-500",
            percent === 100 ? "text-acid-green" : "text-fuel-yellow"
          )}
        />
      </svg>
      {/* Center percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "text-lg font-bold",
            percent === 100 ? "text-acid-green" : "text-bone"
          )}
        >
          {percent}%
        </span>
      </div>
    </div>
  )
}

/**
 * EpicProgressGauge Component
 *
 * Visualizes epic progress based on children only (excludes the epic itself).
 *
 * Features:
 * - Segmented bar showing status breakdown
 * - Percentage complete (closed/total)
 * - Legend with counts per status
 * - Color coding: green (done), yellow (active), orange (blocked), gray (open)
 *
 * @example
 * ```tsx
 * <EpicProgressGauge
 *   progress={{ total: 10, open: 2, inProgress: 3, blocked: 1, deferred: 0, closed: 4, percentComplete: 40 }}
 *   showBreakdown
 * />
 * ```
 */
export function EpicProgressGauge({
  progress,
  showPercentage = true,
  showBreakdown = true,
  className,
}: EpicProgressGaugeProps) {
  if (progress.total === 0) {
    return (
      <div className={cn("text-center py-4", className)}>
        <p className="text-sm text-ash">No sub-issues to track</p>
        <p className="text-xs text-ash/70 mt-1">
          Add children to see progress
        </p>
      </div>
    )
  }

  const isComplete = progress.percentComplete === 100

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with percentage */}
      {showPercentage && (
        <div className="flex items-center justify-between">
          <span className="section-header">Progress</span>
          <span
            className={cn(
              "text-2xl font-bold",
              isComplete ? "text-acid-green" : "text-bone"
            )}
          >
            {progress.percentComplete}%
          </span>
        </div>
      )}

      {/* Progress bar */}
      <ProgressBar progress={progress} />

      {/* Breakdown legend */}
      {showBreakdown && (
        <div className="pt-2">
          <BreakdownLegend progress={progress} />
        </div>
      )}

      {/* Completion message */}
      {isComplete && (
        <div className="flex items-center gap-2 text-acid-green text-sm">
          <span className="w-2 h-2 rounded-full bg-acid-green" />
          <span>All {progress.total} sub-issues completed</span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact gauge for inline display (e.g., in lists)
 */
export function EpicProgressGaugeCompact({
  progress,
  className,
}: Pick<EpicProgressGaugeProps, "progress" | "className">) {
  if (progress.total === 0) {
    return <span className="text-xs text-ash">No children</span>
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Mini progress bar */}
      <div className="w-16 h-1.5 rounded-full bg-chrome-border/30 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300",
            progress.percentComplete === 100 ? "bg-acid-green" : "bg-fuel-yellow"
          )}
          style={{ width: `${progress.percentComplete}%` }}
        />
      </div>
      {/* Percentage */}
      <span
        className={cn(
          "text-xs font-medium",
          progress.percentComplete === 100 ? "text-acid-green" : "text-ash"
        )}
      >
        {progress.percentComplete}%
      </span>
    </div>
  )
}

/**
 * Circular variant for dashboard widgets
 */
export function EpicProgressGaugeCircular({
  progress,
  size = 100,
  className,
}: EpicProgressGaugeProps & { size?: number }) {
  if (progress.total === 0) {
    return (
      <div className={cn("text-center", className)}>
        <CircularProgress percent={0} size={size} />
        <p className="text-xs text-ash mt-2">No children</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <CircularProgress percent={progress.percentComplete} size={size} />
      <div className="text-center">
        <p className="text-xs text-ash">
          {progress.closed}/{progress.total} completed
        </p>
        {progress.inProgress > 0 && (
          <p className="text-xs text-fuel-yellow">{progress.inProgress} in progress</p>
        )}
      </div>
    </div>
  )
}
