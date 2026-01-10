"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Panel, PanelBody } from "@/components/ui"
import { Icon } from "@/components/ui/icon"
import {
  type EntityType,
  type EntityLiveData,
  entityDefinitions
} from "../data/entities"

export interface EntityCardProps {
  /** Entity type to display */
  entity: EntityType
  /** Whether the card is expanded */
  expanded?: boolean
  /** Callback when expand/collapse is toggled */
  onToggle?: () => void
  /** Live data to display (if available) */
  liveData?: EntityLiveData[EntityType]
  /** Additional className */
  className?: string
}

/**
 * Format live data for display based on entity type
 */
function formatLiveData(entity: EntityType, data: EntityLiveData[EntityType]): string {
  if (!data) return "—"

  switch (entity) {
    case 'town': {
      const d = data as EntityLiveData['town']
      return `${d?.rigCount ?? 0} rigs`
    }
    case 'rig': {
      const d = data as EntityLiveData['rig']
      return `${d?.polecatCount ?? 0} workers / ${d?.convoyCount ?? 0} convoys`
    }
    case 'convoy': {
      const d = data as EntityLiveData['convoy']
      return `${d?.completedCount ?? 0}/${d?.issueCount ?? 0} complete`
    }
    case 'polecat': {
      const d = data as EntityLiveData['polecat']
      return d?.currentTask || "Idle"
    }
    case 'refinery': {
      const d = data as EntityLiveData['refinery']
      return `${d?.queueDepth ?? 0} in queue`
    }
    case 'witness': {
      const d = data as EntityLiveData['witness']
      return `${d?.activePolecats ?? 0}/${d?.monitoredPolecats ?? 0} active`
    }
    case 'beads': {
      const d = data as EntityLiveData['beads']
      return `${d?.openCount ?? 0} open / ${d?.closedCount ?? 0} closed`
    }
    default:
      return "—"
  }
}

/**
 * EntityCard - Expandable Entity Explainer
 *
 * Displays an expandable card explaining each Gas Town entity type.
 * Uses Panel component with elevated variant when expanded.
 * Per spec section 4.3.
 *
 * @example
 * ```tsx
 * <EntityCard entity="polecat" expanded={true} onToggle={() => {}} />
 * <EntityCard
 *   entity="rig"
 *   liveData={{ name: "citadel", polecatCount: 3, convoyCount: 2, openBeads: 5 }}
 * />
 * ```
 */
export function EntityCard({
  entity,
  expanded: controlledExpanded,
  onToggle,
  liveData,
  className,
}: EntityCardProps) {
  // Support both controlled and uncontrolled expansion
  const [internalExpanded, setInternalExpanded] = useState(false)
  const isControlled = controlledExpanded !== undefined
  const expanded = isControlled ? controlledExpanded : internalExpanded

  const definition = entityDefinitions[entity]

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    }
    if (!isControlled) {
      setInternalExpanded(!internalExpanded)
    }
  }

  return (
    <Panel
      variant={expanded ? "elevated" : "default"}
      className={cn(
        "transition-all duration-200 ease-out",
        expanded && "ring-1 ring-chrome-border/50",
        className
      )}
    >
      {/* Header - Always visible, clickable to toggle */}
      <button
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3",
          "text-left transition-colors hover:bg-carbon-black/30",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-acid-green/50 focus-visible:ring-inset",
          expanded && "border-b border-chrome-border/50"
        )}
        aria-expanded={expanded}
        aria-controls={`entity-card-${entity}-content`}
      >
        <div className="flex items-center gap-3">
          <Icon
            name={definition.icon}
            aria-label=""
            variant="muted"
            size="md"
            className="flex-shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-bone font-semibold">{definition.name}</span>
            <span className="text-ash text-sm">{definition.tagline}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live data badge */}
          {liveData && (
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <span className="label text-ash">{definition.liveDataLabel}:</span>
              <span className="label text-bone font-medium">
                {formatLiveData(entity, liveData)}
              </span>
            </div>
          )}

          {/* Expand/collapse chevron */}
          <Icon
            name={expanded ? "chevron-down" : "chevron-right"}
            aria-label={expanded ? "Collapse" : "Expand"}
            variant="muted"
            size="sm"
            className={cn(
              "flex-shrink-0 transition-transform duration-200",
              expanded && "text-bone"
            )}
          />
        </div>
      </button>

      {/* Expandable content */}
      <div
        id={`entity-card-${entity}-content`}
        className={cn(
          "grid transition-all duration-200 ease-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          <PanelBody className="pt-0">
            {/* Description */}
            <p className="body-text text-ash leading-relaxed mb-4">
              {definition.description}
            </p>

            {/* Live data (mobile - shown in expanded state) */}
            {liveData && (
              <div className="sm:hidden mb-4 p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
                <div className="flex items-center justify-between">
                  <span className="label text-ash">{definition.liveDataLabel}</span>
                  <span className="label text-bone font-medium">
                    {formatLiveData(entity, liveData)}
                  </span>
                </div>
              </div>
            )}

            {/* Related entities */}
            {definition.relatedEntities.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="label text-ash">Related:</span>
                {definition.relatedEntities.map((related) => (
                  <span
                    key={related}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-carbon-black/50 border border-chrome-border/30 text-xs text-bone"
                  >
                    <Icon
                      name={entityDefinitions[related].icon}
                      aria-label=""
                      size="xs"
                      variant="muted"
                    />
                    {entityDefinitions[related].name}
                  </span>
                ))}
              </div>
            )}
          </PanelBody>
        </div>
      </div>
    </Panel>
  )
}

/**
 * EntityCardList - Renders all entity cards
 */
export interface EntityCardListProps {
  /** Live data for entities */
  liveData?: EntityLiveData
  /** Callback when entity is clicked */
  onEntityClick?: (entity: EntityType) => void
  /** Currently selected entity */
  selectedEntity?: EntityType
  /** Additional className */
  className?: string
}

export function EntityCardList({
  liveData,
  onEntityClick,
  selectedEntity,
  className,
}: EntityCardListProps) {
  const [expandedEntity, setExpandedEntity] = useState<EntityType | null>(
    selectedEntity || null
  )

  const handleToggle = (entity: EntityType) => {
    const newExpanded = expandedEntity === entity ? null : entity
    setExpandedEntity(newExpanded)
    if (onEntityClick && newExpanded) {
      onEntityClick(newExpanded)
    }
  }

  const entities: EntityType[] = ['town', 'rig', 'convoy', 'polecat', 'refinery', 'witness', 'beads']

  return (
    <div className={cn("space-y-2", className)}>
      {entities.map((entity) => (
        <EntityCard
          key={entity}
          entity={entity}
          expanded={expandedEntity === entity}
          onToggle={() => handleToggle(entity)}
          liveData={liveData?.[entity]}
        />
      ))}
    </div>
  )
}
