"use client"

import { cn } from "@/lib/utils"
import {
  type CostTrend,
  formatTokenCount,
  formatCostUsd,
} from "@/lib/gastown/types"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface CostSparklineProps {
  /** Token count */
  tokens: number
  /** Cost in USD */
  costUsd: number
  /** Trend direction */
  trend?: CostTrend
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Optional className */
  className?: string
  /** Show tokens (default true) */
  showTokens?: boolean
  /** Show cost (default true) */
  showCost?: boolean
}

const sizeStyles = {
  sm: {
    text: "text-[10px]",
    icon: "w-3 h-3",
    gap: "gap-1",
  },
  md: {
    text: "text-xs",
    icon: "w-3.5 h-3.5",
    gap: "gap-1.5",
  },
  lg: {
    text: "text-sm",
    icon: "w-4 h-4",
    gap: "gap-2",
  },
}

const trendConfig: Record<CostTrend, { icon: typeof TrendingUp; color: string; label: string }> = {
  up: {
    icon: TrendingUp,
    color: "text-rust-orange",
    label: "Increasing",
  },
  down: {
    icon: TrendingDown,
    color: "text-acid-green",
    label: "Decreasing",
  },
  flat: {
    icon: Minus,
    color: "text-ash",
    label: "Stable",
  },
}

/**
 * CostSparkline Component
 *
 * Inline cost indicator showing tokens and/or USD cost with optional trend.
 * Usage: "450k . $2.25 ^"
 *
 * From spec section 2.5:
 * - Tokens formatted as "450k" or "1.2M"
 * - Cost formatted as "$2.25"
 * - Trend indicator (up/down/flat)
 */
export function CostSparkline({
  tokens,
  costUsd,
  trend,
  size = "md",
  className,
  showTokens = true,
  showCost = true,
}: CostSparklineProps) {
  const styles = sizeStyles[size]
  const trendInfo = trend ? trendConfig[trend] : null
  const TrendIcon = trendInfo?.icon

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono",
        styles.text,
        styles.gap,
        className
      )}
    >
      {showTokens && (
        <span className="text-bone tabular-nums">
          {formatTokenCount(tokens)}
        </span>
      )}

      {showTokens && showCost && (
        <span className="text-ash/50">.</span>
      )}

      {showCost && (
        <span className="text-acid-green tabular-nums">
          {formatCostUsd(costUsd)}
        </span>
      )}

      {TrendIcon && (
        <TrendIcon
          className={cn(styles.icon, trendInfo.color)}
          aria-label={trendInfo.label}
        />
      )}
    </span>
  )
}

/**
 * CostBadge - A more prominent cost display variant
 */
export function CostBadge({
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
  const trendInfo = trend ? trendConfig[trend] : null
  const TrendIcon = trendInfo?.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2 py-1 rounded-sm",
        "bg-gunmetal border border-chrome-border",
        className
      )}
    >
      <div className="flex flex-col">
        <span className="text-xs text-ash">Tokens</span>
        <span className="text-sm font-mono font-medium text-bone tabular-nums">
          {formatTokenCount(tokens)}
        </span>
      </div>
      <div className="w-px h-8 bg-chrome-border" />
      <div className="flex flex-col">
        <span className="text-xs text-ash">Cost</span>
        <span className="text-sm font-mono font-medium text-acid-green tabular-nums">
          {formatCostUsd(costUsd)}
        </span>
      </div>
      {TrendIcon && (
        <TrendIcon
          className={cn("w-4 h-4 ml-1", trendInfo.color)}
          aria-label={trendInfo.label}
        />
      )}
    </div>
  )
}
