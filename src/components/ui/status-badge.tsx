import { cn } from "@/lib/utils"
import {
  Activity,
  Brain,
  Clock,
  AlertTriangle,
  XCircle,
  Lock,
  CheckCircle,
  type LucideIcon,
} from "lucide-react"

export type Status = 'active' | 'thinking' | 'slow' | 'unresponsive' | 'dead' | 'blocked' | 'done'

interface StatusConfig {
  icon: LucideIcon
  label: string
  className: string
}

const statusConfig: Record<Status, StatusConfig> = {
  active: {
    icon: Activity,
    label: 'Active',
    className: 'text-status-active bg-status-active/10 border-status-active/30'
  },
  thinking: {
    icon: Brain,
    label: 'Thinking',
    className: 'text-status-thinking bg-status-thinking/10 border-status-thinking/30'
  },
  slow: {
    icon: Clock,
    label: 'Slow',
    className: 'text-status-slow bg-status-slow/10 border-status-slow/30'
  },
  unresponsive: {
    icon: AlertTriangle,
    label: 'Unresponsive',
    className: 'text-status-unresponsive bg-status-unresponsive/10 border-status-unresponsive/30'
  },
  dead: {
    icon: XCircle,
    label: 'Dead',
    className: 'text-status-dead bg-status-dead/10 border-status-dead/30'
  },
  blocked: {
    icon: Lock,
    label: 'Blocked',
    className: 'text-status-blocked bg-status-blocked/10 border-status-blocked/30'
  },
  done: {
    icon: CheckCircle,
    label: 'Done',
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
  const Icon = config.icon

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium",
      config.className,
      className
    )}>
      <Icon className="w-3 h-3" />
      {showLabel && config.label}
    </span>
  )
}
