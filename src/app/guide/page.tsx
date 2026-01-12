"use client"

import { useState } from "react"
import { RefreshCw, BookOpen } from "lucide-react"
import { Panel, PanelHeader, PanelBody, ActionButton, StatusBadge, type Status } from "@/components/ui"
import { Icon, type IconName } from "@/components/ui/icon"
import { useTownStatus } from "@/hooks"
import { GuideNav, type GuideSection } from "./components/guide-nav"
import { EntityCardList, type EntityLiveData } from "./components"
import { LifecycleFlow } from "@/components/journey/lifecycle-flow"
import { glossaryCategories, glossaryTerms, type GlossaryCategory } from "./data"

// ============================================================================
// Section Definitions
// ============================================================================

const guideSections: GuideSection[] = [
  { id: "overview", label: "Overview", icon: "compass" },
  { id: "entities", label: "Entities", icon: "layers" },
  { id: "lifecycle", label: "Lifecycle", icon: "activity" },
  { id: "git", label: "Git Strategy", icon: "link" },
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
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory>("principles")
  const categoryTerms = glossaryTerms.filter(t => t.category === activeCategory)
  const activeCategoryInfo = glossaryCategories.find(c => c.id === activeCategory)

  return (
    <div className="space-y-6">
      {/* Welcome Panel */}
      <Panel>
        <PanelHeader icon="fuel" title="Welcome to Gas Town" />
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
        <PanelHeader icon="info" title="Key Concepts" />
        <PanelBody>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <Icon name="home" aria-label="" size="md" className="text-acid-green shrink-0 mt-0.5" />
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
              <Icon name="fuel" aria-label="" size="md" className="text-rust shrink-0 mt-0.5" />
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

      {/* Glossary with Category Tabs */}
      <Panel>
        <PanelHeader icon="book-open" title="Gas Town Glossary" />
        <PanelBody>
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-chrome-border/30">
            {glossaryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${
                  activeCategory === category.id
                    ? "bg-acid-green/20 text-acid-green border border-acid-green/30"
                    : "bg-carbon-black/50 text-ash border border-chrome-border/30 hover:border-bone/30"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          
          {/* Category Description */}
          {activeCategoryInfo && (
            <p className="text-sm text-ash mb-4">{activeCategoryInfo.description}</p>
          )}
          
          {/* Terms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryTerms.map(({ term, definition }) => (
              <div key={term} className="flex gap-2 p-2 rounded-sm bg-carbon-black/30">
                <span className="font-semibold text-acid-green shrink-0">{term}:</span>
                <span className="text-ash text-sm">{definition}</span>
              </div>
            ))}
          </div>
        </PanelBody>
      </Panel>

      {/* What to Expect - Expanded to 5 Steps */}
      <Panel>
        <PanelHeader icon="compass" title="What to Expect" />
        <PanelBody>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-acid-green/20 flex items-center justify-center shrink-0">
                <span className="text-acid-green text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-bone">Request Work</p>
                <p className="text-sm text-ash">Ask the <span className="text-fuel-yellow">Mayor</span> what you want built - a bug fix, feature, or improvement</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-acid-green/20 flex items-center justify-center shrink-0">
                <span className="text-acid-green text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-bone">Planning & Dispatch</p>
                <p className="text-sm text-ash">Mayor creates a spec, <span className="text-fuel-yellow">Keeper</span> evaluates scope, then work is dispatched to a <span className="text-fuel-yellow">Polecat</span></p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-acid-green/20 flex items-center justify-center shrink-0">
                <span className="text-acid-green text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-bone">Execution</p>
                <p className="text-sm text-ash">Polecat claims work from hook, implements the solution, and signals completion</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-acid-green/20 flex items-center justify-center shrink-0">
                <span className="text-acid-green text-sm font-bold">4</span>
              </div>
              <div>
                <p className="font-medium text-bone">Refinery & Merge</p>
                <p className="text-sm text-ash">The <span className="text-fuel-yellow">Refinery</span> validates, runs the merge queue, and lands the work on main</p>
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

function GitStrategySection() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Panel>
        <PanelHeader icon="link" title="Git Workflow Overview" />
        <PanelBody>
          <p className="body-text text-ash mb-4">
            Gas Town uses a <span className="text-acid-green font-semibold">worktree-based workflow</span> instead 
            of traditional feature branches. Each polecat gets its own isolated worktree, preventing branch 
            conflicts between workers.
          </p>
        </PanelBody>
      </Panel>

      {/* Visual Workflow */}
      <Panel>
        <PanelHeader icon="activity" title="Workflow Stages" />
        <PanelBody>
          <div className="flex flex-wrap items-center justify-center gap-2 py-4">
            {/* GitHub */}
            <div className="flex flex-col items-center p-3 rounded-md bg-gunmetal border-2 border-chrome-border min-w-[100px]">
              <Icon name="link" aria-label="GitHub" size="lg" className="mb-2 text-bone" />
              <span className="text-sm font-medium uppercase tracking-wider text-bone">GitHub</span>
              <span className="text-[10px] text-ash/60 mt-1">remote</span>
            </div>
            
            <Icon name="chevron-right" aria-label="" size="md" className="text-chrome-border mx-1" />
            
            {/* Rig */}
            <div className="flex flex-col items-center p-3 rounded-md bg-gunmetal border-2 border-acid-green/50 min-w-[100px]">
              <Icon name="container" aria-label="Rig" size="lg" className="mb-2 text-acid-green" />
              <span className="text-sm font-medium uppercase tracking-wider text-acid-green">Rig</span>
              <span className="text-[10px] text-ash/60 mt-1">local clone</span>
            </div>
            
            <Icon name="chevron-right" aria-label="" size="md" className="text-chrome-border mx-1" />
            
            {/* Worktrees */}
            <div className="flex flex-col items-center p-3 rounded-md bg-gunmetal border-2 border-fuel-yellow/50 min-w-[100px]">
              <Icon name="terminal" aria-label="Worktrees" size="lg" className="mb-2 text-fuel-yellow" />
              <span className="text-sm font-medium uppercase tracking-wider text-fuel-yellow">Worktrees</span>
              <span className="text-[10px] text-ash/60 mt-1">polecats</span>
            </div>
            
            <Icon name="chevron-right" aria-label="" size="md" className="text-chrome-border mx-1" />
            
            {/* Refinery */}
            <div className="flex flex-col items-center p-3 rounded-md bg-gunmetal border-2 border-rust-orange/50 min-w-[100px]">
              <Icon name="factory" aria-label="Refinery" size="lg" className="mb-2 text-rust-orange" />
              <span className="text-sm font-medium uppercase tracking-wider text-rust-orange">Refinery</span>
              <span className="text-[10px] text-ash/60 mt-1">merge queue</span>
            </div>
            
            <Icon name="chevron-right" aria-label="" size="md" className="text-chrome-border mx-1" />
            
            {/* Push */}
            <div className="flex flex-col items-center p-3 rounded-md bg-gunmetal border-2 border-acid-green min-w-[100px]">
              <Icon name="chevron-up" aria-label="Push" size="lg" className="mb-2 text-acid-green" />
              <span className="text-sm font-medium uppercase tracking-wider text-acid-green">Push</span>
              <span className="text-[10px] text-ash/60 mt-1">to remote</span>
            </div>
          </div>
        </PanelBody>
      </Panel>

      {/* Key Concepts */}
      <Panel>
        <PanelHeader icon="info" title="Key Concepts" />
        <PanelBody>
          <div className="space-y-4">
            <div className="p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="container" aria-label="" size="sm" className="text-acid-green" />
                <span className="font-semibold text-bone">Rig = Full Clone</span>
              </div>
              <p className="text-sm text-ash">
                A Rig is a full clone of your repository (not a fork). It contains a bare repo 
                (<code className="text-fuel-yellow">.repo.git</code>) that all worktrees share.
              </p>
            </div>
            <div className="p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="terminal" aria-label="" size="sm" className="text-fuel-yellow" />
                <span className="font-semibold text-bone">Isolated Worktrees</span>
              </div>
              <p className="text-sm text-ash">
                Each polecat gets its own worktree on a branch like <code className="text-fuel-yellow">polecat/name-xxx</code>. 
                Workers never conflict with each other.
              </p>
            </div>
            <div className="p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="factory" aria-label="" size="sm" className="text-rust-orange" />
                <span className="font-semibold text-bone">Refinery Handles Merges</span>
              </div>
              <p className="text-sm text-ash">
                The Refinery handles all merges to main. It rebases, resolves conflicts, and ensures 
                clean commits before merging.
              </p>
            </div>
            <div className="p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="check-circle" aria-label="" size="sm" className="text-acid-green" />
                <span className="font-semibold text-bone">Clean Main Branch</span>
              </div>
              <p className="text-sm text-ash">
                Main stays clean and linear. All work is integrated through the Refinery, 
                then pushed to the remote.
              </p>
            </div>
          </div>
        </PanelBody>
      </Panel>

      {/* Commands */}
      <Panel>
        <PanelHeader icon="terminal" title="Git Commands" />
        <PanelBody>
          <div className="space-y-3">
            <div className="p-3 rounded-sm bg-carbon-black/70 border border-chrome-border/30">
              <code className="text-fuel-yellow text-sm">gt sling ci-xxx citadel</code>
              <p className="text-xs text-ash mt-1">Dispatch work to a polecat (creates worktree if needed)</p>
            </div>
            <div className="p-3 rounded-sm bg-carbon-black/70 border border-chrome-border/30">
              <code className="text-fuel-yellow text-sm">gt done</code>
              <p className="text-xs text-ash mt-1">Signal work is ready for the merge queue</p>
            </div>
            <div className="p-3 rounded-sm bg-carbon-black/70 border border-chrome-border/30">
              <code className="text-fuel-yellow text-sm">gt mq status</code>
              <p className="text-xs text-ash mt-1">Check merge queue status</p>
            </div>
            <div className="p-3 rounded-sm bg-carbon-black/70 border border-chrome-border/30">
              <code className="text-fuel-yellow text-sm">git push</code>
              <p className="text-xs text-ash mt-1">Push merged changes to GitHub</p>
            </div>
          </div>
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
      case "git":
        return <GitStrategySection />
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
