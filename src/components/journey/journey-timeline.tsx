"use client"

import { cn } from "@/lib/utils"
import {
  JourneyStage,
  type JourneyState,
  type JourneyTimestamps,
  type WorkingSubstage,
  JOURNEY_STAGE_LABELS,
  JOURNEY_STAGE_ACTORS,
  WORKING_SUBSTAGE_LABELS,
  formatDuration,
  formatRelativeTime,
} from "@/lib/gastown/types"

/**
 * Timeline event for journey visualization
 */
interface TimelineEvent {
  stage: JourneyStage
  substage?: WorkingSubstage
  timestamp?: string
  actor?: string
  description?: string
  isCompleted: boolean
  isCurrent: boolean
  isBlocked?: boolean
}

/**
 * Single timeline entry component
 */
function TimelineEntry({
  event,
  isLast,
}: {
  event: TimelineEvent
  isLast: boolean
}) {
  const { stage, substage, timestamp, actor, description, isCompleted, isCurrent, isBlocked } = event

  return (
    <div className="flex gap-3">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div
          className={cn(
            "w-3 h-3 rounded-full border-2 shrink-0",
            {
              "bg-acid-green border-acid-green": isCompleted,
              "bg-fuel-yellow border-fuel-yellow animate-pulse": isCurrent && !isBlocked,
              "bg-rust-orange border-rust-orange animate-pulse": isCurrent && isBlocked,
              "bg-transparent border-ash/50": !isCompleted && !isCurrent,
            }
          )}
        />
        {/* Connecting line */}
        {!isLast && (
          <div
            className={cn("w-0.5 flex-1 min-h-[24px]", {
              "bg-acid-green": isCompleted,
              "bg-chrome-border": !isCompleted,
            })}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-4 flex-1">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span
            className={cn("text-sm font-medium", {
              "text-acid-green": isCompleted,
              "text-fuel-yellow": isCurrent && !isBlocked,
              "text-rust-orange": isCurrent && isBlocked,
              "text-ash": !isCompleted && !isCurrent,
            })}
          >
            {JOURNEY_STAGE_LABELS[stage]}
            {substage && isCurrent && (
              <span className="text-xs ml-1 opacity-75">
                ({WORKING_SUBSTAGE_LABELS[substage]})
              </span>
            )}
          </span>
          {isCurrent && (
            <span className="text-[10px] uppercase tracking-wider text-fuel-yellow bg-fuel-yellow/10 px-1.5 py-0.5 rounded">
              Current
            </span>
          )}
          {isBlocked && (
            <span className="text-[10px] uppercase tracking-wider text-rust-orange bg-rust-orange/10 px-1.5 py-0.5 rounded">
              Blocked
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-3 mt-1 text-xs text-ash">
          {timestamp && (
            <span title={timestamp}>
              {formatRelativeTime(timestamp)}
            </span>
          )}
          {actor && (
            <span className="text-ash/70">
              {JOURNEY_STAGE_ACTORS[stage]}: {actor}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-ash/70 mt-1">{description}</p>
        )}

        {/* Duration (for completed stages with next timestamp) */}
        {isCompleted && timestamp && (
          <div className="text-[10px] text-ash/50 mt-1">
            Duration: {formatDuration(timestamp)}
          </div>
        )}
      </div>
    </div>
  )
}

export interface JourneyTimelineProps {
  /** Issue/bead ID */
  issueId: string
  /** Current journey state */
  journey: JourneyState
  /** Optional className */
  className?: string
  /** Show all stages or only relevant ones */
  showAllStages?: boolean
}

/**
 * JourneyTimeline Component
 *
 * Vertical timeline showing journey progression for an issue.
 * Each stage appears as a timeline entry with timestamp, actor, and status.
 *
 * Design follows spec section 1.4 with vertical layout for detail views.
 */
export function JourneyTimeline({
  issueId,
  journey,
  className,
  showAllStages = true,
}: JourneyTimelineProps) {
  const { currentStage, substage, timestamps, actor, blocked, blockReason } = journey

  // Build timeline events
  const stages = [
    JourneyStage.QUEUED,
    JourneyStage.CLAIMED,
    JourneyStage.WORKING,
    JourneyStage.PR_READY,
    JourneyStage.REFINERY,
    JourneyStage.MERGED,
  ]

  const stageTimestamps: Record<JourneyStage, string | undefined> = {
    [JourneyStage.QUEUED]: timestamps.queued,
    [JourneyStage.CLAIMED]: timestamps.claimed,
    [JourneyStage.WORKING]: timestamps.workStarted,
    [JourneyStage.PR_READY]: timestamps.prOpened,
    [JourneyStage.REFINERY]: timestamps.refineryEntered,
    [JourneyStage.MERGED]: timestamps.merged,
  }

  const events: TimelineEvent[] = stages
    .filter((stage) => {
      if (showAllStages) return true
      // Only show completed stages and current stage
      return stage <= currentStage
    })
    .map((stage) => ({
      stage,
      substage: stage === JourneyStage.WORKING ? substage : undefined,
      timestamp: stageTimestamps[stage],
      actor: stage === currentStage ? actor : undefined,
      isCompleted: stage < currentStage,
      isCurrent: stage === currentStage,
      isBlocked: stage === currentStage && blocked,
      description: stage === currentStage && blocked ? blockReason : undefined,
    }))

  return (
    <div className={cn("", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="section-header">Journey Timeline</span>
        {issueId && (
          <span className="text-[10px] font-mono text-ash">{issueId}</span>
        )}
      </div>

      {/* Timeline */}
      <div className="pl-1">
        {events.map((event, index) => (
          <TimelineEntry
            key={event.stage}
            event={event}
            isLast={index === events.length - 1}
          />
        ))}
      </div>

      {/* Summary */}
      {currentStage === JourneyStage.MERGED && timestamps.queued && timestamps.merged && (
        <div className="mt-4 pt-4 border-t border-chrome-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ash">Total Duration</span>
            <span className="text-acid-green font-medium">
              {formatDuration(timestamps.queued, timestamps.merged)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact journey timeline for smaller spaces
 */
export function JourneyTimelineCompact({
  journey,
  className,
}: {
  journey: JourneyState
  className?: string
}) {
  const { currentStage, blocked, timestamps } = journey

  const stages = [
    { stage: JourneyStage.QUEUED, label: "Q" },
    { stage: JourneyStage.CLAIMED, label: "C" },
    { stage: JourneyStage.WORKING, label: "W" },
    { stage: JourneyStage.PR_READY, label: "P" },
    { stage: JourneyStage.MERGED, label: "M" },
  ]

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stages.map(({ stage, label }, index) => {
        const isCompleted = stage < currentStage
        const isCurrent = stage === currentStage

        return (
          <div key={stage} className="flex items-center">
            <div
              className={cn(
                "w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-medium",
                {
                  "bg-acid-green/20 text-acid-green": isCompleted,
                  "bg-fuel-yellow/20 text-fuel-yellow": isCurrent && !blocked,
                  "bg-rust-orange/20 text-rust-orange": isCurrent && blocked,
                  "bg-chrome-border/50 text-ash/50": !isCompleted && !isCurrent,
                }
              )}
              title={JOURNEY_STAGE_LABELS[stage]}
            >
              {label}
            </div>
            {index < stages.length - 1 && (
              <div
                className={cn("w-1 h-px mx-0.5", {
                  "bg-acid-green": isCompleted,
                  "bg-chrome-border": !isCompleted,
                })}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
