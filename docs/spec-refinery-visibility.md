# Spec: Refinery Visibility - Merge Queue Dashboard

> **Phase**: 2E (Extension of Phase 2)
> **Priority**: P1
> **Status**: Draft
> **Author**: Mayor
> **Date**: 2026-01-09

---

## 1. Problem Statement

The Refinery (merge queue processor) is a black box:

1. **No queue visibility** - Can't see what's pending, in-flight, or blocked
2. **PR status unknown** - Don't know which PRs are waiting, passing CI, or failing
3. **Health opacity** - Is the refinery running? Healthy? Stuck?
4. **No merge history** - What recently merged? What failed?
5. **Rig detail empty** - Merge queue section exists but shows nothing

The infrastructure exists (`MergeQueue` type, API data), but no UI displays it.

---

## 2. Current State

### 2.1 What Exists

**Data Types** (in `src/lib/gastown.ts`):
```typescript
interface MergeQueue {
  pending: number;    // PRs waiting to be processed
  in_flight: number;  // PRs currently being merged
  blocked: number;    // PRs that can't merge (conflicts, CI fail)
  state: string;      // "running" | "paused" | "idle"
  health: string;     // "healthy" | "degraded" | "failing"
}

interface Rig {
  // ...other fields
  has_refinery: boolean;
  mq?: MergeQueue;  // Optional merge queue status
}
```

**Data Available** via `useTownStatus` hook - returns rigs with `mq` property.

**UI Scaffolded**: Rig detail page exists, merge queue section is empty.

### 2.2 What's Missing

- Component to display `MergeQueue` stats
- Individual PR items in queue (not just counts)
- Refinery health indicator
- Merge history/log
- Failed merge alerts

---

## 3. Solution Overview

### 3.1 Rig Detail Enhancement

Add **MergeQueuePanel** to rig detail view showing:
- Queue stats (pending/in-flight/blocked)
- Refinery health indicator
- List of PRs in queue with status
- Recent merge history

### 3.2 Town Overview Widget

Add **RefineryStatus** summary to town dashboard:
- Total PRs across all rigs
- Any unhealthy refineries flagged
- Quick link to rig with issues

---

## 4. Component Specifications

### 4.1 MergeQueuePanel - Main Refinery View

```typescript
interface MergeQueuePanelProps {
  rigName: string
  mergeQueue: MergeQueue
  prItems?: PRItem[]  // If detailed PR data available
  onRefresh?: () => void
}

interface PRItem {
  id: string           // PR number or ID
  title: string
  branch: string       // polecat/maximus-mk7xxx
  author: string       // polecat name
  status: PRStatus
  ciStatus: CIStatus
  createdAt: string
  updatedAt: string
  beadId?: string      // Linked bead if known
}

type PRStatus = 'pending' | 'in_flight' | 'merged' | 'blocked' | 'failed'
type CIStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
```

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REFINERY                                              ● Healthy  [↻ Refresh]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │ PENDING  │  │ IN FLIGHT│  │ BLOCKED  │  │  STATE   │                    │
│  │    3     │  │    1     │  │    0     │  │ Running  │                    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                    │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  QUEUE                                                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  │ #47 │ Journey substage detection │ polecat/maximus │ ●CI Pass │ In Flight│
│  │ #46 │ CostSparkline component    │ polecat/iron    │ ○CI Run  │ Pending  │
│  │ #45 │ Cost breakdown by convoy   │ polecat/nux     │ ○CI Run  │ Pending  │
│  │ #44 │ DiffViewer component       │ polecat/signal  │ ●CI Pass │ Pending  │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  RECENT MERGES                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  │ #43 │ Phase 3 Command Center     │ 2 hours ago │ ●Merged │             │
│  │ #42 │ Rig View drill-down        │ 4 hours ago │ ●Merged │             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Constraints:**
- Uses Panel component with elevated variant
- Health indicator uses StatusBadge (map to status: healthy→active, degraded→slow, failing→dead)
- PR status uses existing status color system
- CI status uses small indicator dots

### 4.2 MergeQueueStats - Summary Stats Row

```typescript
interface MergeQueueStatsProps {
  stats: MergeQueue
  compact?: boolean  // For inline display
}
```

**Visual Design (Full):**
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ PENDING  │  │ IN FLIGHT│  │ BLOCKED  │  │  STATE   │
│    3     │  │    1     │  │    0     │  │ Running  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Visual Design (Compact):**
```
Refinery: 3 pending • 1 in flight • 0 blocked • ●Running
```

**Constraints:**
- Uses data-value typography for numbers
- State uses color coding (running=green, paused=yellow, idle=ash)
- Blocked count highlighted if > 0

### 4.3 PRQueueItem - Individual PR Row

```typescript
interface PRQueueItemProps {
  pr: PRItem
  onSelect?: (pr: PRItem) => void
  selected?: boolean
}
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ #47 │ Journey substage detection │ maximus │ ●CI │ 🔄 In Flight │ ct-001   │
└─────────────────────────────────────────────────────────────────────────────┘
  ↑      ↑                           ↑         ↑      ↑              ↑
  PR#   Title (truncated)         Author    CI      Status      Linked Bead
```

**Constraints:**
- Clickable row opens PR detail (link to GitHub or modal)
- CI status: ● passed (green), ○ running (blue pulse), ✕ failed (red)
- Author shows polecat name without prefix
- Linked bead clickable to bead detail

### 4.4 RefineryHealth - Health Indicator

```typescript
interface RefineryHealthProps {
  health: 'healthy' | 'degraded' | 'failing'
  state: string
  showLabel?: boolean
}
```

**Visual:**
- Healthy: Green dot + "Healthy"
- Degraded: Yellow dot + "Degraded" + warning icon
- Failing: Red dot + "Failing" + alert icon

**Constraints:**
- Uses StatusBadge mapping
- Tooltip shows details on hover

### 4.5 RefineryOverview - Town Dashboard Widget

```typescript
interface RefineryOverviewProps {
  rigs: Rig[]  // All rigs with mq data
}
```

**Visual Design (for Town Overview):**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REFINERIES                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Total Queue: 7 PRs across 3 rigs                                          │
│                                                                             │
│  citadel   │ ●Healthy │ 3 pending, 1 in flight                             │
│  keeper    │ ●Healthy │ 2 pending                                          │
│  gastown   │ ⚠Degraded│ 1 blocked ← attention needed                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Constraints:**
- Compact view for dashboard
- Click rig name to navigate to rig detail
- Highlight rigs with issues (blocked > 0, health != healthy)

---

## 5. Data Requirements

### 5.1 Enhanced API

**Option A: Extend existing `/api/gastown/status`**

Already returns `rigs[].mq` with basic stats. May be sufficient for counts.

**Option B: New `/api/gastown/refinery/:rig`**

For detailed PR-level data:

```typescript
interface RefineryDetailResponse {
  rig: string
  mergeQueue: MergeQueue
  queue: PRItem[]
  recentMerges: PRItem[]  // Last N merged PRs
  lastUpdated: string
}
```

**Implementation**: Read from git/GitHub:
- `gh pr list --state open --json number,title,headRefName,author,statusCheckRollup`
- `gh pr list --state merged --limit 10 --json number,title,mergedAt`

### 5.2 New Hook

**useMergeQueue**

```typescript
interface UseMergeQueueOptions {
  rigName: string
  includeItems?: boolean  // Fetch individual PRs
  refreshInterval?: number
}

interface UseMergeQueueResult {
  stats: MergeQueue | null
  items: PRItem[]
  recentMerges: PRItem[]
  error: Error | null
  isLoading: boolean
  refresh: () => void
}
```

### 5.3 Fallback Behavior

If detailed PR data not available:
- Show counts from `MergeQueue` (always available)
- Show "PR details not available" message
- Link to GitHub PR page for full details

---

## 6. Integration Points

### 6.1 Rig Detail Page

Add MergeQueuePanel to existing rig detail layout:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RIG: citadel                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Overview] [Polecats] [Convoys] [Refinery]  ← Tab or section nav          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ REFINERY (MergeQueuePanel)                                          │   │
│  │ ...                                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Town Overview

Add RefineryOverview widget to home page:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GAS TOWN                                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Active Rigs  │  │   Convoys    │  │   Workers    │  │  Guzzoline   │   │
│  │      3       │  │      2       │  │      7       │  │    45k       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ REFINERIES (RefineryOverview)                                       │   │
│  │ Total: 7 PRs │ citadel ●3 │ keeper ●2 │ gastown ⚠1 blocked         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Cross-Links

- PR item → GitHub PR page
- PR item → Linked bead (if known)
- Rig name → Rig detail page
- Blocked PRs → Show what's blocking (conflict? CI? Review?)

---

## 7. Real-Time Updates

### 7.1 Polling Strategy

- Default: 30 seconds for counts
- Active queue (in_flight > 0): 10 seconds
- Blocked items: Show alert until resolved

### 7.2 Visual Feedback

- Pulse animation on "In Flight" items
- Flash on status change
- "Just merged" highlight for 30 seconds

---

## 8. Error States

### 8.1 Refinery Not Running

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REFINERY                                              ○ Not Running         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  The refinery for this rig is not active.                                  │
│                                                                             │
│  This means:                                                                │
│  • PRs won't be automatically merged                                        │
│  • Manual merge required via GitHub                                         │
│                                                                             │
│  [View PRs on GitHub]                                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 No PRs in Queue

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REFINERY                                              ● Healthy  [Idle]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Queue is empty. All clear!                                                 │
│                                                                             │
│  Waiting for polecats to submit PRs...                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Blocked PRs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REFINERY                                              ⚠ Degraded            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ⚠ 2 PRs are blocked and need attention                                    │
│                                                                             │
│  │ #45 │ DiffViewer component │ ✕ CI Failed │ Blocked │ [View Logs]        │
│  │ #44 │ Cost breakdown       │ ⚠ Conflict  │ Blocked │ [Resolve]          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.4 Rebase Conflict (Manual Intervention Required)

When the refinery hits a merge conflict during rebase:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ REFINERY                                    🔴 CONFLICT - Action Required   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ⛔ Rebase conflict detected - manual intervention required                 │
│                                                                             │
│  REBASING: temp-maximus onto 9d1f0de                                        │
│  CONFLICTING FILE: src/lib/gastown/types.ts                                 │
│                                                                             │
│  Both added the same file:                                                  │
│  • maximus: feat(journey): Add JourneyStage enum                           │
│  • main: CT-006: Add cost breakdown by convoy                              │
│                                                                             │
│  COMMANDS TO RESOLVE:                                                       │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ cd ~/gt/citadel/refinery/rig                                       │    │
│  │ git diff                          # View conflict                  │    │
│  │ # ... resolve manually ...                                         │    │
│  │ git add src/lib/gastown/types.ts                                   │    │
│  │ git rebase --continue                                              │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  [View Diff] [Copy Commands] [Abort Rebase]                                 │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Remaining in queue: 12 commits waiting                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Detection**: Check for `.git/rebase-merge/` or `.git/rebase-apply/` directory in refinery rig.

**Data to surface**:
- Current branch being rebased
- Target commit
- Conflicting file(s)
- Commit messages involved
- Commands to resolve

**API addition**:
```typescript
interface RefineryConflict {
  type: 'rebase' | 'merge'
  branch: string
  onto: string
  conflictingFiles: string[]
  currentCommit: {
    sha: string
    message: string
  }
  remainingCommits: number
}

interface MergeQueue {
  // ... existing fields
  conflict?: RefineryConflict  // NEW: Present when stuck
}
```

---

## 9. Implementation Phases

### Phase 2E-1: Basic Stats (P1)
1. MergeQueueStats component (uses existing MergeQueue data)
2. RefineryHealth indicator
3. Add to rig detail page (wire up existing data)
4. Add RefineryOverview to town dashboard

### Phase 2E-2: PR Queue List (P1)
1. New API route for PR details (or GitHub integration)
2. PRQueueItem component
3. useMergeQueue hook
4. Queue list in MergeQueuePanel

### Phase 2E-3: History & Alerts (P2)
1. Recent merges section
2. Blocked PR alerts
3. Status change notifications
4. Link to bead system

---

## 10. Acceptance Criteria

### Must Have
- [ ] MergeQueue stats visible on rig detail page
- [ ] Refinery health indicator working
- [ ] Town overview shows refinery summary
- [ ] Data refreshes automatically

### Should Have
- [ ] Individual PR items in queue
- [ ] CI status per PR
- [ ] Recent merge history
- [ ] Blocked PR highlighting

### Nice to Have
- [ ] Real-time status updates
- [ ] GitHub deep links
- [ ] Bead cross-reference
- [ ] Merge failure alerts

---

## 11. Keeper Considerations

### New Components Proposed

| Component | Type | Justification |
|-----------|------|---------------|
| MergeQueuePanel | New seed | No existing panel for queue data |
| MergeQueueStats | Composition | Uses Panel + data-value typography |
| PRQueueItem | Extension of list pattern | Similar to CommitList item |
| RefineryHealth | Extension of StatusBadge | Maps health to status |
| RefineryOverview | Composition | Uses Panel + compact stats |

### Reuses Existing

- Panel, PanelHeader, PanelBody
- StatusBadge (for health indicator)
- Icon component
- Existing typography utilities

### Data Types to Add

```typescript
// Add to data.yaml
PRItem:
  status: proposed
  fields:
    - id: string
    - title: string
    - branch: string
    - author: string
    - status: PRStatus
    - ciStatus: CIStatus
    - createdAt: string
    - beadId?: string

PRStatus:
  status: proposed
  type: enum
  values: [pending, in_flight, merged, blocked, failed]

CIStatus:
  status: proposed
  type: enum
  values: [pending, running, passed, failed, skipped]
```

---

## 12. Related Documents

- `docs/spec-beads-visibility.md` - Beads table (cross-links to PRs)
- `docs/spec-journey-visibility.md` - Journey tracking (PR stage)
- `keeper/seeds/data.yaml` - MergeQueue type definition
- `src/lib/gastown.ts` - Existing types
