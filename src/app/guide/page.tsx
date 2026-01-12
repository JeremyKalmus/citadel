"use client"

import { useState } from "react"
import { RefreshCw, BookOpen } from "lucide-react"
import { Panel, PanelHeader, PanelBody, ActionButton, StatusBadge, type Status } from "@/components/ui"
import { Icon, type IconName } from "@/components/ui/icon"
import { useTownStatus } from "@/hooks"
import { GuideNav, type GuideSection } from "./components/guide-nav"
import { EntityCardList, type EntityLiveData } from "./components"
import { LifecycleFlow } from "@/components/journey/lifecycle-flow"

// ============================================================================
// Section Definitions
// ============================================================================

const guideSections: GuideSection[] = [
  { id: "overview", label: "Overview", icon: "compass" },
  { id: "entities", label: "Entities", icon: "layers" },
  { id: "lifecycle", label: "Lifecycle", icon: "activity" },
  { id: "status", label: "Status Guide", icon: "circle" },
]

// ============================================================================
// Status Reference Data
// ============================================================================

interface StatusInfo {
  status: Status
  meaning: string
  whatToDo: string
  icon: IconName
}

const statusGuide: StatusInfo[] = [
  {
    status: "active",
    meaning: "Making progress - worker is running and processing tasks",
    whatToDo: "Nothing - working normally",
    icon: "play-circle",
  },
  {
    status: "thinking",
    meaning: "Processing - agent is working on a complex operation",
    whatToDo: "Wait - agent is thinking, this may take time",
    icon: "brain",
  },
  {
    status: "slow",
    meaning: "Taking longer than expected - may be resource constrained",
    whatToDo: "Monitor - may need attention soon",
    icon: "clock",
  },
  {
    status: "unresponsive",
    meaning: "No recent activity - session exists but not responding",
    whatToDo: "Check - may be stuck, consider nudging",
    icon: "exclamation-triangle",
  },
  {
    status: "dead",
    meaning: "Session terminated - worker has stopped",
    whatToDo: "Investigate - check logs, restart if needed",
    icon: "x-circle",
  },
  {
    status: "blocked",
    meaning: "Waiting on dependency - cannot proceed until resolved",
    whatToDo: "Unblock - resolve the dependency",
    icon: "lock",
  },
  {
    status: "done",
    meaning: "Completed successfully - all tasks finished",
    whatToDo: "Nothing - celebrate!",
    icon: "check-circle",
  },
]

// ============================================================================
// Section Content Components
// ============================================================================

function OverviewSection({
  rigCount,
  polecatCount,
  convoyCount,
  loading
}: {
  rigCount: number
  polecatCount: number
  convoyCount: number
  loading: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Welcome Panel */}
      <Panel>
        <PanelHeader icon="zap" title="Welcome to Gas Town" />
        <PanelBody>
          <p className="body-text text-ash leading-relaxed">
            Gas Town is a <span className="text-acid-green font-medium">multi-agent workspace manager</span>.
            AI workers (polecats) do the coding while you orchestrate and monitor. This dashboard gives you
            visibility into what&apos;s happening across your projects—see worker status, track progress,
            and manage the flow of work from issue to merged PR.
          </p>
        </PanelBody>
      </Panel>

      {/* Key Concepts Panel */}
      <Panel>
        <PanelHeader icon="lightbulb" title="Key Concepts" />
        <PanelBody>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <Icon name="globe" aria-label="" size="md" className="text-acid-green shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-bone">Town</p>
                <p className="text-sm text-ash">Your workspace containing multiple projects (rigs). One town = one development environment.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Icon name="container" aria-label="" size="md" className="text-fuel-yellow shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-bone">Rig</p>
                <p className="text-sm text-ash">A project container with its own workers (polecats), merge queue (refinery), and health monitor (witness).</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Icon name="flame" aria-label="" size="md" className="text-rust shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-bone">GUPP — The Propulsion Principle</p>
                <p className="text-sm text-ash">&quot;If there is work on your Hook, YOU MUST RUN IT.&quot; Workers automatically execute assigned tasks. No waiting, no confirmation needed.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Icon name="activity" aria-label="" size="md" className="text-bone shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-bone">Work Flow</p>
                <p className="text-sm text-ash">Beads (issues) → Polecats (workers) → Refinery (merge queue) → Merged to main</p>
              </div>
            </div>
          </div>
        </PanelBody>
      </Panel>

      {/* Quick Start Commands Panel */}
      <Panel>
        <PanelHeader icon="terminal" title="Quick Start Commands" />
        <PanelBody>
          <div className="space-y-3 font-mono text-sm">
            <div className="p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <code className="text-fuel-yellow">bd create &quot;Fix bug in login&quot; --type=bug</code>
              <p className="text-ash text-xs mt-1">Create a new work item (bead)</p>
            </div>
            <div className="p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <code className="text-fuel-yellow">gt sling ci-xxx citadel</code>
              <p className="text-ash text-xs mt-1">Dispatch work to a worker on a rig</p>
            </div>
            <div className="p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <code className="text-fuel-yellow">bd list --status=open</code>
              <p className="text-ash text-xs mt-1">See all open work items</p>
            </div>
            <div className="p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <code className="text-fuel-yellow">gt convoy list</code>
              <p className="text-ash text-xs mt-1">See active work batches</p>
            </div>
          </div>
        </PanelBody>
      </Panel>

      {/* Your Setup Summary */}
      <Panel>
        <PanelHeader icon="home" title="Your Setup" />
        <PanelBody>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <Icon name="container" aria-label="" size="lg" className="mx-auto mb-2 text-acid-green" />
              <p className="data-value">{loading ? "..." : rigCount}</p>
              <p className="label text-ash">Rigs</p>
            </div>
            <div className="text-center p-4 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <Icon name="terminal" aria-label="" size="lg" className="mx-auto mb-2 text-fuel-yellow" />
              <p className="data-value">{loading ? "..." : polecatCount}</p>
              <p className="label text-ash">Workers</p>
            </div>
            <div className="text-center p-4 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <Icon name="truck" aria-label="" size="lg" className="mx-auto mb-2 text-bone" />
              <p className="data-value">{loading ? "..." : convoyCount}</p>
              <p className="label text-ash">Convoys</p>
            </div>
          </div>
        </PanelBody>
      </Panel>

      {/* Quick Glossary */}
      <Panel>
        <PanelHeader icon="info" title="Quick Glossary" />
        <PanelBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { term: "Rig", definition: "Container for a project (has workers, refinery, witness)" },
              { term: "Polecat", definition: "AI worker agent that executes tasks" },
              { term: "Convoy", definition: "Batch of related work traveling together" },
              { term: "Refinery", definition: "Merge queue processor for PRs" },
              { term: "Witness", definition: "Monitors worker health and lifecycle" },
              { term: "Beads", definition: "Issue tracking - each bead is a task" },
            ].map(({ term, definition }) => (
              <div key={term} className="flex gap-2 p-2 rounded-sm bg-carbon-black/30">
                <span className="font-semibold text-acid-green shrink-0">{term}:</span>
                <span className="text-ash text-sm">{definition}</span>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>

      {/* What to Expect */}
      <Panel>
        <PanelHeader icon="compass" title="What to Expect" />
        <PanelBody>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-acid-green/20 flex items-center justify-center shrink-0">
                <span className="text-acid-green text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-bone">Create work with Beads</p>
                <p className="text-sm text-ash">Use <code className="text-fuel-yellow">bd create</code> to create issues to work on</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-acid-green/20 flex items-center justify-center shrink-0">
                <span className="text-acid-green text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-bone">Dispatch to Polecats</p>
                <p className="text-sm text-ash">Use <code className="text-fuel-yellow">gt sling</code> to assign work to workers</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-acid-green/20 flex items-center justify-center shrink-0">
                <span className="text-acid-green text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-bone">Monitor Progress</p>
                <p className="text-sm text-ash">Watch the Citadel dashboard as workers implement your tasks</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-acid-green/20 flex items-center justify-center shrink-0">
                <span className="text-acid-green text-sm font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-bone">Review Results</p>
                <p className="text-sm text-ash">The refinery merges completed work—check PR status and diffs</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-acid-green/20 flex items-center justify-center shrink-0">
                <span className="text-acid-green text-sm font-bold">5</span>
              </div>
              <div>
                <p className="font-medium text-bone">Push to Remote</p>
                <p className="text-sm text-ash">Use <code className="text-fuel-yellow">git push</code> to sync merged changes to GitHub</p>
              </div>
            </div>
          </div>
        </PanelBody>
      </Panel>
    </div>
  )
}

function EntitiesSection({ liveData }: { liveData?: EntityLiveData }) {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="body-text text-ash">
          Click any entity to learn more about what it does and how it fits into Gas Town.
        </p>
      </div>
      <EntityCardList liveData={liveData} />
    </div>
  )
}

function LifecycleSection() {
  const [animated, setAnimated] = useState(false)

  return (
    <div className="space-y-6">
      <Panel>
        <PanelBody>
          <div className="flex items-center justify-between mb-4">
            <p className="body-text text-ash">
              See how work flows through Gas Town from issue creation to merge.
            </p>
            <ActionButton
              variant={animated ? "default" : "ghost"}
              size="sm"
              onClick={() => setAnimated(!animated)}
            >
              {animated ? "Stop Animation" : "Animate Flow"}
            </ActionButton>
          </div>
          <LifecycleFlow
            animated={animated}
            speed="normal"
            showSubstages
          />
        </PanelBody>
      </Panel>
    </div>
  )
}

function StatusSection() {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="body-text text-ash">
          Reference guide for all worker status states. Status colors are paired with icons for accessibility.
        </p>
      </div>

      <div className="grid gap-3">
        {statusGuide.map(({ status, meaning, whatToDo, icon }) => (
          <Panel key={status}>
            <PanelBody className="py-3">
              <div className="flex items-start gap-4">
                {/* Status badge */}
                <div className="shrink-0">
                  <StatusBadge status={status} size="md" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name={icon} aria-label="" size="sm" variant="muted" />
                    <span className="font-medium text-bone capitalize">{status}</span>
                  </div>
                  <p className="text-sm text-ash mb-2">{meaning}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-ash">Action:</span>
                    <span className="text-bone">{whatToDo}</span>
                  </div>
                </div>
              </div>
            </PanelBody>
          </Panel>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Main Guide Page
// ============================================================================

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState("overview")
  const { data: status, isLoading, refresh } = useTownStatus({ refreshInterval: 60000 })

  // Compute live data for entity cards
  const entityLiveData: EntityLiveData = {
    town: {
      rigCount: status?.rigs.length ?? 0,
      totalPolecats: status?.rigs.reduce((sum, r) => sum + (r.polecat_count ?? 0), 0) ?? 0,
      activeConvoys: 0, // Would need convoy data
    },
    // Additional entity data would come from their respective hooks
  }

  const rigCount = status?.rigs.length ?? 0
  const polecatCount = status?.rigs.reduce((sum, r) => sum + (r.polecat_count ?? 0), 0) ?? 0
  const convoyCount = 0 // Would need convoy hook

  // Render the active section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <OverviewSection
            rigCount={rigCount}
            polecatCount={polecatCount}
            convoyCount={convoyCount}
            loading={isLoading}
          />
        )
      case "entities":
        return <EntitiesSection liveData={entityLiveData} />
      case "lifecycle":
        return <LifecycleSection />
      case "status":
        return <StatusSection />
      default:
        return <OverviewSection rigCount={rigCount} polecatCount={polecatCount} convoyCount={convoyCount} loading={isLoading} />
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-bone flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-acid-green hidden sm:block" />
            <span>Operations Manual</span>
          </h1>
          <p className="body-text-muted mt-1 hidden sm:block">
            Gas Town Field Guide
          </p>
        </div>
        <ActionButton
          variant="ghost"
          onClick={() => refresh()}
          loading={isLoading}
          icon={<RefreshCw className="w-4 h-4" />}
          className="shrink-0"
        >
          <span className="hidden sm:inline">Refresh</span>
        </ActionButton>
      </div>

      {/* Main content with sidebar layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar navigation */}
        <aside className="lg:w-56 shrink-0">
          <Panel className="lg:sticky lg:top-4">
            <PanelBody className="p-2">
              <GuideNav
                sections={guideSections}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </PanelBody>
          </Panel>
        </aside>

        {/* Main content area */}
        <main className="flex-1 min-w-0">
          {/* Section header */}
          <div className="mb-6">
            <h2 className="section-header mb-2">
              {guideSections.find(s => s.id === activeSection)?.label ?? "Overview"}
            </h2>
          </div>

          {/* Section content */}
          {renderSectionContent()}
        </main>
      </div>
    </div>
  )
}
