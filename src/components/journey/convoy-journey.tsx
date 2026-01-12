"use client"

import { cn } from "@/lib/utils"
import { Gauge, GaugeCompact } from "@/components/ui"
import {
  JourneyStage,
  type ConvoyJourneyState,
  type JourneyIssue,
  JOURNEY_STAGE_LABELS,
  formatDuration,
} from "@/lib/gastown/types"
import { JourneyTrackerCompact } from "./journey-tracker"

/**
 * Stage distribution grid showing count at each stage
 */
function StageDistribution({
  distribution,
}: {
  distribution: Record<JourneyStage, number>
}) {
  const stages = [
    JourneyStage.QUEUED,
    JourneyStage.CLAIMED,
    JourneyStage.WORKING,
    JourneyStage.PR_READY,
    JourneyStage.MERGED,
  ]

  return (
    <div className="grid grid-cols-5 gap-1">
      {stages.map((stage) => {
        const count = distribution[stage] || 0
        const isActive = count > 0

        return (
          <div
            key={stage}
            className={cn(
              "flex flex-col items-center p-2 rounded-sm border",
              {
                "bg-gunmetal border-chrome-border": !isActive,
                "bg-acid-green/10 border-acid-green/30": isActive && stage === JourneyStage.MERGED,
                "bg-fuel-yellow/10 border-fuel-yellow/30": isActive && stage === JourneyStage.WORKING,
                "bg-ash/10 border-ash/30": isActive && stage !== JourneyStage.MERGED && stage !== JourneyStage.WORKING,
              }
            )}
          >
            <span
              className={cn("text-[10px] uppercase tracking-wider mb-1", {
                "text-ash": !isActive,
                "text-acid-green": isActive && stage === JourneyStage.MERGED,
                "text-fuel-yellow": isActive && stage === JourneyStage.WORKING,
                "text-bone": isActive && stage !== JourneyStage.MERGED && stage !== JourneyStage.WORKING,
              })}
            >
              {JOURNEY_STAGE_LABELS[stage]}
            </span>
            <span
              className={cn("text-lg font-bold tabular-nums", {
                "text-ash/50": !isActive,
                "text-acid-green": isActive && stage === JourneyStage.MERGED,
                "text-fuel-yellow": isActive && stage === JourneyStage.WORKING,
                "text-bone": isActive && stage !== JourneyStage.MERGED && stage !== JourneyStage.WORKING,
              })}
            >
              {count}
            </span>
            {/* Dot indicators for visual representation */}
            <div className="flex flex-wrap justify-center gap-0.5 mt-1 max-w-[60px]">
              {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
                <div
                  key={i}
                  className={cn("w-1.5 h-1.5 rounded-full", {
                    "bg-ash/30": stage < JourneyStage.WORKING,
                    "bg-fuel-yellow": stage === JourneyStage.WORKING,
                    "bg-acid-green": stage >= JourneyStage.PR_READY,
                  })}
                />
              ))}
              {count > 10 && (
                <span className="text-[8px] text-ash">+{count - 10}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Individual issue row in the convoy list
 */
function IssueRow({ issue }: { issue: JourneyIssue }) {
  const stage = issue.journey.currentStage
  const isMerged = stage === JourneyStage.MERGED
  const isWorking = stage === JourneyStage.WORKING

  return (
    <div className="flex items-center gap-4 py-2 px-3 rounded-sm hover:bg-gunmetal/50 transition-colors">
      {/* Issue ID */}
      <span className="font-mono text-xs text-ash w-20 shrink-0">
        {issue.id}
      </span>

      {/* Title */}
      <span className="flex-1 text-sm text-bone truncate">
        {issue.title}
      </span>

      {/* Journey indicator */}
      <JourneyTrackerCompact
        currentStage={stage}
        blocked={issue.journey.blocked}
      />

      {/* Status */}
      <span
        className={cn("text-xs font-medium w-20 text-right", {
          "text-acid-green": isMerged,
          "text-fuel-yellow": isWorking,
          "text-ash": !isMerged && !isWorking,
        })}
      >
        {JOURNEY_STAGE_LABELS[stage]}
      </span>

      {/* Worker (if assigned) */}
      <span className="text-xs text-ash w-28 truncate text-right">
        {issue.worker || "-"}
      </span>

      {/* Duration */}
      <span className="text-xs text-ash/70 w-16 text-right tabular-nums">
        {issue.totalTimeMinutes
          ? formatDuration(
              new Date(Date.now() - issue.totalTimeMinutes * 60000).toISOString()
            )
          : "-"}
      </span>
    </div>
  )
}

export interface ConvoyJourneyProps {
  /** Convoy journey state data */
  convoy: ConvoyJourneyState
  /** Whether to show the issue list */
  showIssueList?: boolean
  /** Maximum issues to show in list (default: 10) */
  maxIssues?: number
  /** Optional className */
  className?: string
}

/**
 * ConvoyJourney Component
 *
 * Aggregate journey view for a convoy showing:
 * - Progress bar with completion percentage
 * - Stage distribution grid
 * - Optional issue list with journey status
 *
 * Design follows spec section 1.5 ConvoyJourney visualization.
 */
export function ConvoyJourney({
  convoy,
  showIssueList = true,
  maxIssues = 10,
  className,
}: ConvoyJourneyProps) {
  const displayIssues = convoy.issues.slice(0, maxIssues)
  const hasMoreIssues = convoy.issues.length > maxIssues

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with convoy info */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-bone">{convoy.title}</h3>
          <span className="text-xs font-mono text-ash">{convoy.convoyId}</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-bone tabular-nums">
            {convoy.completedCount}
          </span>
          <span className="text-lg text-ash">/{convoy.issueCount}</span>
          <p className="text-xs text-ash">issues completed</p>
        </div>
      </div>

      {/* Progress gauge */}
      <Gauge value={convoy.progressPercent} size="md" />

      {/* Stage distribution */}
      <div>
        <p className="section-header mb-2">By Stage</p>
        <StageDistribution distribution={convoy.stageDistribution} />
      </div>

      {/* Issue list */}
      {showIssueList && convoy.issues.length > 0 && (
        <div>
          <p className="section-header mb-2">Issues</p>
          <div className="border border-chrome-border rounded-sm divide-y divide-chrome-border/50">
            {displayIssues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
          {hasMoreIssues && (
            <p className="text-xs text-ash mt-2 text-center">
              +{convoy.issues.length - maxIssues} more issues
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact convoy journey view for list displays
 */
export function ConvoyJourneyCompact({
  convoy,
  className,
}: {
  convoy: ConvoyJourneyState
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Progress gauge */}
      <div className="w-24">
        <GaugeCompact value={convoy.progressPercent} />
      </div>

      {/* Fraction */}
      <span className="text-xs text-ash tabular-nums">
        {convoy.completedCount}/{convoy.issueCount}
      </span>

      {/* Mini stage indicators */}
      <div className="flex gap-1">
        {[
          JourneyStage.QUEUED,
          JourneyStage.CLAIMED,
          JourneyStage.WORKING,
          JourneyStage.PR_READY,
          JourneyStage.MERGED,
        ].map((stage) => {
          const count = convoy.stageDistribution[stage] || 0
          if (count === 0) return null
          return (
            <span
              key={stage}
              className={cn("text-[10px] px-1 rounded", {
                "bg-ash/20 text-ash": stage < JourneyStage.WORKING,
                "bg-fuel-yellow/20 text-fuel-yellow": stage === JourneyStage.WORKING,
                "bg-acid-green/20 text-acid-green": stage >= JourneyStage.PR_READY,
              })}
            >
              {count}
            </span>
          )
        })}
      </div>
    </div>
  )
}
