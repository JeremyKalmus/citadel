# Citadel UI/UX Enhancement Spec: Journey Visibility & Insights

> **Purpose**: Spec for mayor to dispatch to polecats via beads
> **Status**: DRAFT - Awaiting approval
> **Created**: 2026-01-09

---

## Executive Summary

Enhance Citadel dashboard to provide:
1. **Journey Visualization** - Clear stage-by-stage view of work lifecycle
2. **Cost Transparency** - Per-worker, per-convoy token usage with drill-down
3. **Git Diff Viewer** - Code changes per worker with inline diff display

---

## Current State Assessment

| Area | Current State | Gap |
|------|--------------|-----|
| Journey | Basic status badges (7 states) | No stage progression view |
| Cost | Aggregate guzzoline stats | No per-entity breakdown |
| Git Diffs | Not implemented | Icons ready, no viewer |
| Phase | ~70% Phase 1 complete | Phases 2-5 pending |

---

## Part 1: Journey Visualization

### 1.1 The Journey Model

Every piece of work follows this lifecycle:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WORK LIFECYCLE STAGES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐       │
│  │ QUEUED  │ → │ CLAIMED │ → │ WORKING │ → │   PR    │ → │ MERGED  │       │
│  │         │   │         │   │         │   │         │   │         │       │
│  │ beads   │   │ witness │   │ polecat │   │refinery │   │refinery │       │
│  │ issue   │   │ assigns │   │ coding  │   │ review  │   │ merged  │       │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘       │
│       │             │             │             │             │             │
│    Stage 0       Stage 1       Stage 2       Stage 3       Stage 4         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Stage Definitions

| Stage | Name | Actor | Signals | Duration Concern |
|-------|------|-------|---------|------------------|
| 0 | **Queued** | beads | Issue created, not assigned | Normal: < 5min |
| 1 | **Claimed** | witness | Polecat spawned, branch created | Normal: < 2min |
| 2 | **Working** | polecat | Active development (substages below) | Varies by complexity |
| 3 | **PR Ready** | refinery | PR opened, tests running | Normal: < 15min |
| 4 | **Merged** | refinery | PR merged to main | Terminal state |

### 1.3 Working Stage Substages (Stage 2 Detail)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 2: WORKING (Expanded)                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  2a. ANALYZING    2b. CODING      2c. TESTING     2d. PR PREP              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Reading  │ →  │ Writing  │ →  │ Running  │ →  │ Creating │             │
│  │ codebase │    │ code     │    │ tests    │    │ PR       │             │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘             │
│                                                                             │
│  Detected by:    Detected by:    Detected by:    Detected by:             │
│  - Read ops      - Write ops     - test commands - git push                │
│  - Grep/Glob     - Commits       - CI activity   - PR API call             │
│  - No writes     - File changes  - Output parse  - PR exists               │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### 1.4 UI Component: JourneyTracker

**File**: `src/components/journey/journey-tracker.tsx`

```tsx
interface JourneyTrackerProps {
  issueId: string
  currentStage: 0 | 1 | 2 | 3 | 4
  substage?: '2a' | '2b' | '2c' | '2d'
  timestamps: {
    queued?: string
    claimed?: string
    workStarted?: string
    prOpened?: string
    merged?: string
  }
  actor?: string // Current actor (polecat name, etc.)
}
```

**Visual Design**:
```
┌────────────────────────────────────────────────────────────────┐
│  JOURNEY                                                        │
│                                                                 │
│  ●━━━━━━━●━━━━━━━●━━━━━━━○━━━━━━━○                              │
│  Queued  Claimed  Working   PR    Merged                        │
│  2m ago  1m ago   NOW       -      -                            │
│                     │                                           │
│                     └─ Stage 2b: Coding                         │
│                        polecat-alpha • 12 commits               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Colors** (from DS2):
- Completed stages: `acid-green` (#27AE60)
- Current stage: `fuel-yellow` (#F2C94C) with pulse animation
- Pending stages: `ash` (#9AA1AC)
- Blocked: `rust-orange` (#FF7A00)

### 1.5 UI Component: ConvoyJourney

Aggregate journey view for a convoy showing all issues:

```
┌─────────────────────────────────────────────────────────────────┐
│  CONVOY: Q4 Features (hq-cv-abc123)                             │
│  Progress: ████████░░░░░░░░░░░░ 40% (4/10 issues)               │
│                                                                  │
│  BY STAGE:                                                       │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐            │
│  │ Queued  │ Claimed │ Working │   PR    │ Merged  │            │
│  │    2    │    0    │    3    │    1    │    4    │            │
│  │  ○ ○    │         │ ● ● ●   │   ●     │ ✓✓✓✓    │            │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘            │
│                                                                  │
│  ISSUES:                                                         │
│  gt-123  Add login     ✓ Merged    2h 15m total                 │
│  gt-124  Add logout    ● Working   polecat-alpha  45m           │
│  gt-125  Add settings  ● Working   polecat-beta   22m           │
│  gt-126  Add profile   ○ Queued    -              -             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Cost/Token Tracking Enhancements

### 2.1 Current Guzzoline Model

```typescript
// Current: Aggregate only
interface GuzzolineStats {
  total_tokens_today: number
  total_tokens_week: number
  by_agent_type: { polecat, witness, refinery, mayor }
  recent_sessions: TokenUsage[]
}
```

### 2.2 Enhanced Cost Model

```typescript
// Enhanced: Per-entity breakdown with hierarchy
interface EnhancedGuzzolineStats extends GuzzolineStats {
  // NEW: Per-issue cost
  by_issue: Map<string, IssueCost>

  // NEW: Per-convoy cost
  by_convoy: Map<string, ConvoyCost>

  // NEW: Per-worker cost (already partial in recent_sessions)
  by_worker: Map<string, WorkerCost>

  // NEW: Cost over time (for charts)
  hourly_usage: HourlyUsage[]
}

interface IssueCost {
  issue_id: string
  total_tokens: number
  input_tokens: number
  output_tokens: number
  cache_read_tokens: number
  estimated_cost_usd: number
  workers_involved: string[]
  duration_minutes: number
  tokens_per_minute: number // efficiency metric
}

interface ConvoyCost {
  convoy_id: string
  total_tokens: number
  estimated_cost_usd: number
  issue_count: number
  avg_cost_per_issue: number
  issues: IssueCost[]
}

interface WorkerCost {
  worker_name: string
  rig: string
  total_tokens: number
  estimated_cost_usd: number
  issues_worked: string[]
  efficiency_score: number // tokens per issue completed
  session_count: number
}

interface HourlyUsage {
  hour: string // ISO timestamp
  tokens: number
  cost_usd: number
  active_workers: number
}
```

### 2.3 Cost Calculation Constants

```typescript
// Token pricing (Anthropic Claude 3.5 Sonnet pricing as baseline)
const TOKEN_PRICING = {
  input_per_million: 3.00,   // $3 per 1M input tokens
  output_per_million: 15.00, // $15 per 1M output tokens
  cache_read_per_million: 0.30, // $0.30 per 1M cache read
}

function calculateCost(usage: TokenUsage): number {
  return (
    (usage.input * TOKEN_PRICING.input_per_million / 1_000_000) +
    (usage.output * TOKEN_PRICING.output_per_million / 1_000_000) +
    (usage.cache_read * TOKEN_PRICING.cache_read_per_million / 1_000_000)
  )
}
```

### 2.4 UI Component: CostPanel

**File**: `src/components/cost/cost-panel.tsx`

```
┌─────────────────────────────────────────────────────────────────┐
│  GUZZOLINE (Token Usage)                            [Today ▼]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TOTAL TODAY                     ESTIMATED COST                  │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │     2.4M tokens     │        │       $12.50        │         │
│  │  ▲ 15% vs yesterday │        │   $0.87 avg/issue   │         │
│  └─────────────────────┘        └─────────────────────┘         │
│                                                                  │
│  BY ENTITY TYPE                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Polecats     ████████████████████░░░░░░░░░░  1.8M  $9.20   │ │
│  │ Witness      ████░░░░░░░░░░░░░░░░░░░░░░░░░░  320k  $1.60   │ │
│  │ Refinery     ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░  180k  $0.90   │ │
│  │ Mayor        █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  100k  $0.80   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  TOP CONSUMERS (Issues)                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. gt-456 "Complex refactor"      450k tokens   $2.25      │ │
│  │ 2. gt-789 "API migration"         320k tokens   $1.60      │ │
│  │ 3. gt-123 "Add authentication"    280k tokens   $1.40      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [View by Worker] [View by Convoy] [View Hourly Chart]          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 UI Component: CostSparkline

Inline cost indicator for any entity:

```tsx
interface CostSparklineProps {
  tokens: number
  costUsd: number
  trend?: 'up' | 'down' | 'flat'
  size?: 'sm' | 'md' | 'lg'
}

// Usage in worker card:
// <CostSparkline tokens={450000} costUsd={2.25} trend="up" />
// Renders: "450k • $2.25 ▲"
```

### 2.6 API Endpoint: Enhanced Guzzoline

```typescript
// GET /api/gastown/guzzoline?breakdown=issue,convoy,worker&period=today
interface GuzzolineQueryParams {
  breakdown?: ('issue' | 'convoy' | 'worker')[]
  period?: 'today' | 'week' | 'month' | 'all'
  rig?: string // Filter by rig
  convoy?: string // Filter by convoy
}
```

---

## Part 3: Git Diff Viewer

### 3.1 Requirements

1. Show commits made by each worker
2. Display inline diffs with syntax highlighting
3. Aggregate changes per issue/PR
4. Support file-by-file navigation

### 3.2 Data Model

```typescript
interface WorkerGitActivity {
  worker: string
  branch: string
  commits: Commit[]
  total_additions: number
  total_deletions: number
  files_changed: string[]
}

interface Commit {
  sha: string
  message: string
  timestamp: string
  author: string
  stats: {
    additions: number
    deletions: number
    files_changed: number
  }
  files: FileChange[]
}

interface FileChange {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed'
  additions: number
  deletions: number
  patch?: string // Unified diff format
}
```

### 3.3 Data Source

Git activity should be parsed from:
1. **Worker branch**: `polecat/<name>-<timestamp>`
2. **Compare with**: Base branch (usually `main`)
3. **Source**: `git log --oneline --stat` and `git diff`

```typescript
// GasTownClient method
async getWorkerGitActivity(worker: string): Promise<WorkerGitActivity> {
  const branch = await this.getWorkerBranch(worker)
  const baseRef = 'main'

  // Get commits on this branch not on main
  const commits = await execAsync(
    `git log ${baseRef}..${branch} --format='%H|%s|%aI|%an' --stat`
  )

  // Get full diff
  const diff = await execAsync(`git diff ${baseRef}...${branch}`)

  return parseGitActivity(commits, diff)
}
```

### 3.4 UI Component: DiffViewer

**File**: `src/components/git/diff-viewer.tsx`

```
┌─────────────────────────────────────────────────────────────────┐
│  GIT CHANGES                                      polecat-alpha │
│  Branch: polecat/alpha-1704567890                               │
│  Base: main • 12 commits • +456 / -89 lines                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FILES CHANGED (7)                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ▶ src/components/auth/login.tsx        +120 -10   Modified │ │
│  │ ▶ src/components/auth/logout.tsx       +85  -0    Added    │ │
│  │ ▼ src/lib/auth.ts                      +45  -12   Modified │ │
│  │   ┌──────────────────────────────────────────────────────┐ │ │
│  │   │ @@ -23,6 +23,18 @@ export async function logout() {  │ │ │
│  │   │   const session = getSession()                        │ │ │
│  │   │ + if (!session) {                                     │ │ │
│  │   │ +   throw new AuthError('No active session')          │ │ │
│  │   │ + }                                                   │ │ │
│  │   │ + await revokeToken(session.token)                    │ │ │
│  │   │   clearSession()                                      │ │ │
│  │   └──────────────────────────────────────────────────────┘ │ │
│  │ ▶ src/hooks/use-auth.ts                +32  -5    Modified │ │
│  │ ▶ tests/auth.test.ts                   +89  -0    Added    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  COMMITS (12)                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 2m ago   abc1234  feat: add logout button to header        │ │
│  │ 15m ago  def5678  feat: implement logout API call          │ │
│  │ 22m ago  ghi9012  refactor: extract auth utilities         │ │
│  │ ...                                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Diff Syntax Highlighting

Use existing syntax highlighting from the DS2 system:

```css
/* Diff-specific colors */
.diff-add {
  background: rgba(39, 174, 96, 0.15); /* acid-green at 15% */
  color: var(--acid-green);
}
.diff-del {
  background: rgba(239, 68, 68, 0.15); /* red at 15% */
  color: #ef4444;
}
.diff-hunk {
  color: var(--ash);
  font-style: italic;
}
.diff-context {
  color: var(--bone);
  opacity: 0.7;
}
```

### 3.6 API Endpoint: Worker Git Activity

```typescript
// GET /api/gastown/workers/:name/git
// Returns: WorkerGitActivity

// GET /api/gastown/workers/:name/git/diff?file=src/lib/auth.ts
// Returns: Single file diff with full context
```

---

## Part 4: Implementation Phases

### Phase 2A: Journey Visualization (New)

**Priority**: P1 - Builds on Phase 1 foundation
**Estimated Tasks**: 8-10 beads issues

| Task ID | Title | Type | Priority | Dependencies |
|---------|-------|------|----------|--------------|
| JV-001 | Define JourneyStage enum and types | task | P1 | - |
| JV-002 | Create JourneyTracker component | task | P1 | JV-001 |
| JV-003 | Create stage detection logic in gastown.ts | task | P1 | JV-001 |
| JV-004 | Add journey data to worker detail view | task | P1 | JV-002, JV-003 |
| JV-005 | Create ConvoyJourney aggregate component | task | P2 | JV-002 |
| JV-006 | Add journey to convoy list display | task | P2 | JV-005 |
| JV-007 | Create journey timeline for issue detail | task | P2 | JV-002 |
| JV-008 | Add substage detection (2a-2d) | task | P3 | JV-003 |

### Phase 2B: Enhanced Cost Tracking (New)

**Priority**: P1 - User explicitly requested
**Estimated Tasks**: 10-12 beads issues

| Task ID | Title | Type | Priority | Dependencies |
|---------|-------|------|----------|--------------|
| CT-001 | Define EnhancedGuzzolineStats types | task | P1 | - |
| CT-002 | Parse per-issue token usage from events | task | P1 | CT-001 |
| CT-003 | Calculate USD cost from token counts | task | P1 | CT-001 |
| CT-004 | Create CostSparkline component | task | P1 | CT-003 |
| CT-005 | Create CostPanel component | task | P1 | CT-003, CT-004 |
| CT-006 | Add cost breakdown by convoy | task | P2 | CT-002 |
| CT-007 | Add cost breakdown by worker | task | P2 | CT-002 |
| CT-008 | Create hourly usage chart component | task | P2 | CT-002 |
| CT-009 | Add cost to worker cards | task | P2 | CT-004 |
| CT-010 | Add cost to convoy rows | task | P2 | CT-004 |
| CT-011 | Add cost efficiency metrics | task | P3 | CT-002, CT-007 |
| CT-012 | Add budget warning thresholds | task | P3 | CT-005 |

### Phase 2C: Git Diff Viewer (New)

**Priority**: P2 - Important but builds on P1 items
**Estimated Tasks**: 8-10 beads issues

| Task ID | Title | Type | Priority | Dependencies |
|---------|-------|------|----------|--------------|
| GD-001 | Define WorkerGitActivity types | task | P1 | - |
| GD-002 | Create git activity parser in gastown.ts | task | P1 | GD-001 |
| GD-003 | Create DiffViewer component | task | P1 | GD-001 |
| GD-004 | Add syntax highlighting for diffs | task | P1 | GD-003 |
| GD-005 | Create CommitList component | task | P2 | GD-001 |
| GD-006 | Create FileChangeList component | task | P2 | GD-003 |
| GD-007 | Add git activity to worker detail view | task | P2 | GD-002, GD-003 |
| GD-008 | Create expandable file diff view | task | P2 | GD-006 |
| GD-009 | Add git stats to worker cards | task | P3 | GD-002 |
| GD-010 | Add PR link integration | task | P3 | GD-002 |

---

## Part 5: Updated Phase Plan

### Revised Hitch Phases

```yaml
phases:
  - id: phase-1-town-overview
    title: "Phase 1: Town Overview (Level 0)"
    status: in_progress  # ~70% complete
    # ... existing tasks ...

  - id: phase-2a-journey
    title: "Phase 2A: Journey Visualization"
    description: "Stage-by-stage work lifecycle visibility"
    depends_on: phase-1-town-overview
    priority: P1
    complete_when:
      - file_exists: src/components/journey/journey-tracker.tsx
      - file_exists: src/components/journey/convoy-journey.tsx
      - api_returns_data: /api/gastown/workers/:name (includes journey)
    tasks: [JV-001 through JV-008]

  - id: phase-2b-cost
    title: "Phase 2B: Enhanced Cost Tracking"
    description: "Per-entity token usage and cost visibility"
    depends_on: phase-1-town-overview
    priority: P1
    complete_when:
      - file_exists: src/components/cost/cost-panel.tsx
      - file_exists: src/components/cost/cost-sparkline.tsx
      - api_returns_data: /api/gastown/guzzoline (includes breakdown)
    tasks: [CT-001 through CT-012]

  - id: phase-2c-git
    title: "Phase 2C: Git Diff Viewer"
    description: "View code changes per worker"
    depends_on: phase-1-town-overview
    priority: P2
    complete_when:
      - file_exists: src/components/git/diff-viewer.tsx
      - file_exists: src/components/git/commit-list.tsx
      - api_returns_data: /api/gastown/workers/:name/git
    tasks: [GD-001 through GD-010]

  - id: phase-2-rig-view
    title: "Phase 2: Rig View (Level 1)"
    # ... existing, now depends on 2a, 2b, 2c ...
    depends_on: [phase-2a-journey, phase-2b-cost]
```

---

## Part 6: Component Inventory

### New Components Required

| Component | File Path | Phase | Priority |
|-----------|-----------|-------|----------|
| JourneyTracker | `src/components/journey/journey-tracker.tsx` | 2A | P1 |
| ConvoyJourney | `src/components/journey/convoy-journey.tsx` | 2A | P2 |
| JourneyTimeline | `src/components/journey/journey-timeline.tsx` | 2A | P2 |
| CostPanel | `src/components/cost/cost-panel.tsx` | 2B | P1 |
| CostSparkline | `src/components/cost/cost-sparkline.tsx` | 2B | P1 |
| CostChart | `src/components/cost/cost-chart.tsx` | 2B | P2 |
| CostBreakdown | `src/components/cost/cost-breakdown.tsx` | 2B | P2 |
| DiffViewer | `src/components/git/diff-viewer.tsx` | 2C | P1 |
| CommitList | `src/components/git/commit-list.tsx` | 2C | P2 |
| FileChangeList | `src/components/git/file-change-list.tsx` | 2C | P2 |
| DiffLine | `src/components/git/diff-line.tsx` | 2C | P1 |

### Updated Existing Components

| Component | Changes | Phase |
|-----------|---------|-------|
| WorkerCard | Add CostSparkline, git stats summary | 2B, 2C |
| ConvoyRow | Add ConvoyJourney summary, cost | 2A, 2B |
| WorkerDetail | Add full journey, cost, git sections | 2A-2C |
| TownOverview | Add cost summary panel | 2B |

---

## Part 7: Data Flow

### Journey Data Flow

```
Worker Activity (tmux, git, beads)
        │
        ▼
Witness Agent (monitors)
        │
        ├─→ Events to .events.jsonl
        │
        ▼
gastown.ts:getWorkerStatus()
        │
        ├─→ Parse stage from signals
        │
        ▼
/api/gastown/workers/:name
        │
        ▼
useWorkerDetail() hook
        │
        ▼
JourneyTracker component
```

### Cost Data Flow

```
Claude API calls (via polecats)
        │
        ├─→ token_usage events to .events.jsonl
        │
        ▼
gastown.ts:getEnhancedGuzzolineStats()
        │
        ├─→ Aggregate by issue (from event payload)
        ├─→ Aggregate by convoy (from issue → convoy mapping)
        ├─→ Aggregate by worker (from actor field)
        │
        ▼
/api/gastown/guzzoline?breakdown=issue,convoy,worker
        │
        ▼
useGuzzoline({ breakdown: [...] }) hook
        │
        ▼
CostPanel / CostSparkline components
```

### Git Data Flow

```
Worker git activity (commits, pushes)
        │
        ▼
gastown.ts:getWorkerGitActivity()
        │
        ├─→ Determine worker branch
        ├─→ git log base..branch
        ├─→ git diff base...branch
        │
        ▼
/api/gastown/workers/:name/git
        │
        ▼
useWorkerGit() hook
        │
        ▼
DiffViewer / CommitList components
```

---

## Part 8: Acceptance Criteria

### Journey Visualization

- [ ] User can see which stage each issue is in (0-4)
- [ ] User can see substage for working issues (2a-2d)
- [ ] Convoy view shows aggregate stage distribution
- [ ] Stage transitions trigger visual feedback
- [ ] Time in stage is displayed

### Cost Tracking

- [ ] User can see total token usage and estimated USD cost
- [ ] User can drill down by issue, convoy, or worker
- [ ] Cost is displayed inline on worker cards
- [ ] Cost is displayed inline on convoy rows
- [ ] Hourly usage chart is available
- [ ] Budget warnings appear when thresholds exceeded

### Git Diff Viewer

- [ ] User can see all commits by a worker
- [ ] User can see files changed with +/- counts
- [ ] User can expand files to see inline diff
- [ ] Diff has syntax highlighting
- [ ] Stats summary shows total additions/deletions

---

## Part 9: Storybook Stories

Each new component should have Storybook stories:

```tsx
// journey-tracker.stories.tsx
export const Queued: Story = { args: { currentStage: 0 } }
export const Working: Story = { args: { currentStage: 2, substage: '2b' } }
export const PRReady: Story = { args: { currentStage: 3 } }
export const Merged: Story = { args: { currentStage: 4 } }
export const Blocked: Story = { args: { currentStage: 2, blocked: true } }

// cost-sparkline.stories.tsx
export const LowCost: Story = { args: { tokens: 50000, costUsd: 0.25 } }
export const MediumCost: Story = { args: { tokens: 500000, costUsd: 2.50 } }
export const HighCost: Story = { args: { tokens: 2000000, costUsd: 10.00 } }
export const WithTrend: Story = { args: { tokens: 500000, costUsd: 2.50, trend: 'up' } }

// diff-viewer.stories.tsx
export const SingleFile: Story = { args: { files: [mockFile] } }
export const MultipleFiles: Story = { args: { files: mockFiles } }
export const LargeDiff: Story = { args: { files: largeDiffMock } }
export const AddedFile: Story = { args: { files: [{ status: 'added', ... }] } }
```

---

## Appendix A: Event Types for Journey Detection

```typescript
// Events that indicate stage transitions
const STAGE_SIGNALS = {
  // Stage 0 → 1: Issue claimed
  'issue.assigned': { from: 0, to: 1 },
  'polecat.spawned': { from: 0, to: 1 },

  // Stage 1 → 2: Work started
  'polecat.started': { from: 1, to: 2 },
  'git.branch.created': { from: 1, to: 2 },

  // Stage 2 → 3: PR opened
  'pr.opened': { from: 2, to: 3 },
  'git.push': { from: 2, to: 3 }, // if PR exists

  // Stage 3 → 4: Merged
  'pr.merged': { from: 3, to: 4 },
  'issue.closed': { from: 3, to: 4 }, // if via merge
}

// Substage detection for Stage 2
const SUBSTAGE_SIGNALS = {
  // 2a: Analyzing
  'tool.read': '2a',
  'tool.grep': '2a',
  'tool.glob': '2a',

  // 2b: Coding
  'tool.write': '2b',
  'tool.edit': '2b',
  'git.commit': '2b',

  // 2c: Testing
  'command.test': '2c',
  'command.pytest': '2c',
  'command.npm_test': '2c',

  // 2d: PR Prep
  'git.push': '2d',
  'pr.draft': '2d',
}
```

---

## Appendix B: Cost Calculation Examples

```typescript
// Example: Issue gt-456 cost breakdown
const exampleIssueCost: IssueCost = {
  issue_id: 'gt-456',
  total_tokens: 450000,
  input_tokens: 380000,
  output_tokens: 60000,
  cache_read_tokens: 10000,
  estimated_cost_usd: 2.04, // (380k * $3/M) + (60k * $15/M) + (10k * $0.30/M)
  workers_involved: ['polecat-alpha'],
  duration_minutes: 45,
  tokens_per_minute: 10000, // efficiency: 10k tokens/min
}

// Example: Convoy hq-cv-abc cost breakdown
const exampleConvoyCost: ConvoyCost = {
  convoy_id: 'hq-cv-abc',
  total_tokens: 2400000,
  estimated_cost_usd: 12.50,
  issue_count: 10,
  avg_cost_per_issue: 1.25,
  issues: [/* array of IssueCost */]
}
```

---

## Next Steps

1. **Review this spec** with stakeholders
2. **Approve/modify** phase priorities
3. **Create beads issues** from task tables
4. **Assign to polecats** via mayor dispatch
5. **Track progress** in Citadel itself (dogfooding!)

---

*Generated for mayor dispatch to polecats via beads*
