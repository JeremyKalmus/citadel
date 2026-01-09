import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Skeleton variant - determines shape and size */
  variant?: "text" | "circle" | "rect" | "stat" | "row"
  /** Width - can be Tailwind class or CSS value */
  width?: string
  /** Height - can be Tailwind class or CSS value */
  height?: string
}

/**
 * DS2 Skeleton Component
 * Loading placeholder with industrial pulse animation.
 * Uses gunmetal base with chrome-border highlight sweep.
 */
export function Skeleton({
  className,
  variant = "rect",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantStyles: Record<NonNullable<SkeletonProps["variant"]>, string> = {
    text: "h-4 rounded-sm",
    circle: "rounded-full aspect-square",
    rect: "rounded-sm",
    stat: "h-8 w-16 rounded-sm",
    row: "h-12 rounded-sm",
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-chrome-border/30",
        variantStyles[variant],
        className
      )}
      style={{
        width: width?.startsWith("w-") ? undefined : width,
        height: height?.startsWith("h-") ? undefined : height,
        ...style,
      }}
      {...props}
    />
  )
}

/**
 * Skeleton group for common loading patterns
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            // Last line is shorter for natural text appearance
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

/**
 * Stat card skeleton for StatsGrid loading state
 */
export function SkeletonStat({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton variant="text" className="w-20 h-3" />
      <Skeleton variant="stat" className="w-16" />
    </div>
  )
}

/**
 * Row skeleton for list loading states
 */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 border-b border-chrome-border/30",
        className
      )}
    >
      <Skeleton variant="circle" className="w-8 h-8" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
      <Skeleton variant="rect" className="w-16 h-5" />
    </div>
  )
}

/**
 * Panel skeleton for full panel loading
 */
export function SkeletonPanel({
  rows = 3,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-0 px-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

/**
 * Gauge skeleton for circular progress loading
 */
export function SkeletonGauge({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const sizeStyles = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  return (
    <Skeleton
      variant="circle"
      className={cn(sizeStyles[size], className)}
    />
  )
}
