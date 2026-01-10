import { cn } from "@/lib/utils"
import { formatCost } from "@/lib/cost-utils"
import type { SparklinePoint } from "@/lib/cost-utils"

export interface CostSparklineProps {
  /** Data points for the sparkline */
  data: SparklinePoint[]
  /** Width of the sparkline */
  width?: number
  /** Height of the sparkline */
  height?: number
  /** Show the current/latest value */
  showValue?: boolean
  /** Show trend indicator (up/down arrow) */
  showTrend?: boolean
  /** Color variant */
  variant?: "default" | "warning" | "danger"
  /** Additional class names */
  className?: string
}

/**
 * DS2 CostSparkline - Inline cost visualization
 *
 * A compact sparkline chart showing cost over time with optional
 * current value display and trend indicator.
 */
export function CostSparkline({
  data,
  width = 80,
  height = 24,
  showValue = true,
  showTrend = true,
  variant = "default",
  className,
}: CostSparklineProps) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className="bg-gunmetal rounded-sm"
          style={{ width, height }}
        />
        {showValue && (
          <span className="font-mono text-sm text-ash">--</span>
        )}
      </div>
    )
  }

  // Calculate min/max for scaling
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1 // Avoid division by zero

  // Calculate trend (compare last value to average)
  const currentValue = values[values.length - 1]
  const previousValue = values.length > 1 ? values[values.length - 2] : currentValue
  const trend = currentValue > previousValue ? "up" : currentValue < previousValue ? "down" : "flat"

  // Generate SVG path for sparkline
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((d.value - min) / range) * (height - 4) - 2 // 2px padding
    return `${x},${y}`
  })
  const pathD = `M ${points.join(" L ")}`

  // Line color based on variant
  const lineColor = {
    default: "stroke-bone",
    warning: "stroke-status-blocked",
    danger: "stroke-status-dead",
  }[variant]

  // Fill gradient
  const fillColor = {
    default: "fill-bone/10",
    warning: "fill-status-blocked/10",
    danger: "fill-status-dead/10",
  }[variant]

  // Create fill path (closed area under the line)
  const fillPathD = `${pathD} L ${width},${height} L 0,${height} Z`

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Sparkline SVG */}
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Area fill */}
        <path
          d={fillPathD}
          className={cn(fillColor, "transition-all")}
        />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(lineColor, "transition-all")}
        />
        {/* End dot */}
        <circle
          cx={width}
          cy={height - ((currentValue - min) / range) * (height - 4) - 2}
          r={2}
          className={cn(lineColor.replace("stroke-", "fill-"), "transition-all")}
        />
      </svg>

      {/* Value and trend */}
      {showValue && (
        <div className="flex items-center gap-1">
          <span className={cn(
            "font-mono text-sm tabular-nums",
            variant === "default" && "text-bone",
            variant === "warning" && "text-status-blocked",
            variant === "danger" && "text-status-dead",
          )}>
            {formatCost(currentValue, { compact: true })}
          </span>
          {showTrend && trend !== "flat" && (
            <span className={cn(
              "text-xs",
              trend === "up" && "text-status-dead",
              trend === "down" && "text-status-active",
            )}>
              {trend === "up" ? "↑" : "↓"}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Simplified cost display with just a value and optional sparkline dots
 */
export interface CostBadgeProps {
  /** Current cost value */
  value: number
  /** Previous value for comparison */
  previousValue?: number
  /** Size variant */
  size?: "sm" | "md"
  /** Color variant */
  variant?: "default" | "warning" | "danger"
  /** Additional class names */
  className?: string
}

export function CostBadge({
  value,
  previousValue,
  size = "md",
  variant = "default",
  className,
}: CostBadgeProps) {
  const trend = previousValue !== undefined
    ? value > previousValue ? "up" : value < previousValue ? "down" : "flat"
    : "flat"

  const textSize = size === "sm" ? "text-xs" : "text-sm"

  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-mono tabular-nums",
      textSize,
      variant === "default" && "text-bone",
      variant === "warning" && "text-status-blocked",
      variant === "danger" && "text-status-dead",
      className,
    )}>
      {formatCost(value, { compact: true })}
      {trend !== "flat" && (
        <span className={cn(
          "text-xs",
          trend === "up" && "text-status-dead",
          trend === "down" && "text-status-active",
        )}>
          {trend === "up" ? "↑" : "↓"}
        </span>
      )}
    </span>
  )
}
