# ADR-003: Phase 2 Component Approval

## Status
Accepted

## Date
2026-01-09

## Context

Phase 2 of Citadel introduces three new capability areas:
- **2A**: Journey Visualization (stage-by-stage work lifecycle)
- **2B**: Enhanced Cost Tracking (per-entity token usage)
- **2C**: Git Diff Viewer (code changes per worker)

These components were proposed in `docs/spec-journey-visibility.md` and registered as `proposed` in the Founding Convoy (ADR-002).

The Keeper must now review each component against the decision matrix to approve, reject, or require modifications.

## Keeper Review

### Phase 2A: Journey Visualization

#### JourneyTracker

| Question | Answer | Decision |
|----------|--------|----------|
| Component exists? | No | Continue |
| Similar pattern exists? | Gauge shows progress, but not stages | New seed needed |
| Breaks design system? | No - uses DS2 colors, Panel container | Approve |

**Decision**: **APPROVED** as new seed

**Rationale**: No existing component for stage-based lifecycle visualization. Uses approved patterns (DS2 colors, Icon, Panel).

**Constraints**:
- Must use DS2 status colors for stage indicators
- Must use Icon component for stage icons
- Stages limited to 5 (queued, claimed, working, pr, merged)

#### ConvoyJourney

| Question | Answer | Decision |
|----------|--------|----------|
| Component exists? | No | Continue |
| Extension of existing? | Aggregates JourneyTracker data | Composition |
| Breaks design system? | No | Approve |

**Decision**: **APPROVED** as composition of JourneyTracker + Gauge

**Rationale**: Combines approved patterns (JourneyTracker for stage view, Gauge for progress).

---

### Phase 2B: Cost Tracking

#### CostPanel

| Question | Answer | Decision |
|----------|--------|----------|
| Component exists? | Panel exists | Reuse Panel |
| Extension needed? | Yes - cost-specific content | Extension |
| Extension breaks design system? | No | Approve extension |

**Decision**: **APPROVED** as extension of Panel

**Rationale**: Uses existing Panel component with cost-specific children. Not a new component - composition pattern.

**Implementation**:
```tsx
// NOT a new component - use Panel directly
<Panel>
  <PanelHeader title="GUZZOLINE" icon="activity" />
  <PanelBody>
    {/* Cost content here */}
  </PanelBody>
</Panel>
```

#### CostSparkline

| Question | Answer | Decision |
|----------|--------|----------|
| Component exists? | Gauge exists for progress | Review |
| Is this an extension of Gauge? | No - different purpose (value display vs progress) | New seed |
| Breaks design system? | No - uses DS2 typography | Approve |

**Decision**: **APPROVED** as new seed (not Gauge extension)

**Rationale**: Gauge is for progress (0-100%). CostSparkline is for value display with optional trend. Different semantics warrant new seed.

**Constraints**:
- Must use DS2 typography (data-value, label classes)
- Trend indicators must use DS2 colors (acid-green up, rust-orange down)
- No custom colors

#### CostChart

| Question | Answer | Decision |
|----------|--------|----------|
| Component exists? | No chart components | Continue |
| Breaks design system? | Could if not careful | Conditional |

**Decision**: **APPROVED** with constraints

**Constraints**:
- Must use DS2 colors only (bone for data, ash for axes, gunmetal for background)
- No gradients or shadows
- Simple bar/line charts only
- Must fit within Panel component

---

### Phase 2C: Git Diff Viewer

#### DiffViewer

| Question | Answer | Decision |
|----------|--------|----------|
| Component exists? | No | Continue |
| Breaks design system? | Potential - syntax highlighting | Conditional |

**Decision**: **APPROVED** with constraints

**Constraints**:
- Must use DS2 base colors for diff chrome (backgrounds, borders)
- Diff colors: acid-green/15% for additions, red/15% for deletions
- Code text must use monospace font (already in DS2)
- Must wrap in Panel component

#### CommitList

| Question | Answer | Decision |
|----------|--------|----------|
| Component exists? | No list pattern defined | Continue |
| Similar to existing patterns? | Similar to convoy/worker lists | Establish pattern |

**Decision**: **APPROVED** - establishes list item pattern

**Rationale**: First formal list item component. Establishes pattern for future lists.

**Constraints**:
- Must follow Panel inset pattern for items
- Must use Icon for commit indicators
- Must use DS2 typography (label for metadata, body-text for message)

#### FileChangeList

| Question | Answer | Decision |
|----------|--------|----------|
| Component exists? | CommitList approved | Extension |
| Extension of CommitList? | Similar pattern | Approve |

**Decision**: **APPROVED** as list pattern variant

---

## Summary

### Approved Components

| Component | Type | Phase | Constraints |
|-----------|------|-------|-------------|
| JourneyTracker | New seed | 2A | DS2 colors, 5 stages max |
| ConvoyJourney | Composition | 2A | Uses JourneyTracker + Gauge |
| CostSparkline | New seed | 2B | DS2 typography, trend colors |
| CostChart | New seed | 2B | DS2 colors only, simple charts |
| DiffViewer | New seed | 2C | DS2 colors, monospace, in Panel |
| CommitList | New seed | 2C | List pattern, Panel inset |
| FileChangeList | Pattern variant | 2C | Follows CommitList pattern |

### Reuse Existing (No New Seed)

| Proposed | Decision | Use Instead |
|----------|----------|-------------|
| CostPanel | Not a new component | Panel + PanelHeader + PanelBody |

### New Hooks

| Hook | Purpose | Approved |
|------|---------|----------|
| useWorkerGit | Fetch worker git activity | Yes |

### New Types

| Type | Purpose | Approved |
|------|---------|----------|
| JourneyStage | Stage enum | Yes |
| WorkingSubstage | Substage enum | Yes |
| IssueCost | Per-issue cost | Yes |
| ConvoyCost | Per-convoy cost | Yes |
| WorkerGitActivity | Git activity data | Yes |
| Commit | Git commit data | Yes |
| FileChange | File diff data | Yes |

---

## Consequences

### Positive
- Clear approval for Phase 2 implementation
- Constraints ensure DS2 consistency
- Reuse enforced (CostPanel → Panel)
- List pattern established for future use

### Negative
- 6 new component seeds adds complexity
- Chart component introduces new visual territory
- Diff syntax highlighting needs careful DS2 integration

### Next Steps
1. Update `seeds/frontend.yaml` - move approved components from `proposed` to `components`
2. Update `seeds/data.yaml` - add approved types
3. Create beads issues using `docs/beads-batch-phase2.md`
4. Dispatch convoy to polecats

---

## Keeper Output

```yaml
keeper_decision:
  status: approved
  reuse:
    frontend:
      - Panel (for CostPanel)
      - Gauge (in ConvoyJourney)
      - Icon (in all components)
      - StatusBadge (in JourneyTracker)
  new_seeds:
    frontend:
      - JourneyTracker
      - ConvoyJourney
      - CostSparkline
      - CostChart
      - DiffViewer
      - CommitList
      - FileChangeList
    hooks:
      - useWorkerGit
    data:
      - JourneyStage (enum)
      - WorkingSubstage (enum)
      - IssueCost
      - ConvoyCost
      - WorkerGitActivity
      - Commit
      - FileChange
  forbidden:
    - CostPanel as new component (use Panel composition)
    - Custom colors outside DS2
    - Circular/radial progress indicators
    - Complex chart types (pie, radar, etc.)
  constraints:
    DiffViewer:
      - additions: "rgba(39, 174, 96, 0.15)"
      - deletions: "rgba(239, 68, 68, 0.15)"
    CostChart:
      - colors: [bone, ash, gunmetal]
      - types: [bar, line]
    JourneyTracker:
      - max_stages: 5
```
