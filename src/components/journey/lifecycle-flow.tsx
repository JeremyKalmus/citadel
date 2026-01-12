"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/components/ui/icon"
import { type WorkingSubstage } from "@/lib/gastown/types"

// ============================================================================
// Types
// ============================================================================

/**
 * Stage definition for lifecycle visualization
 */
export interface StageDefinition {
  id: string
  label: string
  description: string
  icon: IconName
  actors: string[]
}

/**
 * Props for LifecycleFlow component
 */
export interface LifecycleFlowProps {
  /** Stage definitions (uses defaults if not provided) */
  stages?: StageDefinition[]
  /** Currently highlighted stage (0-4) */
  currentStage?: number
  /** Enable animation */
  animated?: boolean
  /** Animation speed */
  speed?: "slow" | "normal" | "fast"
  /** Show substages for Working stage */
  showSubstages?: boolean
  /** Callback when stage is clicked */
  onStageClick?: (stage: number) => void
  /** Optional className */
  className?: string
}

// ============================================================================
// Default Stage Definitions
// ============================================================================

const DEFAULT_STAGES: StageDefinition[] = [
  {
    id: "request",
    label: "Request",
    description: "User asks Mayor for work",
    icon: "message-circle",
    actors: ["user", "mayor"],
  },
  {
    id: "planning",
    label: "Planning",
    description: "Mayor creates spec, evaluates with Keeper",
    icon: "clipboard",
    actors: ["mayor", "keeper"],
  },
  {
    id: "dispatched",
    label: "Dispatched",
    description: "Mayor slings work to polecat",
    icon: "send",
    actors: ["mayor", "convoy"],
  },
  {
    id: "queued",
    label: "Queued",
    description: "Issue created, waiting for assignment",
    icon: "clock",
    actors: ["beads"],
  },
  {
    id: "claimed",
    label: "Claimed",
    description: "Polecat finds work on hook, begins execution",
    icon: "lock",
    actors: ["witness"],
  },
  {
    id: "working",
    label: "Working",
    description: "Active implementation in progress",
    icon: "terminal",
    actors: ["polecat"],
  },
  {
    id: "pr",
    label: "PR Ready",
    description: "Pull request submitted, awaiting review",
    icon: "activity",
    actors: ["polecat"],
  },
  {
    id: "refinery",
    label: "Refinery",
    description: "Merge queue processing and validation",
    icon: "filter",
    actors: ["refinery"],
  },
  {
    id: "merged",
    label: "Merged",
    description: "Work complete, merged to main",
    icon: "check-circle",
    actors: ["refinery"],
  },
]

const SUBSTAGES: { id: WorkingSubstage; label: string; description: string }[] = [
  { id: "2a", label: "Analyzing", description: "Reading and understanding codebase" },
  { id: "2b", label: "Coding", description: "Writing and committing code" },
  { id: "2c", label: "Testing", description: "Running tests and validation" },
  { id: "2d", label: "PR Prep", description: "Preparing pull request" },
]

/** Visual index of the WORKING stage in the 9-stage flow */
const WORKING_STAGE_INDEX = 5

// ============================================================================
// Animation Timing
// ============================================================================

const SPEED_TIMINGS = {
  slow: 3000,
  normal: 1500,
  fast: 750,
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Animated arrow connector between stages
 */
function StageConnector({
  isAnimating,
  isCompleted,
  animationDelay,
  speed,
}: {
  isAnimating: boolean
  isCompleted: boolean
  animationDelay: number
  speed: "slow" | "normal" | "fast"
}) {
  const duration = SPEED_TIMINGS[speed]

  return (
    <div className="flex items-center mx-2 relative">
      {/* Base line */}
      <div className="w-8 h-0.5 bg-chrome-border relative overflow-hidden">
        {/* Animated fill */}
        {isAnimating && (
          <div
            className="absolute inset-y-0 left-0 bg-acid-green"
            style={{
              animation: `flowFill ${duration}ms ease-in-out forwards`,
              animationDelay: `${animationDelay}ms`,
            }}
          />
        )}
        {isCompleted && <div className="absolute inset-0 bg-acid-green" />}
      </div>
      {/* Arrow head */}
      <svg
        className={cn("w-2 h-2 -ml-0.5", {
          "text-chrome-border": !isCompleted && !isAnimating,
          "text-acid-green": isCompleted,
        })}
        viewBox="0 0 8 8"
        fill="currentColor"
      >
        <path d="M0 0 L8 4 L0 8 Z" />
      </svg>
    </div>
  )
}

/**
 * Single stage box component
 */
function StageBox({
  stage,
  index,
  currentStage,
  isAnimating,
  animationDelay,
  speed,
  onClick,
}: {
  stage: StageDefinition
  index: number
  currentStage?: number
  isAnimating: boolean
  animationDelay: number
  speed: "slow" | "normal" | "fast"
  onClick?: () => void
}) {
  const [isActive, setIsActive] = useState(false)
  const duration = SPEED_TIMINGS[speed]

  const isCompleted = currentStage !== undefined && index < currentStage
  const isCurrent = currentStage !== undefined && index === currentStage
  const isPending = currentStage === undefined || index > currentStage

  // Handle animation activation
  useEffect(() => {
    if (!isAnimating) {
      setIsActive(false)
      return
    }

    const timer = setTimeout(() => {
      setIsActive(true)
    }, animationDelay)

    // Deactivate after animation completes (except for final stage)
    const deactivateTimer = setTimeout(
      () => {
        if (index < 8) setIsActive(false)
      },
      animationDelay + duration
    )

    return () => {
      clearTimeout(timer)
      clearTimeout(deactivateTimer)
    }
  }, [isAnimating, animationDelay, duration, index])

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group relative flex flex-col items-center p-3 rounded-md border-2 transition-all duration-300",
        "min-w-[100px] focus:outline-none focus:ring-2 focus:ring-fuel-yellow/50",
        {
          // Completed state
          "bg-acid-green/10 border-acid-green": isCompleted,
          // Current state
          "bg-fuel-yellow/10 border-fuel-yellow": isCurrent,
          // Animating state
          "bg-fuel-yellow/20 border-fuel-yellow scale-105": isActive,
          // Pending state
          "bg-gunmetal border-chrome-border": isPending && !isActive,
          // Interactive
          "cursor-pointer hover:border-bone/50": !!onClick,
        }
      )}
    >
      {/* Icon */}
      <Icon
        name={stage.icon}
        aria-label={stage.label}
        size="lg"
        className={cn("mb-2 transition-colors", {
          "text-acid-green": isCompleted,
          "text-fuel-yellow": isCurrent || isActive,
          "text-ash": isPending && !isActive,
        })}
      />

      {/* Label */}
      <span
        className={cn("text-sm font-medium uppercase tracking-wider", {
          "text-acid-green": isCompleted,
          "text-fuel-yellow": isCurrent || isActive,
          "text-ash": isPending && !isActive,
        })}
      >
        {stage.label}
      </span>

      {/* Actor tag */}
      <span className="text-[10px] text-ash/60 mt-1">
        {stage.actors.join(", ")}
      </span>

      {/* Pulse ring for current/active */}
      {(isCurrent || isActive) && (
        <div className="absolute inset-0 rounded-md border-2 border-fuel-yellow animate-ping opacity-30" />
      )}
    </button>
  )
}

/**
 * Working substages expansion
 */
function SubstagesPanel({
  expanded,
  currentSubstage,
  onSubstageClick,
}: {
  expanded: boolean
  currentSubstage?: WorkingSubstage
  onSubstageClick?: (substage: WorkingSubstage) => void
}) {
  if (!expanded) return null

  return (
    <div className="mt-4 ml-[calc(50%-8px)] pl-4 border-l-2 border-chrome-border">
      <div className="text-[10px] uppercase tracking-wider text-ash mb-3">
        Working Substages
      </div>
      <div className="grid grid-cols-2 gap-2 max-w-[320px]">
        {SUBSTAGES.map((substage, index) => {
          const isCurrent = currentSubstage === substage.id
          const isCompleted =
            currentSubstage &&
            SUBSTAGES.findIndex((s) => s.id === currentSubstage) > index

          return (
            <button
              key={substage.id}
              onClick={() => onSubstageClick?.(substage.id)}
              className={cn(
                "p-2 rounded-sm border text-left transition-all",
                "focus:outline-none focus:ring-2 focus:ring-fuel-yellow/50",
                {
                  "bg-acid-green/10 border-acid-green/30": isCompleted,
                  "bg-fuel-yellow/10 border-fuel-yellow/30": isCurrent,
                  "bg-gunmetal border-chrome-border hover:border-bone/30":
                    !isCompleted && !isCurrent,
                }
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                    {
                      "bg-acid-green text-carbon-black": isCompleted,
                      "bg-fuel-yellow text-carbon-black": isCurrent,
                      "bg-chrome-border text-ash": !isCompleted && !isCurrent,
                    }
                  )}
                >
                  {substage.id}
                </span>
                <span
                  className={cn("text-xs font-medium", {
                    "text-acid-green": isCompleted,
                    "text-fuel-yellow": isCurrent,
                    "text-bone": !isCompleted && !isCurrent,
                  })}
                >
                  {substage.label}
                </span>
              </div>
              <p className="text-[10px] text-ash/70 mt-1 ml-7">
                {substage.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * LifecycleFlow Component
 *
 * Animated visualization showing work flow through 9 stages:
 * REQUEST → PLANNING → DISPATCHED → QUEUED → CLAIMED → WORKING → PR_READY → REFINERY → MERGED
 *
 * Used in the Guide tab to explain how work moves through Gas Town.
 *
 * Features:
 * - Animated flow with configurable speed
 * - Substage expansion for Working stage
 * - Interactive stage selection
 * - DS2 color system integration
 *
 * @example
 * ```tsx
 * // Auto-animating flow
 * <LifecycleFlow animated speed="normal" />
 *
 * // Static with current stage highlighted
 * <LifecycleFlow currentStage={5} showSubstages />
 *
 * // Interactive with click handler
 * <LifecycleFlow onStageClick={(stage) => console.log(stage)} />
 * ```
 */
export function LifecycleFlow({
  stages = DEFAULT_STAGES,
  currentStage,
  animated = false,
  speed = "normal",
  showSubstages = false,
  onStageClick,
  className,
}: LifecycleFlowProps) {
  const [animationCycle, setAnimationCycle] = useState(0)
  const duration = SPEED_TIMINGS[speed]

  // Auto-restart animation loop
  useEffect(() => {
    if (!animated) return

    const totalDuration = duration * stages.length + 1000 // Extra pause at end
    const interval = setInterval(() => {
      setAnimationCycle((c) => c + 1)
    }, totalDuration)

    return () => clearInterval(interval)
  }, [animated, duration, stages.length])

  // Show substages when Working stage is current (index 5 in 9-stage flow)
  const showWorkingSubstages =
    showSubstages && (currentStage === WORKING_STAGE_INDEX || currentStage === undefined)

  return (
    <div className={cn("w-full", className)}>
      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes flowFill {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="section-header">Work Lifecycle</span>
        {animated && (
          <span className="text-[10px] uppercase tracking-wider text-fuel-yellow bg-fuel-yellow/10 px-2 py-0.5 rounded">
            Animating
          </span>
        )}
      </div>

      {/* Main flow - key includes animationCycle to reset animations on each loop */}
      <div key={animationCycle} className="flex items-center justify-center flex-wrap gap-y-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            <StageBox
              stage={stage}
              index={index}
              currentStage={currentStage}
              isAnimating={animated}
              animationDelay={index * duration}
              speed={speed}
              onClick={onStageClick ? () => onStageClick(index) : undefined}
            />
            {index < stages.length - 1 && (
              <StageConnector
                isAnimating={animated}
                isCompleted={currentStage !== undefined && index < currentStage}
                animationDelay={index * duration + duration / 2}
                speed={speed}
              />
            )}
          </div>
        ))}
      </div>

      {/* Substages panel */}
      <SubstagesPanel
        expanded={showWorkingSubstages}
        currentSubstage={undefined}
      />

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-chrome-border/50">
        <div className="text-[10px] uppercase tracking-wider text-ash mb-2">
          Stage Actors
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-bone/50" />
            <span className="text-ash">user</span>
            <span className="text-ash/50">- Human operator</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-fuel-yellow/50" />
            <span className="text-ash">mayor</span>
            <span className="text-ash/50">- Work orchestrator</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rust-orange/50" />
            <span className="text-ash">keeper</span>
            <span className="text-ash/50">- Scope gatekeeper</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-chrome-border" />
            <span className="text-ash">convoy</span>
            <span className="text-ash/50">- Work transport</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-ash/50" />
            <span className="text-ash">beads</span>
            <span className="text-ash/50">- Issue tracking</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-fuel-yellow/50" />
            <span className="text-ash">witness</span>
            <span className="text-ash/50">- Worker lifecycle</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-acid-green/50" />
            <span className="text-ash">polecat</span>
            <span className="text-ash/50">- AI worker</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rust-orange/50" />
            <span className="text-ash">refinery</span>
            <span className="text-ash/50">- Merge queue</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact LifecycleFlow for smaller spaces
 */
export function LifecycleFlowCompact({
  currentStage,
  className,
}: {
  currentStage?: number
  className?: string
}) {
  const stages = ["R", "P", "D", "Q", "C", "W", "PR", "RF", "M"]
  const labels = ["Request", "Planning", "Dispatched", "Queued", "Claimed", "Working", "PR Ready", "Refinery", "Merged"]

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stages.map((label, index) => {
        const isCompleted = currentStage !== undefined && index < currentStage
        const isCurrent = currentStage !== undefined && index === currentStage

        return (
          <div key={label} className="flex items-center">
            <div
              className={cn(
                "w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-bold",
                {
                  "bg-acid-green/20 text-acid-green": isCompleted,
                  "bg-fuel-yellow/20 text-fuel-yellow": isCurrent,
                  "bg-chrome-border/50 text-ash/50": !isCompleted && !isCurrent,
                }
              )}
              title={labels[index]}
            >
              {label}
            </div>
            {index < stages.length - 1 && (
              <svg
                className={cn("w-3 h-3 mx-0.5", {
                  "text-acid-green": isCompleted,
                  "text-chrome-border": !isCompleted,
                })}
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path d="M4 3 L8 6 L4 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}
