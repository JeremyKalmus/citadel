import { cn } from "@/lib/utils"

interface GaugeProps {
  value: number  // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function Gauge({ value, size = 'md', showLabel = true, className }: GaugeProps) {
  // Clamp value between 0-100
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex-1 bg-iron rounded-full overflow-hidden",
        sizes[size]
      )}>
        <div
          className="h-full bg-gradient-to-r from-chrome-dust to-chrome-bright rounded-full transition-all duration-500"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-chrome-dust w-10 text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  )
}
