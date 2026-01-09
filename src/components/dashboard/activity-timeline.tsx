"use client"

import { Panel, PanelHeader, PanelBody } from "@/components/ui"
import { Icon, type IconName } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

export interface ActivityEvent {
  id: string
  timestamp: string
  type: "state_change" | "work_started" | "work_completed" | "error" | "info"
  title: string
  description?: string
}

interface ActivityTimelineProps {
  events: ActivityEvent[]
  loading?: boolean
  maxEvents?: number
}

const eventConfig: Record<ActivityEvent["type"], { icon: IconName; color: string }> = {
  state_change: { icon: "cog", color: "text-ash" },
  work_started: { icon: "play-circle", color: "text-fuel-yellow" },
  work_completed: { icon: "check-circle", color: "text-acid-green" },
  error: { icon: "x-circle", color: "text-rust-orange" },
  info: { icon: "activity", color: "text-ash" },
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return timestamp
  }
}

function TimelineEvent({ event }: { event: ActivityEvent }) {
  const config = eventConfig[event.type]

  return (
    <div className="flex gap-3 py-3 border-b border-chrome-border/30 last:border-0">
      <div className={cn("flex-shrink-0 pt-0.5", config.color)}>
        <Icon name={config.icon} aria-label="" size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="body-text font-medium truncate">{event.title}</p>
          <span className="caption text-ash flex-shrink-0">
            {formatTimestamp(event.timestamp)}
          </span>
        </div>
        {event.description && (
          <p className="caption text-ash mt-0.5 truncate">{event.description}</p>
        )}
      </div>
    </div>
  )
}

export function ActivityTimeline({
  events,
  loading = false,
  maxEvents = 10,
}: ActivityTimelineProps) {
  const displayEvents = events.slice(0, maxEvents)

  return (
    <Panel>
      <PanelHeader
        icon="activity"
        title="Activity"
        actions={
          <span className="caption text-ash">
            {loading ? "—" : `${events.length} events`}
          </span>
        }
      />
      <PanelBody className="p-0">
        {loading ? (
          <div className="p-4 text-center">
            <p className="caption text-ash">Loading activity...</p>
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="p-4 text-center">
            <p className="caption text-ash">No recent activity</p>
          </div>
        ) : (
          <div className="px-4">
            {displayEvents.map((event) => (
              <TimelineEvent key={event.id} event={event} />
            ))}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
