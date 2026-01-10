# Beads Batch: Citadel Phase 2 Enhancements

> **Purpose**: Quick-reference for mayor to create beads issues
> **Total Issues**: ~30 tasks across 3 parallel workstreams
> **Priority Order**: 2A and 2B in parallel (P1), then 2C (P2)

---

## Batch Creation Commands

### Phase 2A: Journey Visualization (P1)

```bash
# Core types and logic
bd create --title="JV-001: Define JourneyStage enum and types" --type=task --priority=1
bd create --title="JV-003: Create stage detection logic in gastown.ts" --type=task --priority=1

# Components
bd create --title="JV-002: Create JourneyTracker component" --type=task --priority=1
bd create --title="JV-005: Create ConvoyJourney aggregate component" --type=task --priority=2

# Integration
bd create --title="JV-004: Add journey data to worker detail view" --type=task --priority=1
bd create --title="JV-006: Add journey to convoy list display" --type=task --priority=2
bd create --title="JV-007: Create journey timeline for issue detail" --type=task --priority=2
bd create --title="JV-008: Add substage detection (2a-2d)" --type=task --priority=3
```

### Phase 2B: Enhanced Cost Tracking (P1)

```bash
# Core types and calculation
bd create --title="CT-001: Define EnhancedGuzzolineStats types" --type=task --priority=1
bd create --title="CT-002: Parse per-issue token usage from events" --type=task --priority=1
bd create --title="CT-003: Calculate USD cost from token counts" --type=task --priority=1

# Components
bd create --title="CT-004: Create CostSparkline component" --type=task --priority=1
bd create --title="CT-005: Create CostPanel component" --type=task --priority=1
bd create --title="CT-008: Create hourly usage chart component" --type=task --priority=2

# Breakdown views
bd create --title="CT-006: Add cost breakdown by convoy" --type=task --priority=2
bd create --title="CT-007: Add cost breakdown by worker" --type=task --priority=2

# Integration
bd create --title="CT-009: Add cost to worker cards" --type=task --priority=2
bd create --title="CT-010: Add cost to convoy rows" --type=task --priority=2
bd create --title="CT-011: Add cost efficiency metrics" --type=task --priority=3
bd create --title="CT-012: Add budget warning thresholds" --type=task --priority=3
```

### Phase 2C: Git Diff Viewer (P2)

```bash
# Core types and parsing
bd create --title="GD-001: Define WorkerGitActivity types" --type=task --priority=1
bd create --title="GD-002: Create git activity parser in gastown.ts" --type=task --priority=1

# Components
bd create --title="GD-003: Create DiffViewer component" --type=task --priority=1
bd create --title="GD-004: Add syntax highlighting for diffs" --type=task --priority=1
bd create --title="GD-005: Create CommitList component" --type=task --priority=2
bd create --title="GD-006: Create FileChangeList component" --type=task --priority=2
bd create --title="GD-008: Create expandable file diff view" --type=task --priority=2

# Integration
bd create --title="GD-007: Add git activity to worker detail view" --type=task --priority=2
bd create --title="GD-009: Add git stats to worker cards" --type=task --priority=3
bd create --title="GD-010: Add PR link integration" --type=task --priority=3
```

---

## Dependencies Setup

After creating issues, set up dependency chains:

```bash
# Phase 2A dependencies
bd dep add <JV-002> <JV-001>  # JourneyTracker depends on types
bd dep add <JV-004> <JV-002>  # Worker detail depends on JourneyTracker
bd dep add <JV-004> <JV-003>  # Worker detail depends on detection logic
bd dep add <JV-005> <JV-002>  # ConvoyJourney depends on JourneyTracker
bd dep add <JV-006> <JV-005>  # Convoy list depends on ConvoyJourney
bd dep add <JV-007> <JV-002>  # Timeline depends on JourneyTracker
bd dep add <JV-008> <JV-003>  # Substage depends on detection logic

# Phase 2B dependencies
bd dep add <CT-002> <CT-001>  # Parsing depends on types
bd dep add <CT-003> <CT-001>  # Cost calc depends on types
bd dep add <CT-004> <CT-003>  # Sparkline depends on cost calc
bd dep add <CT-005> <CT-003>  # Panel depends on cost calc
bd dep add <CT-005> <CT-004>  # Panel uses Sparkline
bd dep add <CT-006> <CT-002>  # Convoy breakdown depends on parsing
bd dep add <CT-007> <CT-002>  # Worker breakdown depends on parsing
bd dep add <CT-008> <CT-002>  # Chart depends on parsing
bd dep add <CT-009> <CT-004>  # Worker cards depends on Sparkline
bd dep add <CT-010> <CT-004>  # Convoy rows depends on Sparkline
bd dep add <CT-011> <CT-002>  # Efficiency depends on parsing
bd dep add <CT-011> <CT-007>  # Efficiency depends on worker breakdown
bd dep add <CT-012> <CT-005>  # Budget warning depends on Panel

# Phase 2C dependencies
bd dep add <GD-002> <GD-001>  # Parser depends on types
bd dep add <GD-003> <GD-001>  # DiffViewer depends on types
bd dep add <GD-004> <GD-003>  # Syntax highlighting depends on DiffViewer
bd dep add <GD-005> <GD-001>  # CommitList depends on types
bd dep add <GD-006> <GD-003>  # FileChangeList depends on DiffViewer
bd dep add <GD-007> <GD-002>  # Worker detail depends on parser
bd dep add <GD-007> <GD-003>  # Worker detail depends on DiffViewer
bd dep add <GD-008> <GD-006>  # Expandable view depends on FileChangeList
bd dep add <GD-009> <GD-002>  # Worker cards depends on parser
bd dep add <GD-010> <GD-002>  # PR link depends on parser
```

---

## Polecat Assignment Strategy

### Parallel Workstreams (3 polecats max)

| Workstream | Polecat | Focus |
|------------|---------|-------|
| **Journey** | polecat-alpha | JV-001 → JV-002 → JV-004 → JV-005 → JV-006 |
| **Cost** | polecat-beta | CT-001 → CT-002 → CT-003 → CT-004 → CT-005 |
| **Git** | polecat-gamma | GD-001 → GD-002 → GD-003 → GD-004 |

### Sequential P2/P3 Work

After P1 complete, assign P2 and P3 tasks to available polecats:

```
JV-007, JV-008 → next available
CT-006, CT-007, CT-008 → next available
CT-009, CT-010, CT-011, CT-012 → next available
GD-005, GD-006, GD-007, GD-008 → next available
GD-009, GD-010 → next available
```

---

## Convoy Structure

Create a convoy to track this work:

```bash
# Option 1: Single convoy for all Phase 2
bd convoy create --title="Phase 2: UI/UX Enhancements" --issues=JV-*,CT-*,GD-*

# Option 2: Separate convoys per workstream
bd convoy create --title="Phase 2A: Journey Visualization" --issues=JV-*
bd convoy create --title="Phase 2B: Cost Tracking" --issues=CT-*
bd convoy create --title="Phase 2C: Git Diffs" --issues=GD-*
```

---

## Acceptance Criteria Checklist

### Phase 2A Complete When:
- [ ] `src/components/journey/journey-tracker.tsx` exists and renders
- [ ] `src/components/journey/convoy-journey.tsx` exists and renders
- [ ] Worker detail page shows journey progression
- [ ] Convoy list shows stage distribution
- [ ] Storybook stories for all journey components

### Phase 2B Complete When:
- [ ] `src/components/cost/cost-panel.tsx` exists and renders
- [ ] `src/components/cost/cost-sparkline.tsx` exists and renders
- [ ] `/api/gastown/guzzoline?breakdown=issue` returns data
- [ ] Worker cards show inline cost
- [ ] Convoy rows show inline cost
- [ ] Storybook stories for all cost components

### Phase 2C Complete When:
- [ ] `src/components/git/diff-viewer.tsx` exists and renders
- [ ] `src/components/git/commit-list.tsx` exists and renders
- [ ] `/api/gastown/workers/:name/git` returns data
- [ ] Worker detail page shows git activity
- [ ] Diffs have syntax highlighting
- [ ] Storybook stories for all git components

---

## Quick Reference: Component → File Mapping

| Component | Path |
|-----------|------|
| JourneyTracker | `src/components/journey/journey-tracker.tsx` |
| ConvoyJourney | `src/components/journey/convoy-journey.tsx` |
| JourneyTimeline | `src/components/journey/journey-timeline.tsx` |
| CostPanel | `src/components/cost/cost-panel.tsx` |
| CostSparkline | `src/components/cost/cost-sparkline.tsx` |
| CostChart | `src/components/cost/cost-chart.tsx` |
| DiffViewer | `src/components/git/diff-viewer.tsx` |
| CommitList | `src/components/git/commit-list.tsx` |
| FileChangeList | `src/components/git/file-change-list.tsx` |
| DiffLine | `src/components/git/diff-line.tsx` |

---

## Quick Reference: API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/gastown/guzzoline` | GET | Token stats (existing, enhance) |
| `/api/gastown/guzzoline?breakdown=issue,convoy,worker` | GET | Detailed breakdown (new) |
| `/api/gastown/workers/:name/git` | GET | Worker git activity (new) |
| `/api/gastown/workers/:name/git/diff` | GET | Full diff for worker (new) |

---

*Ready for mayor dispatch*
