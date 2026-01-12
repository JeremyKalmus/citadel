# Citadel UI/UX Enhancement Spec: Convoy Clarity & Scope

> **Purpose**: Spec for mayor to dispatch to polecats via beads
> **Status**: DRAFT - Awaiting approval
> **Created**: 2026-01-11

---

## Executive Summary

Clarify the relationship between **Convoys**, **Beads**, and **Rigs** in the Citadel UI by:
1. Removing convoys from rig pages (they're town-level, not rig-level)
2. Adding convoy membership indicators to beads
3. Establishing convoys as the town-level initiative view

---

## Problem Statement

### Current Confusion

Users see convoys on the rig page alongside work items but don't understand the relationship:

```
Current Rig Page:
┌─────────────────────────────────────────────┐
│ Rig: citadel                                │
├─────────────────────────────────────────────┤
│ Workers    Crews    Witness    Refinery     │
│    3         2       Active     Active      │
├─────────────────────────────────────────────┤
│ Convoys (9)                    ← CONFUSING  │
│ ├── Convoy A                                │
│ ├── Convoy B                                │
│ └── ...                                     │
├─────────────────────────────────────────────┤
│ Work Items (25)                             │
│ ├── gt-123: Fix bug                         │
│ ├── gt-124: Add feature      ← No convoy    │
│ └── ...                          indicator  │
└─────────────────────────────────────────────┘
```

**Questions users ask:**
- "Are these convoys specific to this rig?"
- "How do these convoys relate to the work items below?"
- "Which work item belongs to which convoy?"

### Root Cause

The data model is:
```
Convoy (town-level)
  └── contains Beads (work items)
        └── Beads belong to Rigs

NOT:
Rig
  └── contains Convoys
```

Showing convoys on a rig page implies a containment relationship that doesn't exist.

---

## Proposed Solution

### New Mental Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GAS TOWN (global)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  CONVOYS (Initiatives)              RIGS (Infrastructure)           │
│  ┌─────────────────────┐           ┌─────────────────────┐         │
│  │ "Q4 Features"       │           │ citadel             │         │
│  │  ├── gt-123 ────────┼───────────┼── polecat/alpha     │         │
│  │  ├── gt-124 ────────┼───────────┼── polecat/beta      │         │
│  │  └── dc-456 ────────┼───────┐   │                     │         │
│  └─────────────────────┘       │   └─────────────────────┘         │
│                                │                                    │
│  ┌─────────────────────┐       │   ┌─────────────────────┐         │
│  │ "Bug Bash Sprint"   │       │   │ deacon              │         │
│  │  └── dc-789 ────────┼───────┼───┼── polecat/gamma     │         │
│  └─────────────────────┘       └───┼── (dc-456)          │         │
│                                    └─────────────────────┘         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Key insight:**
- Convoys group work *logically* (by initiative/project)
- Rigs group work *physically* (by where it runs)
- A convoy can span rigs; a bead belongs to exactly one rig

---

## Implementation Plan

### Task 1: Remove ConvoyList from Rig Page

**File:** `src/app/rig/[name]/page.tsx`

**Changes:**
- Remove `ConvoyList` import and component
- Remove `useConvoys` hook call
- Simplify the page to show only rig-specific content

**Before:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <WorkerGrid polecats={polecats || []} ... />
  <ConvoyList convoys={convoys || []} ... />  // REMOVE
</div>
```

**After:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <WorkerGrid polecats={polecats || []} ... />
  <RigWorkQueue beads={beadsData?.beads || []} ... />  // NEW: prioritized work queue
</div>
```

**Acceptance Criteria:**
- [ ] Rig page no longer shows ConvoyList
- [ ] No regression in rig stats display
- [ ] Page loads without errors

---

### Task 2: Add Convoy Badge to Bead Components

**Files:**
- `src/components/beads/bead-detail-panel.tsx`
- `src/components/beads/beads-tree.tsx`

**Changes:**

#### 2a. Add convoy_id to Bead type

**File:** `src/lib/gastown.ts` (or wherever Bead type is defined)

```typescript
interface Bead {
  id: string;
  title: string;
  status: BeadStatus;
  // ... existing fields
  convoy_id?: string;      // NEW: Optional convoy membership
  convoy_title?: string;   // NEW: Convoy name for display
}
```

#### 2b. Create ConvoyBadge component

**File:** `src/components/beads/convoy-badge.tsx` (NEW)

```tsx
interface ConvoyBadgeProps {
  convoyId: string;
  convoyTitle?: string;
  size?: "sm" | "md";
}

export function ConvoyBadge({ convoyId, convoyTitle, size = "sm" }: ConvoyBadgeProps) {
  return (
    <Link href={`/convoy/${convoyId}`}>
      <span className="inline-flex items-center gap-1 px-2 py-0.5
                       bg-chrome-dark/50 border border-chrome-border/30
                       rounded text-xs text-ash hover:text-bone
                       hover:border-chrome-border transition-mechanical">
        <Truck className="w-3 h-3" />
        {convoyTitle || convoyId}
      </span>
    </Link>
  );
}
```

#### 2c. Add to BeadDetailPanel

**File:** `src/components/beads/bead-detail-panel.tsx`

In the header/metadata section:
```tsx
{bead.convoy_id && (
  <div className="flex items-center gap-2">
    <span className="label">Initiative:</span>
    <ConvoyBadge
      convoyId={bead.convoy_id}
      convoyTitle={bead.convoy_title}
    />
  </div>
)}
```

#### 2d. Add to BeadsTree rows

**File:** `src/components/beads/beads-tree.tsx`

In each bead row, add convoy indicator:
```tsx
<div className="flex items-center gap-2">
  <span className="font-mono text-sm">{bead.id}</span>
  {bead.convoy_id && (
    <ConvoyBadge convoyId={bead.convoy_id} size="sm" />
  )}
</div>
```

**Acceptance Criteria:**
- [ ] Beads with convoy_id show badge in tree view
- [ ] Beads with convoy_id show convoy in detail panel
- [ ] Clicking badge navigates to convoy page
- [ ] Beads without convoy_id display normally (no badge)

---

### Task 3: Enhance Town Page Convoy Section

**File:** `src/app/page.tsx` (Town/Home page)

**Changes:**
- Ensure ConvoyList is prominently displayed on Town page
- Add convoy creation/management actions
- Show aggregate stats (total beads, progress, cost)

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ GAS TOWN                                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CONVOYS                                          [+ New Convoy] │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │                                                                 │ │
│ │  Q4 Features          ████████░░ 80%    $12.50   5 beads       │ │
│ │  Bug Bash Sprint      ██████████ 100%   $8.20    3 beads       │ │
│ │  Infrastructure       ██░░░░░░░░ 20%    $45.00   12 beads      │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────┐ ┌─────────────────────┐                     │
│ │ RIGS                │ │ RECENT ACTIVITY     │                     │
│ │  citadel (3 workers)│ │  ...                │                     │
│ │  deacon (2 workers) │ │                     │                     │
│ └─────────────────────┘ └─────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Convoys section is prominent on Town page
- [ ] Shows progress, cost, and bead count per convoy
- [ ] Links to convoy detail page

---

### Task 4: Update API to Include Convoy Info on Beads

**File:** `src/app/api/gastown/beads/route.ts` (or gastown.ts)

**Changes:**
- When fetching beads, join with convoy data to include `convoy_id` and `convoy_title`
- This may require:
  - A convoy-to-bead mapping lookup
  - Or adding convoy_id to the bead JSONL schema

**Backend consideration:**
If convoy membership is stored separately (convoy has list of bead IDs), the API needs to reverse-lookup:
```typescript
// For each bead, find which convoy contains it
const beadsWithConvoy = beads.map(bead => ({
  ...bead,
  convoy_id: findConvoyForBead(bead.id),
  convoy_title: getConvoyTitle(findConvoyForBead(bead.id))
}));
```

**Acceptance Criteria:**
- [ ] `/api/gastown/beads` returns convoy_id when bead is in a convoy
- [ ] Convoy title is included for display purposes
- [ ] Performance is acceptable (< 100ms additional latency)

---

## File Summary

### New Files
```
src/components/beads/convoy-badge.tsx
```

### Modified Files
```
src/app/rig/[name]/page.tsx          # Remove ConvoyList
src/app/page.tsx                      # Enhance convoy section
src/components/beads/bead-detail-panel.tsx  # Add convoy badge
src/components/beads/beads-tree.tsx   # Add convoy indicator
src/components/beads/index.ts         # Export ConvoyBadge
src/lib/gastown.ts                    # Add convoy_id to Bead type
src/app/api/gastown/beads/route.ts    # Include convoy in response
```

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| User confusion about convoy location | High | Low |
| Click path: bead → convoy | Not possible | 1 click |
| Convoy visibility on rig page | Misleading | Removed |
| Convoy visibility on town page | Present | Enhanced |

---

## Dependencies

- None (self-contained UI refactor)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing convoy filtering by rig | Medium | Verify Town page shows all convoys correctly |
| Performance hit from convoy lookup | Low | Cache convoy-bead mapping |
| Users expecting convoys on rig page | Low | Add "View all convoys" link on rig page |

---

## Open Questions

1. **Should we add a "View Initiatives" link on the rig page?**
   - Option A: Clean removal, convoys only on Town page
   - Option B: Add small link "Part of X initiatives" that links to Town

2. **How is convoy membership currently stored?**
   - If convoys store bead IDs: Need reverse lookup
   - If beads store convoy_id: Direct access

3. **Should beads be assignable to multiple convoys?**
   - Current assumption: 1 bead → 0 or 1 convoy
   - If N:M needed: Badge becomes list of badges

---

## Appendix: Data Model Reference

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Convoy     │     │    Bead      │     │     Rig      │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ id           │     │ name         │
│ title        │     │ title        │     │ polecats[]   │
│ status       │     │ status       │     │ witness      │
│ bead_ids[]   │────▶│ convoy_id?   │◀────│ refinery     │
│ created_at   │     │ rig          │────▶│ hooks[]      │
└──────────────┘     │ assignee     │     └──────────────┘
                     │ ...          │
                     └──────────────┘

Relationships:
- Convoy 1:N Beads (a convoy contains many beads)
- Bead N:1 Rig (a bead belongs to exactly one rig)
- Convoy spans Rigs (beads in a convoy can be from different rigs)
```
