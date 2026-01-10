# Spec: Guide Tab - Gas Town Operations Manual

> **Phase**: 3 (Onboarding & Documentation)
> **Priority**: P1
> **Status**: Draft
> **Author**: Mayor
> **Date**: 2026-01-09

---

## 1. Problem Statement

Users launching Citadel for the first time face a steep learning curve:

1. **Terminology overload** - Rigs, Convoys, Polecats, Refineries, Witnesses, Beads - what are these?
2. **No mental model** - How does work flow through the system?
3. **Plugin confusion** - What changes when plugins are installed?
4. **Status mystery** - What does "thinking" vs "slow" vs "blocked" mean?
5. **Expectation mismatch** - What should I see happening? Is this working?

The dashboard shows *what* is happening but not *why* or *how*. Users need an operations manual.

---

## 2. Solution: The Guide Tab

A new "Guide" tab in the navigation that provides:

1. **Interactive system overview** - Visual diagram of Gas Town architecture
2. **Entity glossary** - Expandable cards explaining each entity type
3. **Lifecycle visualization** - Animated flow of work through the system
4. **Status reference** - All status states with meanings
5. **Plugin awareness** - Shows installed plugins and their effects
6. **"What to expect"** - Common scenarios and what to look for

### 2.1 Design Philosophy

This is a **Field Manual**, not documentation. It should feel like:
- A laminated quick-reference card in a war rig
- Industrial, scannable, action-oriented
- Visual first, text second
- Contextual - shows what's relevant to YOUR setup

---

## 3. Information Architecture

```
/guide
├── Overview (default view)
│   ├── System Diagram
│   ├── Quick Glossary
│   └── Your Setup Summary
│
├── Entities (expandable sections)
│   ├── Town
│   ├── Rigs
│   ├── Convoys
│   ├── Polecats (Workers)
│   ├── Refinery
│   ├── Witness
│   └── Beads
│
├── Lifecycle
│   ├── Work Flow Animation
│   ├── Stage Explanations
│   └── Status Transitions
│
├── Plugins (dynamic based on installed)
│   ├── Installed Plugins Summary
│   ├── Per-Plugin Explainers
│   └── Plugin Interactions
│
└── Scenarios
    ├── "I just started - what now?"
    ├── "Work is stuck - what's wrong?"
    ├── "How do I know it's working?"
    └── "Something failed - what do I do?"
```

---

## 4. Component Specifications

### 4.1 GuideNav - Section Navigation

Vertical navigation within the Guide tab for switching between sections.

```typescript
interface GuideNavProps {
  sections: GuideSection[]
  activeSection: string
  onSectionChange: (sectionId: string) => void
}

interface GuideSection {
  id: string
  label: string
  icon: IconName
  badge?: string  // e.g., "3 plugins" count
}
```

**Constraints:**
- Must use existing Icon component
- Follows Panel inset pattern for items
- Highlights active section with DS2 accent color

### 4.2 SystemDiagram - Interactive Architecture View

Visual representation of Gas Town architecture with the user's actual data.

```typescript
interface SystemDiagramProps {
  town: TownStatus
  highlightEntity?: EntityType
  onEntityClick?: (entity: EntityType) => void
  animated?: boolean
}

type EntityType = 'town' | 'rig' | 'convoy' | 'polecat' | 'refinery' | 'witness' | 'beads'
```

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│                         TOWN (Gas Town)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Mayor                                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐            │
│         ▼                    ▼                    ▼            │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │    RIG      │     │    RIG      │     │    RIG      │      │
│  │  (citadel)  │     │  (keeper)   │     │  (gastown)  │      │
│  │             │     │             │     │             │      │
│  │ ┌─────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │      │
│  │ │Polecats │ │     │ │Polecats │ │     │ │Polecats │ │      │
│  │ │ (3)     │ │     │ │ (0)     │ │     │ │ (2)     │ │      │
│  │ └─────────┘ │     │ └─────────┘ │     │ └─────────┘ │      │
│  │ ┌─────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │      │
│  │ │Refinery │ │     │ │Refinery │ │     │ │Refinery │ │      │
│  │ └─────────┘ │     │ └─────────┘ │     │ └─────────┘ │      │
│  │ ┌─────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │      │
│  │ │Witness  │ │     │ │Witness  │ │     │ │Witness  │ │      │
│  │ └─────────┘ │     │ └─────────┘ │     │ └─────────┘ │      │
│  └─────────────┘     └─────────────┘     └─────────────┘      │
│                                                                 │
│  ─────────────── CONVOY FLOW ───────────────────────────────▶  │
│  [Beads] → [Claimed] → [Working] → [PR] → [Merged]             │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Clickable entities → opens EntityCard with details
- Animated pulse on active entities
- Real data from useTownStatus hook
- Highlights flow when convoy is selected

**Constraints:**
- Must use DS2 colors exclusively
- SVG-based for crisp rendering
- Accessible: keyboard navigable, proper ARIA labels

### 4.3 EntityCard - Expandable Entity Explainer

Expandable card that explains an entity type with visual examples.

```typescript
interface EntityCardProps {
  entity: EntityType
  expanded?: boolean
  onToggle?: () => void
  liveData?: EntityData  // Shows actual data if available
}
```

**Content Structure per Entity:**

| Entity | What It Is | Visual | Live Data |
|--------|-----------|--------|-----------|
| Town | Your workspace root | Town icon + name | Rig count |
| Rig | Project container | Folder icon | Polecat/convoy counts |
| Convoy | Batch of related work | Truck icon | Issue list, progress |
| Polecat | AI worker agent | Worker icon | Current task, status |
| Refinery | Merge queue processor | Factory icon | Queue depth |
| Witness | Polecat lifecycle manager | Eye icon | Monitored polecats |
| Beads | Issue tracking | Bead icon | Open/closed counts |

**Constraints:**
- Uses Panel component with elevated variant when expanded
- Icon component for all icons
- Collapsible with smooth animation

### 4.4 LifecycleFlow - Animated Work Journey

Shows how work flows through the system with animation.

```typescript
interface LifecycleFlowProps {
  stages: StageDefinition[]
  currentStage?: number  // Highlights current stage
  animated?: boolean
  speed?: 'slow' | 'normal' | 'fast'
}

interface StageDefinition {
  id: string
  label: string
  description: string
  icon: IconName
  actors: string[]  // Who's involved at this stage
}
```

**Stages:**
1. **Queued** - Issue created, waiting for assignment
2. **Claimed** - Polecat picks up the work
3. **Working** - Active implementation (substages: analyzing, coding, testing, pr_prep)
4. **PR** - Pull request submitted, awaiting review
5. **Merged** - Work complete, merged to main

**Visual:**
```
  ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
  │QUEUED│───▶│CLAIMED│───▶│WORKING│───▶│  PR  │───▶│MERGED│
  └──────┘    └──────┘    └──────┘    └──────┘    └──────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              ┌──────────┐        ┌──────────┐
              │Analyzing │        │ Testing  │
              └──────────┘        └──────────┘
              ┌──────────┐        ┌──────────┐
              │ Coding   │        │ PR Prep  │
              └──────────┘        └──────────┘
```

**Constraints:**
- Reuses JourneyTracker component from Phase 2A (if built)
- Or establishes the pattern if JourneyTracker not yet available
- Must use DS2 status colors

### 4.5 StatusReference - Complete Status Guide

Reference card showing all status states with visual examples.

```typescript
interface StatusReferenceProps {
  interactive?: boolean  // Hover for more details
}
```

**Content:**

| Status | Color | Icon | Meaning | What To Do |
|--------|-------|------|---------|------------|
| active | Acid Green | play-circle | Making progress | Nothing - working normally |
| thinking | Ash | brain | Processing, quiet | Wait - agent is thinking |
| slow | Fuel Yellow | clock | Taking longer than expected | Monitor - may need attention soon |
| unresponsive | Rust Orange | exclamation-triangle | No recent activity | Check - may be stuck |
| dead | Red | x-circle | Session terminated | Investigate - check logs |
| blocked | Ash | lock | Waiting on dependency | Unblock - resolve dependency |
| done | Acid Green | check-circle | Completed successfully | Nothing - celebrate! |

**Constraints:**
- Uses existing StatusBadge component for visual examples
- Must match status definitions in frontend.yaml

### 4.6 PluginPanel - Installed Plugins Overview

Shows what plugins are installed and how they affect the system.

```typescript
interface PluginPanelProps {
  plugins: InstalledPlugin[]
}

interface InstalledPlugin {
  name: string
  version: string
  description: string
  effects: PluginEffect[]
  enabled: boolean
}

interface PluginEffect {
  area: 'workflow' | 'ui' | 'behavior' | 'data'
  description: string
}
```

**Known Plugins:**

| Plugin | What It Does | Visual Indicator |
|--------|-------------|------------------|
| Guzzoline | Token efficiency, headless mode | Shows token budget in header |
| Keeper | Governance, seed vault | Shows approval badges on components |
| Hitch | Phase chain automation | Shows phase progression |

**Behavior:**
- Dynamically reads from `~/gt/plugins/` via API
- Shows "No plugins installed" if empty
- Expandable per-plugin details

**Constraints:**
- New API route needed: GET /api/gastown/plugins
- Uses Panel + expandable pattern

### 4.7 ScenarioCard - Common Situations

Answers "what do I do when..." questions.

```typescript
interface ScenarioCardProps {
  scenario: Scenario
  expanded?: boolean
}

interface Scenario {
  id: string
  question: string  // User's question
  situation: string  // What they're seeing
  explanation: string  // Why it's happening
  actions: string[]  // What to do
  relatedEntities: EntityType[]
}
```

**Scenarios to Cover:**

1. **"I just started - what now?"**
   - Situation: Empty dashboard, no activity
   - Explanation: No work dispatched yet
   - Actions: Create beads, dispatch convoy

2. **"Work is stuck - what's wrong?"**
   - Situation: Polecat shows "blocked" or "unresponsive"
   - Explanation: Dependency issue or agent stuck
   - Actions: Check dependencies, nudge polecat

3. **"How do I know it's working?"**
   - Situation: Polecats show "active" or "thinking"
   - Explanation: Agents are processing
   - Actions: Monitor progress, check convoy status

4. **"Something failed - what do I do?"**
   - Situation: Polecat shows "dead"
   - Explanation: Session crashed or was terminated
   - Actions: Check logs, restart polecat

5. **"PRs aren't merging"**
   - Situation: PRs stuck in queue
   - Explanation: Refinery backlog or failures
   - Actions: Check refinery status, review PR

---

## 5. Data Requirements

### 5.1 New API Route

**GET /api/gastown/plugins**

Returns installed plugins and their metadata.

```typescript
interface PluginsResponse {
  plugins: {
    name: string
    version: string
    description: string
    hasClaudeMd: boolean  // Has CLAUDE.md context
    effects: string[]
  }[]
}
```

### 5.2 New Hook

**usePlugins**

```typescript
interface UsePluginsResult {
  data: PluginsResponse | null
  error: Error | null
  isLoading: boolean
  refresh: () => void
}
```

---

## 6. Navigation Integration

### 6.1 Nav Item Addition

Add to `navItems` in `nav.tsx`:

```typescript
{ label: "Guide", href: "/guide", icon: navIcons.guide }
```

### 6.2 Icon Addition

Add "guide" or "book" icon to Icon component:
- Suggested: `BookOpenIcon` from Lucide
- Alternative: `AcademicCapIcon` from Heroicons

### 6.3 Route Structure

```
src/app/guide/
├── page.tsx              # Main guide page with section routing
├── components/
│   ├── guide-nav.tsx
│   ├── system-diagram.tsx
│   ├── entity-card.tsx
│   ├── lifecycle-flow.tsx
│   ├── status-reference.tsx
│   ├── plugin-panel.tsx
│   └── scenario-card.tsx
└── data/
    ├── entities.ts       # Static entity definitions
    ├── scenarios.ts      # Scenario content
    └── stages.ts         # Lifecycle stage definitions
```

---

## 7. Visual Design

### 7.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ GAS TOWN OPERATIONS MANUAL                          [Refresh]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌─────────────────────────────────────────────┐ │
│  │          │  │                                             │ │
│  │  Guide   │  │            MAIN CONTENT AREA                │ │
│  │   Nav    │  │                                             │ │
│  │          │  │   (System Diagram / Entities / Lifecycle    │ │
│  │ Overview │  │    / Plugins / Scenarios based on nav)      │ │
│  │ Entities │  │                                             │ │
│  │ Lifecycle│  │                                             │ │
│  │ Plugins  │  │                                             │ │
│  │ Scenarios│  │                                             │ │
│  │          │  │                                             │ │
│  └──────────┘  └─────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Typography

- Page title: `text-4xl font-bold text-bone`
- Section headers: `.section-header` (uppercase, ash, tracked)
- Entity names: `text-lg font-semibold text-bone`
- Descriptions: `.body-text` or `.body-text-muted`
- Action items: `.label` with bullet points

### 7.3 Color Usage

- Backgrounds: gunmetal variants for cards
- Borders: carbon-black or ash depending on elevation
- Active states: acid-green accent
- Warning/attention: fuel-yellow or rust-orange
- Interactive: highlight-glow on hover

---

## 8. Interaction Design

### 8.1 Default View (Overview)

When user lands on /guide:
1. Show SystemDiagram with their actual rigs
2. Show "Your Setup" summary (X rigs, Y polecats, Z plugins)
3. Show quick glossary of key terms

### 8.2 Entity Deep Dive

When user clicks an entity in the diagram or nav:
1. Expand EntityCard for that entity
2. Show live data if available
3. Link to related entities

### 8.3 Scenario Lookup

When user has a problem:
1. Scenarios section shows question-based cards
2. Expandable to show full explanation
3. Links to relevant dashboard views

---

## 9. Accessibility

- All interactive elements keyboard accessible
- ARIA labels on diagram nodes
- Status colors paired with icons (not color-only)
- Reduced motion option for animations
- Screen reader friendly content structure

---

## 10. Implementation Phases

### Phase 3A: Core Guide (P1)
1. GuideNav component
2. SystemDiagram (static version)
3. EntityCard components
4. StatusReference card
5. Navigation integration

### Phase 3B: Dynamic Content (P1)
1. SystemDiagram with live data
2. LifecycleFlow animation
3. Plugin API + hook
4. PluginPanel component

### Phase 3C: Scenarios (P2)
1. ScenarioCard component
2. Scenario content
3. Deep linking from dashboard

---

## 11. Acceptance Criteria

### Must Have
- [ ] Guide tab appears in navigation
- [ ] System diagram shows actual rig structure
- [ ] All entity types have explainer cards
- [ ] Status reference shows all 7 states with examples
- [ ] Mobile responsive

### Should Have
- [ ] Lifecycle animation working
- [ ] Plugin panel shows installed plugins
- [ ] Click-through from diagram to entity details

### Nice to Have
- [ ] Scenario cards with contextual help
- [ ] Deep links from dashboard (e.g., "What does this status mean?")
- [ ] Print-friendly version

---

## 12. Open Questions

1. **Static vs Dynamic**: Should all content be static markdown or dynamically generated?
   - Recommendation: Mix - entity definitions static, counts/status dynamic

2. **Plugin Detection**: How to reliably detect installed plugins from frontend?
   - Recommendation: New API route that reads ~/gt/plugins/

3. **Localization**: Any need for multiple languages?
   - Recommendation: English only for v1

4. **Search**: Should guide content be searchable?
   - Recommendation: Defer to Phase 4

---

## 13. Dependencies

- **Phase 2A (JourneyTracker)**: Can reuse for LifecycleFlow, or build pattern here first
- **Existing components**: Panel, Icon, StatusBadge, ActionButton
- **API**: New /api/gastown/plugins endpoint

---

## 14. Keeper Considerations

### New Components Proposed

| Component | Type | Justification |
|-----------|------|---------------|
| GuideNav | New seed | No existing vertical nav pattern |
| SystemDiagram | New seed | No existing diagram/visualization component |
| EntityCard | Extension of Panel | Follows Panel + expandable pattern |
| LifecycleFlow | Composition | Uses JourneyTracker or similar |
| StatusReference | Composition | Uses StatusBadge, Panel |
| PluginPanel | Extension of Panel | Follows Panel + expandable pattern |
| ScenarioCard | Extension of Panel | Follows Panel + expandable pattern |

### Potentially Reusable Patterns

- **Vertical nav**: GuideNav could become generic SideNav
- **Expandable card**: EntityCard pattern could be promoted
- **Diagram component**: SystemDiagram establishes visualization pattern

---

## 15. Related Documents

- `docs/spec-journey-visibility.md` - Phase 2 spec (JourneyTracker)
- `keeper/seeds/frontend.yaml` - Existing component registry
- `keeper/decisions/003-phase2-components.md` - Phase 2 approvals
- `docs/design-system.md` - DS2 visual guidelines
