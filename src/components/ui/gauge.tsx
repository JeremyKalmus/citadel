import { cn } from "@/lib/utils"

interface GaugeProps {
  value: number  // 0-100
  size?: 'sm' | 'md' | 'lg'
  segments?: number
  showLabel?: boolean
  className?: string
}

const sizeConfig = {
  sm: { height: 'h-3', gap: 'gap-0.5' },
  md: { height: 'h-4', gap: 'gap-1' },
  lg: { height: 'h-5', gap: 'gap-1' },
}

/**
 * DS2 Phase 3: Segmented Fuel Gauge
 * Industrial, mechanical progress indicator with discrete segments.
 * "Like a fuel gauge on a war rig - you see exactly how much is left."
 */
export function Gauge({
  value,
  size = 'md',
  segments = 10,
  showLabel = true,
  className
}: GaugeProps) {
  // Clamp value between 0-100
  const clampedValue = Math.min(100, Math.max(0, value))

  // Calculate how many segments should be filled
  const filledSegments = Math.round((clampedValue / 100) * segments)

  const { height, gap } = sizeConfig[size]

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Segmented gauge bar */}
      <div className={cn("flex-1 flex", gap)}>
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filledSegments
          const isLast = i === segments - 1
          const isFirst = i === 0

          return (
            <div
              key={i}
              className={cn(
                "flex-1 transition-colors duration-150",
                height,
                // Filled segments get the bright color
                isFilled
                  ? "bg-bone"
                  : "bg-chrome-border/40",
                // Hard edges - minimal rounding only on ends
                {
                  'rounded-l-sm': isFirst,
                  'rounded-r-sm': isLast,
                }
              )}
            />
          )
        })}
      </div>
      {/* Percentage label */}
      {showLabel && (
        <span className="label font-mono w-10 text-right tabular-nums">
          {clampedValue}%
        </span>
      )}
    </div>
  )
}
