"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Panel, PanelHeader, PanelBody } from "@/components/ui"
import { StatusBadge, type Status } from "@/components/ui/status-badge"

/**
 * Status definition with meaning and action guidance
 */
interface StatusDefinition {
  status: Status
  meaning: string
  action: string
}

/**
 * All status definitions per spec section 4.5
 */
const statusDefinitions: StatusDefinition[] = [
  {
    status: 'active',
    meaning: 'Making progress on work',
    action: 'Nothing - working normally',
  },
  {
    status: 'thinking',
    meaning: 'Processing, quiet period',
    action: 'Wait - agent is thinking',
  },
  {
    status: 'slow',
    meaning: 'Taking longer than expected',
    action: 'Monitor - may need attention soon',
  },
  {
    status: 'unresponsive',
    meaning: 'No recent activity detected',
    action: 'Check - may be stuck',
  },
  {
    status: 'dead',
    meaning: 'Session terminated',
    action: 'Investigate - check logs',
  },
  {
    status: 'blocked',
    meaning: 'Waiting on dependency',
    action: 'Unblock - resolve dependency',
  },
  {
    status: 'done',
    meaning: 'Completed successfully',
    action: 'Nothing - work is complete',
  },
]

export interface StatusReferenceProps {
  /** Enable hover interactions for more details */
  interactive?: boolean
  /** Show as compact table or detailed cards */
  variant?: 'table' | 'cards'
  /** Additional className */
  className?: string
}

/**
 * StatusReference - Complete Status Guide
 *
 * Reference card showing all 7 status states with visual examples,
 * meanings, and recommended actions.
 * Per spec section 4.5.
 *
 * @example
 * ```tsx
 * <StatusReference />
 * <StatusReference interactive variant="cards" />
 * ```
 */
export function StatusReference({
  interactive = false,
  variant = 'table',
  className,
}: StatusReferenceProps) {
  const [hoveredStatus, setHoveredStatus] = useState<Status | null>(null)

  if (variant === 'cards') {
    return (
      <Panel className={className}>
        <PanelHeader icon="activity" title="Status Reference" />
        <PanelBody className="p-0">
          <div className="divide-y divide-chrome-border/30">
            {statusDefinitions.map((def) => (
              <StatusCard
                key={def.status}
                definition={def}
                interactive={interactive}
                isHovered={hoveredStatus === def.status}
                onHover={interactive ? setHoveredStatus : undefined}
              />
            ))}
          </div>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <Panel className={className}>
      <PanelHeader icon="activity" title="Status Reference" />
      <PanelBody className="p-0">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_1fr] gap-4 px-4 py-2 border-b border-chrome-border/50 bg-carbon-black/30">
          <div className="label text-ash w-28">Status</div>
          <div className="label text-ash">Meaning</div>
          <div className="label text-ash">What To Do</div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-chrome-border/30">
          {statusDefinitions.map((def) => (
            <StatusRow
              key={def.status}
              definition={def}
              interactive={interactive}
              isHovered={hoveredStatus === def.status}
              onHover={interactive ? setHoveredStatus : undefined}
            />
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}

interface StatusRowProps {
  definition: StatusDefinition
  interactive: boolean
  isHovered: boolean
  onHover?: (status: Status | null) => void
}

function StatusRow({ definition, interactive, isHovered, onHover }: StatusRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_1fr] gap-4 px-4 py-3 items-center",
        interactive && "cursor-pointer transition-colors",
        interactive && "hover:bg-carbon-black/40",
        isHovered && "bg-carbon-black/40"
      )}
      onMouseEnter={() => onHover?.(definition.status)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="w-28">
        <StatusBadge status={definition.status} />
      </div>
      <div className="body-text text-ash">{definition.meaning}</div>
      <div className="body-text text-bone">{definition.action}</div>
    </div>
  )
}

interface StatusCardProps {
  definition: StatusDefinition
  interactive: boolean
  isHovered: boolean
  onHover?: (status: Status | null) => void
}

function StatusCard({ definition, interactive, isHovered, onHover }: StatusCardProps) {
  return (
    <div
      className={cn(
        "px-4 py-4",
        interactive && "cursor-pointer transition-colors",
        interactive && "hover:bg-carbon-black/40",
        isHovered && "bg-carbon-black/40"
      )}
      onMouseEnter={() => onHover?.(definition.status)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 pt-0.5">
          <StatusBadge status={definition.status} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="body-text text-ash mb-1">{definition.meaning}</p>
          <p className="label text-bone">{definition.action}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * StatusReferenceCompact - Inline status legend
 *
 * Compact version showing just badges in a row.
 * Useful for quick reference in other contexts.
 */
export interface StatusReferenceCompactProps {
  /** Show only these statuses */
  statuses?: Status[]
  /** Additional className */
  className?: string
}

export function StatusReferenceCompact({
  statuses = ['active', 'thinking', 'slow', 'unresponsive', 'dead', 'blocked', 'done'],
  className,
}: StatusReferenceCompactProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {statuses.map((status) => (
        <StatusBadge key={status} status={status} size="sm" />
      ))}
    </div>
  )
}
