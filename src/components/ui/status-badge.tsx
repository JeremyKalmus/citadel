import { cn } from "@/lib/utils"

export type Status = 'active' | 'thinking' | 'slow' | 'unresponsive' | 'dead' | 'blocked' | 'done'

interface StatusConfig {
  label: string
  dotColor: string
  textColor: string
}

/**
 * DS2 Phase 3: Dot + Label Pattern
 * Minimal industrial status indicator - colored dot with label text.
 * "The dot is the signal. The word is the meaning."
 */
const statusConfig: Record<Status, StatusConfig> = {
  active: {
    label: 'Running',
    dotColor: 'bg-status-active',
    textColor: 'text-status-active',
  },
  thinking: {
    label: 'Processing',
    dotColor: 'bg-status-thinking',
    textColor: 'text-status-thinking',
  },
  slow: {
    label: 'Throttled',
    dotColor: 'bg-status-slow',
    textColor: 'text-status-slow',
  },
  unresponsive: {
    label: 'Stalled',
    dotColor: 'bg-status-unresponsive',
    textColor: 'text-status-unresponsive',
  },
  dead: {
    label: 'Dead',
    dotColor: 'bg-status-dead',
    textColor: 'text-status-dead',
  },
  blocked: {
    label: 'Blocked',
    dotColor: 'bg-status-blocked',
    textColor: 'text-status-blocked',
  },
  done: {
    label: 'Complete',
    dotColor: 'bg-status-done',
    textColor: 'text-status-done',
  },
}

interface StatusBadgeProps {
  status: Status
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, showLabel = true, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={cn(
      "inline-flex items-center gap-2",
      className
    )}>
      {/* Status dot - the signal */}
      <span
        className={cn(
          "rounded-full flex-shrink-0",
          config.dotColor,
          {
            'w-2 h-2': size === 'sm',
            'w-2.5 h-2.5': size === 'md',
          }
        )}
        aria-hidden="true"
      />
      {/* Label - the meaning */}
      {showLabel && (
        <span className={cn(
          "font-medium uppercase tracking-wide",
          config.textColor,
          {
            'text-[10px]': size === 'sm',
            'text-xs': size === 'md',
          }
        )}>
          {config.label}
        </span>
      )}
    </span>
  )
}
