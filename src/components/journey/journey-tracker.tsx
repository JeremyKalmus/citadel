"use client"

import { cn } from "@/lib/utils"
import {
  JourneyStage,
  type JourneyTrackerProps,
  type WorkingSubstage,
  type RefinerySubstage,
  JOURNEY_STAGE_LABELS,
  WORKING_SUBSTAGE_LABELS,
  REFINERY_SUBSTAGE_LABELS,
  formatRelativeTime,
} from "@/lib/gastown/types"

/**
 * Stage dot component - displays a single stage indicator
 */
function StageDot({
  stage,
  currentStage,
  blocked,
  timestamp,
}: {
  stage: JourneyStage
  currentStage: JourneyStage
  blocked?: boolean
  timestamp?: string
}) {
  const isCompleted = stage < currentStage
  const isCurrent = stage === currentStage
  const isPending = stage > currentStage

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Dot indicator */}
      <div
        className={cn(
          "w-3 h-3 rounded-full border-2 transition-all duration-300",
          {
            // Completed: acid-green solid
            "bg-acid-green border-acid-green": isCompleted,
            // Current: fuel-yellow with pulse (or rust-orange if blocked)
            "bg-fuel-yellow border-fuel-yellow animate-pulse": isCurrent && !blocked,
            "bg-rust-orange border-rust-orange animate-pulse": isCurrent && blocked,
            // Pending: hollow with ash border
            "bg-transparent border-ash": isPending,
          }
        )}
      />
      {/* Stage label */}
      <span
        className={cn("text-[10px] font-medium uppercase tracking-wider", {
          "text-acid-green": isCompleted,
          "text-fuel-yellow": isCurrent && !blocked,
          "text-rust-orange": isCurrent && blocked,
          "text-ash": isPending,
        })}
      >
        {JOURNEY_STAGE_LABELS[stage]}
      </span>
      {/* Timestamp */}
      <span className="text-[10px] text-ash/70">
        {timestamp ? formatRelativeTime(timestamp) : "-"}
      </span>
    </div>
  )
}

/**
 * Connector line between stages
 */
function StageConnector({
  fromStage,
  currentStage,
}: {
  fromStage: JourneyStage
  currentStage: JourneyStage
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
 * JourneyTracker Component
 *
 * Displays the work lifecycle as a horizontal progress indicator:
 * QUEUED → CLAIMED → WORKING → PR READY → REFINERY → MERGED
 *
 * Design tokens (DS2):
 * - Completed: acid-green (#27AE60)
 * - Current: fuel-yellow (#F2C94C) with pulse
 * - Pending: ash (#9AA1AC)
 * - Blocked: rust-orange (#FF7A00)
 */
export function JourneyTracker({
  issueId,
  currentStage,
  substage,
  refinerySubstage,
  timestamps,
  actor,
  blocked,
  commitCount,
}: JourneyTrackerProps) {
  const stages = [
    JourneyStage.QUEUED,
    JourneyStage.CLAIMED,
    JourneyStage.WORKING,
    JourneyStage.PR_READY,
    JourneyStage.REFINERY,
    JourneyStage.MERGED,
  ]

  // Map timestamps to stages
  const stageTimestamps: Record<JourneyStage, string | undefined> = {
    [JourneyStage.QUEUED]: timestamps.queued,
    [JourneyStage.CLAIMED]: timestamps.claimed,
    [JourneyStage.WORKING]: timestamps.workStarted,
    [JourneyStage.PR_READY]: timestamps.prOpened,
    [JourneyStage.REFINERY]: timestamps.refineryEntered,
    [JourneyStage.MERGED]: timestamps.merged,
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="section-header">Journey</span>
        {issueId && (
          <span className="text-[10px] font-mono text-ash">{issueId}</span>
        )}
      </div>

      {/* Progress bar with stages */}
      <div className="flex items-start gap-0">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-start flex-1">
            <StageDot
              stage={stage}
              currentStage={currentStage}
              blocked={blocked && stage === currentStage}
              timestamp={stageTimestamps[stage]}
            />
            {/* Connector to next stage */}
            {index < stages.length - 1 && (
              <div className="flex-1 pt-1.5 px-1">
                <StageConnector fromStage={stage} currentStage={currentStage} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Substage detail (when in WORKING stage) */}
      {currentStage === JourneyStage.WORKING && (
        <div className="mt-4 pl-4 border-l-2 border-chrome-border">
          <div className="flex items-center gap-2">
            <span className="text-fuel-yellow text-xs font-medium">
              Stage 2{substage?.slice(1)}: {substage ? WORKING_SUBSTAGE_LABELS[substage] : "Working"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-ash text-[11px]">
            {actor && <span>{actor}</span>}
            {commitCount !== undefined && commitCount > 0 && (
              <span className="text-ash/70">• {commitCount} commits</span>
            )}
          </div>
        </div>
      )}

      {/* Substage detail (when in REFINERY stage) */}
      {currentStage === JourneyStage.REFINERY && (
        <div className="mt-4 pl-4 border-l-2 border-chrome-border">
          <div className="flex items-center gap-2">
            <span className="text-fuel-yellow text-xs font-medium">
              Stage 4{refinerySubstage?.slice(1)}: {refinerySubstage ? REFINERY_SUBSTAGE_LABELS[refinerySubstage] : "Processing"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-ash text-[11px]">
            <span>refinery</span>
            {refinerySubstage === "4a" && <span className="text-ash/70">• Updating branch</span>}
            {refinerySubstage === "4b" && <span className="text-ash/70">• Running CI</span>}
            {refinerySubstage === "4c" && <span className="text-ash/70">• Merging to main</span>}
          </div>
        </div>
      )}

      {/* Blocked indicator */}
      {blocked && (
        <div className="mt-3 flex items-center gap-2 text-rust-orange text-xs">
          <span className="w-2 h-2 rounded-full bg-rust-orange animate-pulse" />
          <span>Blocked</span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact JourneyTracker variant for inline display (e.g., in lists)
 */
export function JourneyTrackerCompact({
  currentStage,
  blocked,
}: {
  currentStage: JourneyStage
  blocked?: boolean
}) {
  const stages = [
    JourneyStage.QUEUED,
    JourneyStage.CLAIMED,
    JourneyStage.WORKING,
    JourneyStage.PR_READY,
    JourneyStage.REFINERY,
    JourneyStage.MERGED,
  ]

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, index) => {
        const isCompleted = stage < currentStage
        const isCurrent = stage === currentStage

        return (
          <div key={stage} className="flex items-center">
            <div
              className={cn("w-2 h-2 rounded-full", {
                "bg-acid-green": isCompleted,
                "bg-fuel-yellow": isCurrent && !blocked,
                "bg-rust-orange": isCurrent && blocked,
                "bg-chrome-border": stage > currentStage,
              })}
            />
            {index < stages.length - 1 && (
              <div
                className={cn("w-2 h-px mx-0.5", {
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
