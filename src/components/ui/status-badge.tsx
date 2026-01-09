import { cn } from "@/lib/utils"
import { Icon, statusIcons, type IconName } from "./icon"

export type Status = 'active' | 'thinking' | 'slow' | 'unresponsive' | 'dead' | 'blocked' | 'done'

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
}

interface StatusBadgeProps {
  status: Status
  showLabel?: boolean
  className?: string
}

export function StatusBadge({ status, showLabel = true, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border text-xs font-medium uppercase tracking-wide",
      config.className,
      className
    )}>
      <Icon
        name={config.icon}
        aria-label={config.label}
        size="xs"
      />
      {showLabel && config.label}
    </span>
  )
}
