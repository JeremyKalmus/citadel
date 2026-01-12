import { cn } from "@/lib/utils"
import { Icon, statusIcons, type IconName } from "./icon"

export type Status =
  | 'active' | 'thinking' | 'slow' | 'unresponsive' | 'dead' | 'blocked' | 'done'
  | 'refinery_queued' | 'refinery_rebasing' | 'refinery_testing' | 'refinery_merging'

interface StatusConfig {
  icon: IconName
  label: string
  className: string
}

// DS2: Industrial status labels - firm, grounded language
const statusConfig: Record<Status, StatusConfig> = {
  active: {
    icon: statusIcons.active,
    label: 'Running',
    className: 'text-status-active bg-status-active/10 border-status-active/30'
  },
  thinking: {
    icon: statusIcons.thinking,
    label: 'Processing',
    className: 'text-status-thinking bg-status-thinking/10 border-status-thinking/30'
  },
  slow: {
    icon: statusIcons.slow,
    label: 'Throttled',
    className: 'text-status-slow bg-status-slow/10 border-status-slow/30'
  },
  unresponsive: {
    icon: statusIcons.unresponsive,
    label: 'Stalled',
    className: 'text-status-unresponsive bg-status-unresponsive/10 border-status-unresponsive/30'
  },
  dead: {
    icon: statusIcons.dead,
    label: 'Dead',
    className: 'text-status-dead bg-status-dead/10 border-status-dead/30'
  },
  blocked: {
    icon: statusIcons.blocked,
    label: 'Blocked',
    className: 'text-status-blocked bg-status-blocked/10 border-status-blocked/30'
  },
  done: {
    icon: statusIcons.done,
    label: 'Complete',
    className: 'text-status-done bg-status-done/10 border-status-done/30'
  },
  // Refinery pipeline states
  refinery_queued: {
    icon: statusIcons.refinery_queued,
    label: 'Queued',
    className: 'text-[var(--status-refinery-queued)] bg-[var(--status-refinery-queued-bg)] border-[var(--status-refinery-queued)]/30'
  },
  refinery_rebasing: {
    icon: statusIcons.refinery_rebasing,
    label: 'Rebasing',
    className: 'text-[var(--status-refinery-rebasing)] bg-[var(--status-refinery-rebasing-bg)] border-[var(--status-refinery-rebasing)]/30'
  },
  refinery_testing: {
    icon: statusIcons.refinery_testing,
    label: 'Testing',
    className: 'text-[var(--status-refinery-testing)] bg-[var(--status-refinery-testing-bg)] border-[var(--status-refinery-testing)]/30'
  },
  refinery_merging: {
    icon: statusIcons.refinery_merging,
    label: 'Merging',
    className: 'text-[var(--status-refinery-merging)] bg-[var(--status-refinery-merging-bg)] border-[var(--status-refinery-merging)]/30'
  },
}

export interface StatusBadgeProps {
  status: Status
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-[10px] gap-1",
  md: "px-2 py-1 text-xs gap-1.5",
}

export function StatusBadge({ status, showLabel = true, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={cn(
      "inline-flex items-center rounded-sm border font-medium uppercase tracking-wide",
      sizeStyles[size],
      config.className,
      className
    )}>
      <Icon
        name={config.icon}
        aria-label={config.label}
        size={size === 'sm' ? 'xs' : 'sm'}
      />
      {showLabel && config.label}
    </span>
  )
}
