# Spec: Beads Visibility - Issue Tracking Dashboard

> **Phase**: 2D (Extension of Phase 2)
> **Priority**: P1
> **Status**: Draft
> **Author**: Mayor
> **Date**: 2026-01-09

---

## 1. Problem Statement

Users have no visibility into the beads (issue tracking) system from Citadel:

1. **Blind dispatch** - "I just kind of hope for the best" when sending work to polecats
2. **No bead inventory** - Can't see all beads, their status, or data
3. **Dependency opacity** - Can't see what's blocking what
4. **Assignment mystery** - Don't know what's assigned to which polecat
5. **No filtering/search** - Can't find specific beads quickly

The dashboard shows convoys and workers but not the **underlying beads** that drive everything.

---

## 2. Solution Overview

Two complementary views:

### 2.1 Beads Table (Primary View)

A dedicated `/beads` page showing all beads with:
- Sortable/filterable table
- Full bead data visible
- Quick actions (view, assign, close)
- Dependency visualization

### 2.2 Convoy Beads Panel (Contextual View)

Enhanced convoy cards showing:
- Beads assigned to that convoy
- Per-bead status within convoy
- Quick bead details on hover/click

---

## 3. Information Architecture

### 3.1 Why Standalone Tab

Beads exist **before** convoys. The workflow is:
1. Create beads (issues) to track work
2. Optionally group beads into convoys for batch dispatch
3. Assign to polecats

Users need to:
- See all beads across all rigs
- Work on something, come back to other beads later
- Plan work before dispatching
- Monitor beads not yet in convoys

Convoys are optional batching - beads are the source of truth.

### 3.2 Hierarchy: Rig → Epic → Issue

```
┌─────────────────────────────────────────────────────────────────┐
│ RIG (Project)                                                   │
│ └── EPIC (Feature batch)                                        │
│     ├── Issue (Task/Bug)                                        │
│     ├── Issue (Task/Bug)                                        │
│     └── Issue (Task/Bug)                                        │
│                                                                 │
│ Example:                                                        │
│ citadel/                                                        │
│ └── EPIC: Phase 2A Journey                                      │
│     ├── ct-001: Implement JourneyTracker                        │
│     ├── ct-002: Create useJourney hook                          │
│     └── ct-003: Add journey to convoy cards                     │
│ └── EPIC: Phase 2B Cost                                         │
│     ├── ct-010: Implement CostSparkline                         │
│     └── ct-011: Create useCost hook                             │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Page Structure

```
/beads
├── Rig Selector (or show all rigs)
│
├── Filters Bar
│   ├── Status (open, in_progress, closed, blocked)
│   ├── Type (task, bug, feature, epic)
│   ├── Priority (P0-P4)
│   ├── Assignee (polecat name or unassigned)
│   └── Search (title, ID)
│
├── Beads Table
│   ├── ID (clickable → detail view)
│   ├── Title
│   ├── Type
│   ├── Status
│   ├── Priority
│   ├── Assignee
│   ├── Dependencies (blocked by / blocks)
│   ├── Created
│   └── Updated
│
├── Selected Bead Detail (side panel or modal)
│   ├── Full description
│   ├── All metadata
│   ├── Dependency graph
│   ├── Activity/history
│   └── Actions (assign, close, add dep)
│
└── Stats Summary
    ├── Total / Open / Closed
    ├── By status breakdown
    └── Blocked count
```

---

## 4. Component Specifications

### 4.1 BeadsTable - Main Data Table

```typescript
interface BeadsTableProps {
  beads: Bead[]
  onBeadSelect: (bead: Bead) => void
  selectedBeadId?: string
  sortBy?: SortField
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: SortField) => void
}

interface Bead {
  id: string           // e.g., "ct-abc123"
  title: string
  type: 'task' | 'bug' | 'feature' | 'epic'
  status: 'open' | 'in_progress' | 'closed' | 'blocked'
  priority: 0 | 1 | 2 | 3 | 4  // P0=critical, P4=backlog
  assignee?: string    // polecat name
  blockedBy: string[]  // bead IDs this depends on
  blocks: string[]     // bead IDs that depend on this
  created: string      // ISO timestamp
  updated: string      // ISO timestamp
  description?: string
  labels?: string[]
  convoy?: string      // convoy ID if assigned
}

type SortField = 'id' | 'title' | 'type' | 'status' | 'priority' | 'assignee' | 'created' | 'updated'
```

**Visual Design - Grouped by Epic:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▼ citadel                                                    [12 beads]    │
├─────────────────────────────────────────────────────────────────────────────┤
│   ▼ EPIC: Phase 2A Journey                                   [4/8 done]    │
│   ├──────────────────────────────────────────────────────────────────────┤
│   │ ct-001  │ Implement JourneyTracker │ task │ ●active│ P1  │ polecat-α│ │
│   │ ct-002  │ Create useJourney hook   │ task │ ○open  │ P1  │ —        │ │
│   │ ct-003  │ Journey in convoy cards  │ task │ ●done  │ P2  │ polecat-β│ │
│   │ ct-004  │ Integration tests        │ task │ ⊘block │ P2  │ —        │2│
│   └──────────────────────────────────────────────────────────────────────┘
│                                                                             │
│   ▶ EPIC: Phase 2B Cost                                      [0/6 done]    │
│   ▶ EPIC: Phase 2C Git                                       [0/4 done]    │
│                                                                             │
│ ▶ keeper                                                     [3 beads]     │
│ ▶ gastown                                                    [8 beads]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Alternative: Flat Table View (toggle)**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ID         │ Title                    │ Rig  │ Epic     │ Status │ Pri │ A │
├─────────────────────────────────────────────────────────────────────────────┤
│ ct-001     │ Implement JourneyTracker │citadel│Phase 2A │ ●active│ P1  │ α │
│ ct-002     │ Create useJourney hook   │citadel│Phase 2A │ ○open  │ P1  │ — │
│ kp-010     │ Update seed registry     │keeper │Governance│ ●done  │ P2  │ β │
│ gt-005     │ Fix convoy dispatch      │gastown│Core     │ ⊘block │ P1  │ — │
└─────────────────────────────────────────────────────────────────────────────┘
```

**View Toggle:**
- [Tree View] - Grouped by Rig → Epic (default)
- [Flat View] - All beads in sortable table

**Constraints:**
- Must use DS2 colors for status indicators
- Row click selects bead for detail view
- Blocked beads show dependency count badge
- Sortable columns with visual indicator

### 4.2 BeadsTree - Hierarchical Group View

```typescript
interface BeadsTreeProps {
  beads: Bead[]
  groupBy: 'rig' | 'epic' | 'status' | 'priority'
  expandedGroups: Set<string>
  onToggleGroup: (groupId: string) => void
  onBeadSelect: (bead: Bead) => void
  selectedBeadId?: string
}

interface BeadGroup {
  id: string
  label: string
  type: 'rig' | 'epic'
  beads: Bead[]
  children?: BeadGroup[]  // For nested groups (rig → epic)
  stats: {
    total: number
    done: number
    active: number
    blocked: number
  }
}
```

**Behavior:**
- Default: Group by Rig → Epic (two-level hierarchy)
- Collapsible groups with chevron toggle
- Progress indicator per group (X/Y done)
- Beads within group show condensed row
- Click group header to expand/collapse
- Click bead row to select

**Constraints:**
- Indentation: 16px per level
- Group headers use section-header typography
- Smooth expand/collapse animation (150ms)
- Remember expanded state in localStorage

### 4.3 BeadsFilter - Filter Controls

```typescript
interface BeadsFilterProps {
  filters: BeadFilters
  onChange: (filters: BeadFilters) => void
  beadCounts: {
    total: number
    open: number
    inProgress: number
    closed: number
    blocked: number
  }
}

interface BeadFilters {
  status?: ('open' | 'in_progress' | 'closed' | 'blocked')[]
  type?: ('task' | 'bug' | 'feature' | 'epic')[]
  priority?: (0 | 1 | 2 | 3 | 4)[]
  assignee?: string | 'unassigned'
  search?: string
}
```

**Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [All ▼] [Status ▼] [Type ▼] [Priority ▼] [Assignee ▼]  🔍 Search...        │
│                                                                             │
│ Showing 24 of 30 beads │ 12 open │ 5 in progress │ 8 closed │ 5 blocked    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Constraints:**
- Dropdowns use existing select pattern (or establish new)
- Search is debounced (300ms)
- Filter counts update in real-time
- Clear all filters button when any active

### 4.3 BeadDetail - Side Panel Detail View

```typescript
interface BeadDetailProps {
  bead: Bead
  onClose: () => void
  onAction?: (action: BeadAction) => void
}

type BeadAction =
  | { type: 'assign', assignee: string }
  | { type: 'close', reason?: string }
  | { type: 'reopen' }
  | { type: 'add_dependency', beadId: string }
  | { type: 'remove_dependency', beadId: string }
```

**Visual Design:**

```
┌───────────────────────────────────┐
│ ct-abc123                    [✕]  │
│ ════════════════════════════════ │
│ Implement JourneyTracker          │
│                                   │
│ TYPE      TASK                    │
│ STATUS    ● Active                │
│ PRIORITY  P1                      │
│ ASSIGNEE  polecat-alpha           │
│ CONVOY    phase2-journey          │
│                                   │
│ CREATED   2026-01-09 14:23        │
│ UPDATED   2026-01-09 15:47        │
│                                   │
│ ─────────────────────────────────│
│ DESCRIPTION                       │
│ Build the JourneyTracker          │
│ component per spec section 4.1... │
│                                   │
│ ─────────────────────────────────│
│ DEPENDENCIES                      │
│ Blocked by: (none)                │
│ Blocks: ct-def456, ct-ghi789      │
│                                   │
│ ─────────────────────────────────│
│ LABELS                            │
│ [phase-2a] [frontend] [P1]        │
│                                   │
│ ─────────────────────────────────│
│ [Assign] [Close] [Add Dep]        │
└───────────────────────────────────┘
```

**Constraints:**
- Uses Panel component with elevated variant
- Slides in from right (or modal on mobile)
- Actions require confirmation for destructive ops
- Shows dependency links as clickable

### 4.4 DependencyGraph - Visual Dependency View

```typescript
interface DependencyGraphProps {
  beadId: string
  beads: Bead[]
  depth?: number  // How many levels to show (default: 2)
  onBeadClick?: (beadId: string) => void
}
```

**Visual Design:**

```
                    ┌─────────┐
                    │ct-parent│
                    └────┬────┘
                         │ blocks
            ┌────────────┼────────────┐
            ▼            ▼            ▼
       ┌─────────┐  ┌─────────┐  ┌─────────┐
       │ct-abc123│  │ct-def456│  │ct-ghi789│
       │ ●active │  │ ○open   │  │ ⊘blocked│
       └─────────┘  └─────────┘  └────┬────┘
                                      │ blocked by
                                      ▼
                                 ┌─────────┐
                                 │ct-jkl012│
                                 └─────────┘
```

**Constraints:**
- SVG-based for crisp rendering
- Clickable nodes navigate to bead
- Color-coded by status
- Collapsible for large graphs

### 4.5 BeadsStats - Summary Statistics

```typescript
interface BeadsStatsProps {
  stats: {
    total: number
    byStatus: Record<BeadStatus, number>
    byType: Record<BeadType, number>
    byPriority: Record<number, number>
    blockedCount: number
    readyCount: number  // open with no blockers
  }
}
```

**Visual Design:**

```
┌────────────────────────────────────────────────────────────────┐
│  TOTAL    READY     ACTIVE    BLOCKED    CLOSED               │
│   30        8         5          5          12                 │
│  beads   to work   working    waiting    complete             │
│                                                                │
│  [████████████████████████░░░░░░░░░░] 60% complete            │
└────────────────────────────────────────────────────────────────┘
```

**Constraints:**
- Uses Gauge component for progress
- "Ready" = open with no blockers (actionable)
- Click stats to filter table

---

## 5. Data Requirements

### 5.1 New API Route

**GET /api/gastown/beads**

Returns all beads for the current rig.

```typescript
interface BeadsResponse {
  beads: Bead[]
  stats: {
    total: number
    byStatus: Record<string, number>
    byType: Record<string, number>
    byPriority: Record<number, number>
  }
}
```

**Query Parameters:**
- `status` - Filter by status (comma-separated)
- `type` - Filter by type (comma-separated)
- `priority` - Filter by priority (comma-separated)
- `assignee` - Filter by assignee
- `search` - Search title/description
- `limit` - Max results (default: 100)
- `offset` - Pagination offset

### 5.2 New Hook

**useBeads**

```typescript
interface UseBeadsOptions {
  filters?: BeadFilters
  refreshInterval?: number
}

interface UseBeadsResult {
  data: BeadsResponse | null
  error: Error | null
  isLoading: boolean
  refresh: () => void
}
```

### 5.3 Data Source

The API reads from the beads system:
- `<rig>/.beads/issues.jsonl` - Issue data
- `<rig>/.beads/deps.jsonl` - Dependencies
- Or via `bd list --json` CLI output

---

## 6. Navigation Integration

### 6.1 New Nav Item

Add to `navItems` in `nav.tsx`:

```typescript
{ label: "Beads", href: "/beads", icon: navIcons.beads }
```

### 6.2 Icon Addition

Add "beads" icon to Icon component:
- Suggested: `CircleDot` from Lucide (or custom bead icon)
- Alternative: `ListTodo` from Lucide

### 6.3 Route Structure

```
src/app/beads/
├── page.tsx              # Main beads page
└── components/
    ├── beads-table.tsx
    ├── beads-filter.tsx
    ├── bead-detail.tsx
    ├── dependency-graph.tsx
    └── beads-stats.tsx
```

---

## 7. Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BEADS INVENTORY                                           [↻ Refresh]       │
│ Track and monitor all issues across the rig                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  TOTAL    READY     ACTIVE    BLOCKED    CLOSED                     │   │
│  │   30        8         5          5          12                       │   │
│  │  [████████████████████████░░░░░░░░░░] 60% complete                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ [All ▼] [Status ▼] [Type ▼] [Priority ▼]  🔍 Search...              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌───────────────────────────────────────────────────┬─────────────────┐   │
│  │                                                   │                 │   │
│  │  ID       │ Title              │ Status │ Pri │ A │  BEAD DETAIL    │   │
│  │  ─────────────────────────────────────────────── │                 │   │
│  │  ct-abc   │ Journey tracker    │ ●act   │ P1  │ α │  ct-abc123      │   │
│  │  ct-def   │ Cost sparkline     │ ○open  │ P1  │ — │  ═══════════    │   │
│  │  ct-ghi   │ Fix null check     │ ●done  │ P2  │ β │  Journey...     │   │
│  │  ct-jkl   │ DiffViewer         │ ⊘block │ P2  │ — │                 │   │
│  │  ...      │ ...                │ ...    │ ... │   │  [Details...]   │   │
│  │                                                   │                 │   │
│  └───────────────────────────────────────────────────┴─────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Convoy Integration

Enhance existing convoy cards to show beads:

```typescript
interface ConvoyBeadsProps {
  convoyId: string
  beads: Bead[]  // Beads assigned to this convoy
}
```

**Visual in Convoy Card:**

```
┌─────────────────────────────────────────────┐
│ CONVOY: phase2-journey           [3/8 done] │
│ ════════════════════════════════════════════│
│ Progress: [████████░░░░░░░░░░░░] 37%        │
│                                             │
│ BEADS:                                      │
│ ● ct-abc123  JourneyTracker      active     │
│ ○ ct-def456  ConvoyJourney       open       │
│ ● ct-ghi789  useJourney hook     done       │
│ ⊘ ct-jkl012  Integration tests   blocked    │
│ ... +4 more                                 │
│                                             │
│ [View All Beads] [Convoy Details]           │
└─────────────────────────────────────────────┘
```

---

## 9. Real-Time Updates

### 9.1 Polling Strategy

- Default refresh: 30 seconds
- Manual refresh button
- Configurable via settings

### 9.2 Visual Feedback

- Loading spinner on refresh
- "Last updated: X seconds ago" indicator
- Highlight changed rows briefly

---

## 10. Mobile Responsiveness

### Small Screens (<768px)

- Table becomes card list
- Detail panel becomes full-screen modal
- Filters collapse to single dropdown
- Stats row becomes scrollable

### Medium Screens (768px-1024px)

- Table with fewer columns (ID, Title, Status, Priority)
- Detail panel slides from bottom
- Full filter bar

### Large Screens (>1024px)

- Full table with all columns
- Side panel detail view
- Expanded stats

---

## 11. Accessibility

- Keyboard navigation through table rows
- ARIA labels on status icons
- Screen reader announces "X of Y beads shown"
- Focus management when detail panel opens
- High contrast mode support

---

## 12. Implementation Phases

### Phase 2D-1: Core Table (P1)
1. BeadsTable component
2. BeadsFilter component
3. BeadsStats component
4. API route + hook
5. Navigation integration

### Phase 2D-2: Detail View (P1)
1. BeadDetail panel
2. Action handlers (assign, close)
3. Mobile responsive layout

### Phase 2D-3: Dependencies (P2)
1. DependencyGraph component
2. Blocked/blocks visualization
3. Click-through navigation

### Phase 2D-4: Convoy Integration (P2)
1. ConvoyBeads component
2. Enhanced convoy cards
3. Cross-linking between views

---

## 13. Acceptance Criteria

### Must Have
- [ ] Beads tab in navigation
- [ ] Table shows all beads with core fields
- [ ] Filter by status, type, priority
- [ ] Search by title
- [ ] Stats summary at top
- [ ] Click bead to see details

### Should Have
- [ ] Sort by any column
- [ ] Dependency count badge
- [ ] Detail panel with full data
- [ ] Real-time refresh
- [ ] Mobile responsive

### Nice to Have
- [ ] Dependency graph visualization
- [ ] Inline actions (assign, close)
- [ ] Convoy integration
- [ ] Export to CSV

---

## 14. Keeper Considerations

### New Components Proposed

| Component | Type | Justification |
|-----------|------|---------------|
| BeadsTree | New seed | Hierarchical collapsible tree, no existing pattern |
| BeadsTable | New seed | Flat sortable table, no existing pattern |
| BeadsFilter | New seed | Filter bar with dropdowns, no existing pattern |
| BeadDetail | Panel extension | Follows side panel pattern from EntityCard |
| DependencyGraph | New seed | Graph visualization, no existing pattern |
| BeadsStats | Composition | Uses Gauge + Panel |

### Patterns Established

- **Tree view**: BeadsTree establishes collapsible hierarchy pattern
- **Data table**: BeadsTable establishes sortable table pattern
- **Filter bar**: BeadsFilter establishes filter controls pattern
- **Side detail panel**: BeadDetail establishes slide-out detail pattern

These patterns will be reusable for Workers page, Convoys page, etc.

### Cross-Rig Data

This is the first feature to show data **across all rigs** (not per-rig). API must:
- Aggregate beads from all `<rig>/.beads/` directories
- Include rig identifier in each bead
- Handle prefix routing (beads have rig-specific prefixes)

---

## 15. Related Documents

- `docs/spec-journey-visibility.md` - Phase 2 (JourneyTracker for stage viz)
- `docs/spec-guide-tab.md` - Phase 3 (Guide explains what beads are)
- `keeper/seeds/frontend.yaml` - Component registry
