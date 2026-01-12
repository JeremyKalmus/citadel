"use client"

import { cn } from "@/lib/utils"
import {
  EpicJourneyStage,
  type EpicJourneyTrackerProps,
  type EpicProgress,
  EPIC_JOURNEY_LABELS,
  formatRelativeTime,
} from "@/lib/gastown/types"

/**
 * Stage dot component for epic journey - displays a single stage indicator
 */
function EpicStageDot({
  stage,
  currentStage,
  timestamp,
}: {
  stage: EpicJourneyStage
  currentStage: EpicJourneyStage
  timestamp?: string
}) {
  const isCompleted = stage < currentStage
  const isCurrent = stage === currentStage
  const isPending = stage > currentStage

  // Key difference from task journey:
  // - CLOSE_ELIGIBLE and CLOSED are both GREEN (acid-green)
  // - ACTIVE is yellow (fuel-yellow) - work is happening
  const isCloseEligibleOrClosed =
    isCurrent &&
    (stage === EpicJourneyStage.CLOSE_ELIGIBLE || stage === EpicJourneyStage.CLOSED)
  const isActiveStage = isCurrent && stage === EpicJourneyStage.ACTIVE

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Dot indicator */}
      <div
        className={cn(
          "w-3 h-3 rounded-full border-2 transition-all duration-300",
          {
            // Completed or close-eligible/closed: acid-green solid
            "bg-acid-green border-acid-green": isCompleted || isCloseEligibleOrClosed,
            // Active stage: fuel-yellow with pulse
            "bg-fuel-yellow border-fuel-yellow animate-pulse": isActiveStage,
            // Created/Planned (current but not active): chrome-border
            "bg-chrome-border border-chrome-border":
              isCurrent && !isActiveStage && !isCloseEligibleOrClosed,
            // Pending: hollow with ash border
            "bg-transparent border-ash": isPending,
          }
        )}
      />
      {/* Stage label */}
      <span
        className={cn("text-[10px] font-medium uppercase tracking-wider", {
          "text-acid-green": isCompleted || isCloseEligibleOrClosed,
          "text-fuel-yellow": isActiveStage,
          "text-chrome-border": isCurrent && !isActiveStage && !isCloseEligibleOrClosed,
          "text-ash": isPending,
        })}
      >
        {EPIC_JOURNEY_LABELS[stage]}
      </span>
      {/* Timestamp */}
      <span className="text-[10px] text-ash/70">
        {timestamp ? formatRelativeTime(timestamp) : "-"}
      </span>
    </div>
  )
}

/**
 * Connector line between epic stages
 */
function EpicStageConnector({
  fromStage,
  currentStage,
}: {
  fromStage: EpicJourneyStage
  currentStage: EpicJourneyStage
}) {
  const isCompleted = fromStage < currentStage

  return (
    <div
      className={cn("flex-1 h-0.5 transition-colors duration-300", {
        "bg-acid-green": isCompleted,
        "bg-chrome-border": !isCompleted,
      })}
    />
  )
}

/**
 * Progress summary for epic children
 */
function EpicProgressSummary({ progress }: { progress: EpicProgress }) {
  if (progress.total === 0) {
    return (
      <div className="text-xs text-ash">
        No sub-issues yet
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 text-[11px]">
      <span className="text-bone font-medium">
        {progress.percentComplete}% complete
      </span>
      <span className="text-ash">
        {progress.closed}/{progress.total} closed
      </span>
      {progress.inProgress > 0 && (
        <span className="text-fuel-yellow">
          {progress.inProgress} in progress
        </span>
      )}
      {progress.blocked > 0 && (
        <span className="text-rust-orange">
          {progress.blocked} blocked
        </span>
      )}
    </div>
  )
}

/**
 * EpicJourneyTracker Component
 *
 * Displays the epic lifecycle as a horizontal progress indicator:
 * CREATED → PLANNED → ACTIVE → CLOSE-ELIGIBLE → CLOSED
 *
 * Key differences from task JourneyTracker:
 * - CLOSE_ELIGIBLE is GREEN (acid-green) - signals ready to close
 * - No substages (epics aggregate child work)
 * - Shows child progress summary below
 *
 * Design tokens (DS2):
 * - Completed/Close-eligible: acid-green (#27AE60)
 * - Active: fuel-yellow (#F2C94C) with pulse
 * - Pending: ash (#9AA1AC)
 */
export function EpicJourneyTracker({
  epicId,
  currentStage,
  timestamps,
  progress,
}: EpicJourneyTrackerProps) {
  const stages = [
    EpicJourneyStage.CREATED,
    EpicJourneyStage.PLANNED,
    EpicJourneyStage.ACTIVE,
    EpicJourneyStage.CLOSE_ELIGIBLE,
    EpicJourneyStage.CLOSED,
  ]

  // Map timestamps to stages
  const stageTimestamps: Record<EpicJourneyStage, string | undefined> = {
    [EpicJourneyStage.CREATED]: timestamps.created,
    [EpicJourneyStage.PLANNED]: timestamps.planned,
    [EpicJourneyStage.ACTIVE]: timestamps.activated,
    [EpicJourneyStage.CLOSE_ELIGIBLE]: timestamps.closeEligible,
    [EpicJourneyStage.CLOSED]: timestamps.closed,
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="section-header">Epic Journey</span>
        {epicId && (
          <span className="text-[10px] font-mono text-ash">{epicId}</span>
        )}
      </div>

      {/* Progress bar with stages */}
      <div className="flex items-start gap-0">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-start flex-1">
            <EpicStageDot
              stage={stage}
              currentStage={currentStage}
              timestamp={stageTimestamps[stage]}
            />
            {/* Connector to next stage */}
            {index < stages.length - 1 && (
              <div className="flex-1 pt-1.5 px-1">
                <EpicStageConnector fromStage={stage} currentStage={currentStage} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress summary */}
      <div className="mt-4 pt-3 border-t border-chrome-border/50">
        <EpicProgressSummary progress={progress} />
      </div>

      {/* Close-eligible indicator */}
      {currentStage === EpicJourneyStage.CLOSE_ELIGIBLE && (
        <div className="mt-3 flex items-center gap-2 text-acid-green text-xs">
          <span className="w-2 h-2 rounded-full bg-acid-green" />
          <span>All sub-issues closed - ready to close epic</span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact EpicJourneyTracker variant for inline display (e.g., in lists)
 */
export function EpicJourneyTrackerCompact({
  currentStage,
  progress,
}: {
  currentStage: EpicJourneyStage
  progress: EpicProgress
}) {
  const stages = [
    EpicJourneyStage.CREATED,
    EpicJourneyStage.PLANNED,
    EpicJourneyStage.ACTIVE,
    EpicJourneyStage.CLOSE_ELIGIBLE,
    EpicJourneyStage.CLOSED,
  ]

  return (
    <div className="flex items-center gap-2">
      {/* Stage dots */}
      <div className="flex items-center gap-1">
        {stages.map((stage, index) => {
          const isCompleted = stage < currentStage
          const isCurrent = stage === currentStage
          const isCloseEligibleOrClosed =
            isCurrent &&
            (stage === EpicJourneyStage.CLOSE_ELIGIBLE || stage === EpicJourneyStage.CLOSED)
          const isActiveStage = isCurrent && stage === EpicJourneyStage.ACTIVE

          return (
            <div key={stage} className="flex items-center">
              <div
                className={cn("w-2 h-2 rounded-full", {
                  "bg-acid-green": isCompleted || isCloseEligibleOrClosed,
                  "bg-fuel-yellow": isActiveStage,
                  "bg-chrome-border":
                    isCurrent && !isActiveStage && !isCloseEligibleOrClosed,
                  "bg-chrome-border/50": stage > currentStage,
                })}
              />
              {index < stages.length - 1 && (
                <div
                  className={cn("w-2 h-px mx-0.5", {
                    "bg-acid-green": isCompleted || isCloseEligibleOrClosed,
                    "bg-chrome-border": !isCompleted && !isCloseEligibleOrClosed,
                  })}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Compact progress */}
      {progress.total > 0 && (
        <span className="text-[10px] text-ash">
          {progress.percentComplete}%
        </span>
      )}
    </div>
  )
}
