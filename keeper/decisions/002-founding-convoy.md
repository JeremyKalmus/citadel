# ADR-002: Founding Convoy

## Status
Accepted

## Date
2026-01-09

## Context
Citadel (Gas Town Dashboard) was developed without proper Keeper governance. Phase 0 (Foundation) and most of Phase 1 (Town Overview) were completed with established patterns but no formal seed registry.

The project needs:
1. Retroactive documentation of existing patterns
2. Proper Keeper structure for governance
3. Framework for Phase 2 component proposals

## Founding Convoy Roles

### 1. Cartographer (Domain Boundaries)

**Domain Definition**: Citadel is a read-only monitoring dashboard for Gas Town operations.

**Core Entities**:
| Entity | Description | Persistence |
|--------|-------------|-------------|
| Town | Top-level overview | - |
| Rig | Project container | Persistent |
| Convoy | Batch work unit | Ephemeral |
| Polecat | Worker agent | Ephemeral |
| Refinery | Merge queue processor | Persistent |
| Guzzoline | Token usage tracking | Aggregated |

**Boundaries**:
- IS: Display real-time status, progressive disclosure, token tracking
- IS NOT: Control actions (future), authentication, data persistence

**Design System**: DS2 (Black & Chrome Edition) - established in ADR-001

### 2. Seed Planter (Initial Seeds)

**Frontend Components** (6 core + 3 layout):
| Component | Variants | Location |
|-----------|----------|----------|
| Panel | default, elevated, inset | src/components/ui/panel.tsx |
| StatusBadge | 7 status states | src/components/ui/status-badge.tsx |
| Gauge | sm, md, lg | src/components/ui/gauge.tsx |
| ActionButton | default, danger, ghost | src/components/ui/action-button.tsx |
| Icon | 5 variants, 18 icons | src/components/ui/icon.tsx |
| Header | - | src/components/layout/header.tsx |
| Nav | - | src/components/layout/nav.tsx |
| Breadcrumb | - | src/components/layout/breadcrumb.tsx |

**Backend Routes** (4 GET endpoints):
| Route | Purpose |
|-------|---------|
| GET /api/gastown/status | Town overview |
| GET /api/gastown/convoys | Convoy list |
| GET /api/gastown/polecats | Worker list |
| GET /api/gastown/guzzoline | Token stats |

**Data Types** (11 interfaces, 4 enums):
- Core: TownStatus, Rig, Convoy, Polecat, Agent
- Support: Overseer, Hook, MergeQueue, TokenUsage, GuzzolineStats
- Enums: AgentRole, Status, IconName, IconVariant

**Auth Model**: None (read-only local dashboard)

### 3. First Keeper (Review & Approval)

**Approved Seeds**:
- All 6 core UI components registered in `seeds/frontend.yaml`
- All 3 layout components registered
- All 4 API routes registered in `seeds/backend.yaml`
- All types and enums registered in `seeds/data.yaml`
- No auth patterns (documented in `seeds/auth.yaml`)

**Rejected/Deferred**:
- Phase 2 components (JourneyTracker, CostPanel, DiffViewer) marked as `proposed`
- These require separate Keeper review before implementation

**Mode Selection**: `seeding`
- Project is still evolving (Phase 1 ~70% complete)
- New patterns being established
- Flexibility needed for Phase 2 additions
- Transition to `growth` after Phase 2 stabilizes

## Decision

### Initial Seed Vault Structure

```
citadel/keeper/
├── keeper.yaml              # Config (mode: seeding)
├── seeds/
│   ├── frontend.yaml        # 9 components, 4 hooks
│   ├── backend.yaml         # 4 routes, 1 service
│   ├── data.yaml            # 11 types, 4 enums
│   └── auth.yaml            # None (documented)
└── decisions/
    ├── 001-ds2-color-system.md
    └── 002-founding-convoy.md (this document)
```

### Governance Rules (Effective Immediately)

1. **New components** must be reviewed against `seeds/frontend.yaml`
2. **New routes** must follow patterns in `seeds/backend.yaml`
3. **New types** must be registered in `seeds/data.yaml`
4. **Proposed seeds** (marked `proposed:` in YAMLs) require ADR approval

### Phase 2 Component Proposal Status

| Component | Phase | Status | Next Step |
|-----------|-------|--------|-----------|
| JourneyTracker | 2A | Proposed | Requires ADR-003 |
| ConvoyJourney | 2A | Proposed | Requires ADR-003 |
| CostPanel | 2B | Proposed | May extend Panel |
| CostSparkline | 2B | Proposed | Review vs Gauge |
| DiffViewer | 2C | Proposed | Requires ADR-004 |
| CommitList | 2C | Proposed | Requires ADR-004 |

## Consequences

### Positive
- Existing patterns now documented and searchable
- Clear framework for Phase 2 proposals
- Keeper can enforce consistency going forward
- Seeding mode allows necessary flexibility

### Negative
- Retroactive documentation may miss nuances
- Some existing code may not perfectly match documented patterns
- Overhead of ADR process for new patterns

### Migration
- No code changes required
- Existing components already follow documented patterns
- Future work must go through Keeper review

## Output

```yaml
rig_status: seeded

initial_seeds:
  frontend:
    - Panel
    - StatusBadge
    - Gauge
    - ActionButton
    - Icon
    - Header
    - Nav
    - Breadcrumb
  backend:
    - GET /api/gastown/status
    - GET /api/gastown/convoys
    - GET /api/gastown/polecats
    - GET /api/gastown/guzzoline
    - GasTownClient
  data:
    - TownStatus
    - Rig
    - Convoy
    - Polecat
    - Agent
    - GuzzolineStats
    - Status (enum)
    - AgentRole (enum)
    - IconName (enum)
  auth:
    - none (read-only dashboard)

keeper_active: true
mode: seeding
next_convoy_requires_keeper: true
```

## References

- [keeper-spec.md](../../keeper/keeper-spec.md) Section 11: Founding Ritual
- [ADR-001: DS2 Color System](001-ds2-color-system.md)
- [spec-journey-visibility.md](../../docs/spec-journey-visibility.md) - Phase 2 proposal
