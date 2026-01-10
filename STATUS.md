# Citadel Status Index

> **Last Updated**: 2026-01-09
> **Keeper Mode**: `seeding`
> **Current Phase**: 1 (~70% complete), Phase 2 approved

---

## Quick Reference: What to Read

| If you want to... | Read this |
|-------------------|-----------|
| See approved components | `keeper/seeds/frontend.yaml` |
| Create beads issues | `docs/beads-batch-phase2.md` (**READY**) |
| Understand Phase 2 spec | `docs/spec-journey-visibility.md` |
| Review Keeper decisions | `keeper/decisions/003-phase2-components.md` |
| Review Beads visibility spec | `docs/spec-beads-visibility.md` (**DRAFT** - needs Keeper) |
| Review Refinery visibility spec | `docs/spec-refinery-visibility.md` (**DRAFT** - needs Keeper) |
| Review Phase 3 Guide spec | `docs/spec-guide-tab.md` (**DRAFT** - needs Keeper) |

---

## Current Workflow Status

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CURRENT STATE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Founding Convoy    ✅ COMPLETE (ADR-002)                                 │
│                                                                              │
│  2. Phase 2 Spec       ✅ WRITTEN                                            │
│                                                                              │
│  3. Keeper Review      ✅ APPROVED (ADR-003)                                 │
│                                                                              │
│  4. Beads Creation     🔶 READY (use docs/beads-batch-phase2.md)            │
│                                                                              │
│  5. Mayor Dispatch     ⏳ NEXT (after beads created)                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Next Action**: Run the `bd create` commands from `docs/beads-batch-phase2.md`

---

## Document Status

### Keeper (Source of Truth)

| File | Status | What it contains |
|------|--------|------------------|
| `keeper/keeper.yaml` | **ACTIVE** | Config: mode=seeding |
| `keeper/seeds/frontend.yaml` | **ACTIVE** | 15 components (9 existing + 6 Phase 2) |
| `keeper/seeds/backend.yaml` | **ACTIVE** | 4 API routes |
| `keeper/seeds/data.yaml` | **ACTIVE** | 11 types, 4 enums |
| `keeper/seeds/auth.yaml` | **ACTIVE** | None (read-only dashboard) |

### Approved Decisions (ADRs)

| File | Status | Decision |
|------|--------|----------|
| `keeper/decisions/001-ds2-color-system.md` | **APPROVED** | DS2 color palette |
| `keeper/decisions/002-founding-convoy.md` | **APPROVED** | Initial seed vault |
| `keeper/decisions/003-phase2-components.md` | **APPROVED** | Phase 2 components |

### Ready to Execute

| File | Status | Purpose |
|------|--------|---------|
| `docs/beads-batch-phase2.md` | **READY** | `bd create` commands for 30 tasks |
| `docs/spec-journey-visibility.md` | **REFERENCE** | Detailed component specs |

### Pending Keeper Review

| File | Status | Purpose |
|------|--------|---------|
| `docs/spec-beads-visibility.md` | **DRAFT** | Phase 2D: Beads inventory (Rig→Epic→Issue) |
| `docs/spec-refinery-visibility.md` | **DRAFT** | Phase 2E: Merge queue & PR status |
| `docs/spec-guide-tab.md` | **DRAFT** | Phase 3: Guide/Operations Manual tab |

### Reference Only (Don't Need Active Review)

| File | Purpose |
|------|---------|
| `docs/command-center-phases.yaml` | Original phase roadmap |
| `docs/dashboard-redesign.md` | Original UX vision |
| `docs/design-system.md` | DS2 visual design guide |

---

## Component Status Summary

### Phase 1 (Existing - Approved)

| Component | Location | Storybook |
|-----------|----------|-----------|
| Panel | src/components/ui/panel.tsx | Yes |
| StatusBadge | src/components/ui/status-badge.tsx | Yes |
| Gauge | src/components/ui/gauge.tsx | Yes |
| ActionButton | src/components/ui/action-button.tsx | Yes |
| Icon | src/components/ui/icon.tsx | Yes |
| Header | src/components/layout/header.tsx | No |
| Nav | src/components/layout/nav.tsx | No |
| Breadcrumb | src/components/layout/breadcrumb.tsx | No |

### Phase 2 (Approved - To Be Built)

| Component | Phase | Location (planned) | Status |
|-----------|-------|-------------------|--------|
| JourneyTracker | 2A | src/components/journey/journey-tracker.tsx | **APPROVED** |
| ConvoyJourney | 2A | src/components/journey/convoy-journey.tsx | **APPROVED** |
| CostSparkline | 2B | src/components/cost/cost-sparkline.tsx | **APPROVED** |
| CostChart | 2B | src/components/cost/cost-chart.tsx | **APPROVED** |
| DiffViewer | 2C | src/components/git/diff-viewer.tsx | **APPROVED** |
| CommitList | 2C | src/components/git/commit-list.tsx | **APPROVED** |
| FileChangeList | 2C | src/components/git/file-change-list.tsx | **APPROVED** |

### Rejected

| Proposed | Decision | Use Instead |
|----------|----------|-------------|
| CostPanel | Not a new component | Panel + PanelHeader + PanelBody |

---

## Beads Task Summary

From `docs/beads-batch-phase2.md`:

| Phase | Tasks | Priority |
|-------|-------|----------|
| 2A: Journey | 8 tasks | P1 |
| 2B: Cost | 12 tasks | P1 |
| 2C: Git | 10 tasks | P2 |
| **Total** | **30 tasks** | |

### Polecat Assignment Strategy

| Workstream | Polecat | Focus |
|------------|---------|-------|
| Journey | polecat-alpha | JV-001 → JV-008 |
| Cost | polecat-beta | CT-001 → CT-012 |
| Git | polecat-gamma | GD-001 → GD-010 |

---

## Files You Can Ignore

These are reference/historical - incorporated into Keeper decisions:

- `docs/dashboard-redesign.md` - Superseded by spec + ADRs
- `docs/design-system.md` - Superseded by ADR-001
- `docs/command-center-phases.yaml` - Being replaced by beads tracking
