# Citadel

Dashboard UI for [Gas Town](https://github.com/anthropics/gastown) - the multi-agent workspace manager.

Citadel provides real-time visibility into your Gas Town operations: convoy progress, polecat status, rig health, and work queue management. Built with the Black & Chrome design system.

## What It Does

```
┌─────────────────────────────────────────────────────────────────┐
│  CITADEL                                              Gas Town  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Town Overview                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ 3 Rigs   │  │ 5 Convoys│  │12 Workers│                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                 │
│  Active Convoys                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🚚 Dashboard V2    ████████████░░░░  75%  ● active     │   │
│  │ 🚚 API Refactor    ██████░░░░░░░░░░  40%  ● thinking   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Town Overview** - High-level stats across all rigs
- **Convoy Tracking** - Progress on batch work with drill-down
- **Polecat Status** - Real-time worker health (7-state model)
- **Rig Details** - Per-project view of workers and queues

## How It Fits With Gas Town

```
Gas Town Architecture
─────────────────────
                    ┌─────────────┐
                    │   CITADEL   │  ← You are here (Dashboard)
                    │  (UI Layer) │
                    └──────┬──────┘
                           │ reads status
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                      GAS TOWN CORE                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Mayor  │  │  Rigs   │  │ Convoys │  │  Beads  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│       │            │            │            │              │
│       └────────────┴────────────┴────────────┘              │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────┐            │
│  │              Per-Rig Agents                  │            │
│  │  ┌─────────┐  ┌──────────┐  ┌───────────┐  │            │
│  │  │Polecats │  │ Refinery │  │  Witness  │  │            │
│  │  │(workers)│  │ (merge)  │  │ (monitor) │  │            │
│  │  └─────────┘  └──────────┘  └───────────┘  │            │
│  └──────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

Citadel is a **read-only dashboard** - it displays Gas Town status but doesn't control it. Use `gt` CLI commands or the Mayor for orchestration.

## Installation

### Prerequisites

- Node.js 20+
- Gas Town installed and running
- A rig to install Citadel into

### Manual Installation

```bash
# 1. Clone the repository
git clone https://github.com/JeremyKalmus/citadel.git
cd citadel

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

### View Component Library (Storybook)

```bash
npm run storybook
# Opens http://localhost:6006
```

## Design System

Citadel uses the **Black & Chrome** design system - a Mad Max-inspired aesthetic for industrial dashboard UI.

### Status States (7-State Model)

| Status | Color | Meaning |
|--------|-------|---------|
| `active` | Green | Working normally |
| `thinking` | Blue | Processing/planning |
| `slow` | Amber | Degraded performance |
| `unresponsive` | Orange | Not responding |
| `dead` | Red | Failed/crashed |
| `blocked` | Purple | Waiting on dependency |
| `done` | Emerald | Completed |

### Core Components

- **StatusBadge** - Display agent/worker status
- **Gauge** - Progress indicators (sm/md/lg)
- **ActionButton** - User actions (default/danger/ghost)
- **Panel** - Content containers (default/elevated/inset)

See all components in Storybook: `npm run storybook`

## Project Structure

```
citadel/
├── src/
│   ├── app/              # Next.js pages
│   │   └── page.tsx      # Town Overview
│   ├── components/
│   │   ├── ui/           # Core components
│   │   │   ├── status-badge.tsx
│   │   │   ├── gauge.tsx
│   │   │   ├── action-button.tsx
│   │   │   └── panel.tsx
│   │   └── layout/       # Layout components
│   │       ├── header.tsx
│   │       ├── nav.tsx
│   │       └── breadcrumb.tsx
│   └── lib/              # Utilities
├── .storybook/           # Storybook config
├── plugin.yaml           # Gas Town plugin manifest
└── package.json
```

## Roadmap

- [x] **Phase 0**: Foundation - Core components and design system
- [ ] **Phase 1**: Data Integration - Connect to live Gas Town data
- [ ] **Phase 2**: Interactive Features - Actions and real-time updates
- [ ] **Phase 3**: Advanced Views - Drill-down pages for rigs/workers/beads

## Related Projects

- [Gas Town](https://github.com/anthropics/gastown) - Multi-agent workspace manager
- [Keeper](https://github.com/JeremyKalmus/keeper) - Governance plugin for design consistency
- [Beads](https://github.com/anthropics/beads) - Issue tracking for AI agents

## License

MIT
