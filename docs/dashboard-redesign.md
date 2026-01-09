# Gas Town Dashboard Redesign

> Design document for a complete dashboard rethink focused on clarity, progressive disclosure, and actionable insights.

## Problem Statement

The current dashboard is confusing because:
1. **False "stuck" alerts** - Shows "stuck" when work is just taking time
2. **No progressive disclosure** - All information at once, no drill-down
3. **Poll-based refresh** - Auto-refresh every 10s creates anxiety, not insight
4. **Unclear hierarchy** - Hard to understand who does what
5. **No clear actions** - User sees problems but doesn't know what to do

---

## System Mental Model

### The Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         TOWN                                 │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │   Mayor     │  │   Deacon    │   Town-level coordinators │
│  │ (dispatch)  │  │ (heartbeat) │                           │
│  └─────────────┘  └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      RIG (per project)                       │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │  Witness    │  │  Refinery   │   Rig-level managers      │
│  │ (monitors)  │  │  (merges)   │                           │
│  └──────┬──────┘  └─────────────┘                           │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────┬─────────────┬─────────────┐                │
│  │  Polecat 1  │  Polecat 2  │  Polecat 3  │  Workers      │
│  │  (working)  │  (idle)     │  (done)     │                │
│  └─────────────┴─────────────┴─────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Actor Responsibilities

| Actor | Role | Persistence | Key Question It Answers |
|-------|------|-------------|------------------------|
| **Mayor** | Global coordinator, dispatches work | Persistent | "What work needs to happen across all projects?" |
| **Deacon** | Heartbeat receiver, health monitoring | Persistent | "Is everything alive and reporting?" |
| **Witness** | Per-rig worker supervisor | Persistent | "Are my workers healthy and making progress?" |
| **Refinery** | Per-rig merge queue processor | Persistent | "What's ready to merge and what's blocked?" |
| **Polecat** | Ephemeral worker on specific issue | Ephemeral | "What am I working on right now?" |
| **Crew** | Human developer session | Persistent | "What's my current task?" |

### Work Flow

```
Issue Created → Convoy Created → Polecat Spawned → Work Done → Merge Ready → Merged → Cleanup
     │              │                  │              │            │           │         │
   beads         convoy            witness        polecat      witness    refinery   witness
```

---

## Redesigned Dashboard Concept

### Design Principles

1. **Progressive Disclosure**: Show the forest, let users explore trees
2. **Event-Driven Updates**: Push updates on actual events, not polling
3. **Semantic Status**: Distinguish "working" from "stuck" from "blocked"
4. **Action-Oriented**: Every status should suggest what to do next
5. **Quiet When Healthy**: Don't demand attention when things are fine

### Information Architecture

```
Level 0: Town Overview (default view)
├── Health summary: "All systems operational" or "2 items need attention"
├── Active convoys: count + sparkline of progress
├── Active workers: count across all rigs
└── [Click] → Level 1

Level 1: Rig View (click a rig or "View Details")
├── Rig health status
├── Convoy list with progress bars
├── Worker status grid
├── Merge queue summary
└── [Click] → Level 2

Level 2: Detail View (click any item)
├── Full convoy/worker/issue details
├── Activity timeline (events, not timestamps)
├── Related items
└── Available actions
```

---

## Status Definitions (Revised)

### The "Stuck" Problem

**Current behavior**: "Stuck" = no tmux activity for 5+ minutes
**Problem**: AI thinking, network delays, or complex tasks aren't "stuck"

**Proposed solution**: Multi-signal status with semantic meaning

### New Status Model

| Status | Visual | Meaning | Detection | User Action |
|--------|--------|---------|-----------|-------------|
| **Active** | 🟢 | Making progress | Recent commits OR recent beads updates OR active typing | None needed |
| **Thinking** | 🔵 | Working but quiet | No activity but session alive, < 15 min | Wait, this is normal |
| **Slow** | 🟡 | Taking longer than usual | No activity 15-30 min, session alive | Check in if concerned |
| **Unresponsive** | 🟠 | May need attention | No activity 30+ min, session alive | Nudge or check logs |
| **Dead** | 🔴 | Session terminated unexpectedly | Session not found, work incomplete | Restart or reassign |
| **Blocked** | ⬛ | Waiting on dependency | Has blocking beads dependency | Resolve blocker first |
| **Done** | ✅ | Completed successfully | Issue closed, work merged | Cleanup or next task |

### Detection Signals (Multi-Factor)

Instead of just tmux activity, combine:

1. **Git activity**: Recent commits to branch?
2. **Beads activity**: Recent issue updates?
3. **Session health**: Is tmux session alive?
4. **Explicit signals**: Did agent send a status update?
5. **Time in state**: How long in current status?

```
Status = f(git_commits, beads_updates, session_alive, explicit_status, time_factor)
```

---

## UI Components

### 1. Town Overview (Level 0)

```
┌────────────────────────────────────────────────────────────────┐
│  GAS TOWN                                        [Settings] ⚙️  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  🟢 Healthy  │  │  3 Convoys   │  │  5 Workers   │         │
│  │  All systems │  │  ████░░ 67%  │  │  4🟢 1🔵     │         │
│  │  operational │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                │
│  RIGS                                                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ gastown-dev    🟢  2 workers  1 convoy   [View →]       │  │
│  │ my-project     🟢  3 workers  2 convoys  [View →]       │  │
│  │ other-rig      ⚫  idle       —          [View →]       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  RECENT EVENTS                                    [View All]   │
│  • 2m ago: polecat-alpha completed gt-abc12                   │
│  • 5m ago: convoy "Q4 Features" reached 67%                   │
│  • 12m ago: refinery merged PR #234                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2. Rig View (Level 1)

```
┌────────────────────────────────────────────────────────────────┐
│  ← Back    GASTOWN-DEV                           [Actions ▼]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  HEALTH                                                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Witness 🟢 │ │ Refinery🟢 │ │ 2 Workers  │ │ 0 Blocked  │  │
│  │ Running    │ │ Running    │ │ 2🟢        │ │            │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                │
│  CONVOYS                                                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ▼ Q4 Features (hq-cv-abc)                    67% ████░░ │  │
│  │   ├─ gt-123 Add login     ✅ Done                       │  │
│  │   ├─ gt-456 Add logout    🟢 polecat-alpha working      │  │
│  │   └─ gt-789 Add settings  ⬜ Not started                │  │
│  │                                                         │  │
│  │ ▶ Bug Fixes (hq-cv-def)                      33% ██░░░░ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  WORKERS                                                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ polecat-alpha  🟢 Active   gt-456   Last: commit 2m ago │  │
│  │ polecat-beta   🔵 Thinking gt-012   Last: update 8m ago │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  MERGE QUEUE                                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ PR #234  gt-123  ✅ Tests pass  ✅ Mergeable  [Merge]   │  │
│  │ PR #235  gt-456  🔄 Tests running...                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 3. Detail View (Level 2) - Worker Example

```
┌────────────────────────────────────────────────────────────────┐
│  ← Back    POLECAT-ALPHA                         [Actions ▼]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  STATUS: 🟢 Active                                             │
│  Working on: gt-456 "Add logout functionality"                 │
│  Branch: polecat/alpha-1704567890                              │
│  Session: gt-gastown-dev-polecat-alpha                         │
│                                                                │
│  WHY THIS STATUS                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ✅ Session alive (tmux responsive)                      │  │
│  │ ✅ Recent git commit (2 minutes ago)                    │  │
│  │ ✅ Recent beads update (5 minutes ago)                  │  │
│  │ → Conclusion: Actively working, no intervention needed  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ACTIVITY TIMELINE                                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 2m   Committed: "feat: add logout button to header"     │  │
│  │ 5m   Updated issue: added implementation notes          │  │
│  │ 12m  Started working on gt-456                          │  │
│  │ 15m  Spawned by witness                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ACTIONS                                                       │
│  [View Logs]  [Nudge]  [Reassign]  [Kill]                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 4. Attention-Required View (Problems Only)

```
┌────────────────────────────────────────────────────────────────┐
│  ⚠️  NEEDS ATTENTION (2 items)                    [Dismiss All]│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  🟠 UNRESPONSIVE WORKER                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ polecat-gamma on gastown-dev                            │  │
│  │ No activity for 35 minutes                              │  │
│  │ Working on: gt-999 "Complex refactoring task"           │  │
│  │                                                         │  │
│  │ SUGGESTED ACTIONS:                                      │  │
│  │ • [Check Logs] - See what it was doing                  │  │
│  │ • [Nudge] - Send a ping to the session                  │  │
│  │ • [Reassign] - Move work to another polecat             │  │
│  │ • [Dismiss] - I know about this, it's fine              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ⬛ BLOCKED DEPENDENCY                                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ gt-456 blocked by gt-123                                │  │
│  │ gt-123 status: In Progress (polecat-alpha)              │  │
│  │                                                         │  │
│  │ SUGGESTED ACTIONS:                                      │  │
│  │ • [View Blocker] - See gt-123 details                   │  │
│  │ • [Prioritize] - Bump gt-123 priority                   │  │
│  │ • [Remove Dependency] - If not actually needed          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Event-Driven Architecture

### Current: Polling

```
Dashboard → (every 10s) → Query beads CLI → Render
```

**Problems**: Stale data, unnecessary load, no real-time feel

### Proposed: Event Stream

```
                    ┌─────────────────┐
                    │   Event Bus     │
                    │   (SSE/WS)      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   Git Hooks            Beads Hooks         Agent Heartbeats
   (commit, push)       (update, close)     (from Deacon)
```

### Event Types

| Event | Source | Payload | Dashboard Action |
|-------|--------|---------|------------------|
| `issue.updated` | beads hook | issue ID, new status | Update issue badge |
| `issue.closed` | beads hook | issue ID | Mark complete, update convoy progress |
| `convoy.progress` | computed | convoy ID, % | Update progress bar |
| `worker.spawned` | witness | worker name, issue | Add to worker list |
| `worker.status` | witness/deacon | worker, status | Update status indicator |
| `worker.done` | witness | worker, issue | Move to done, trigger cleanup |
| `merge.ready` | refinery | PR info | Add to merge queue |
| `merge.complete` | refinery | PR info | Remove from queue, celebrate |
| `agent.heartbeat` | deacon | agent, timestamp | Update "last seen" |

### Implementation Sketch

```go
// Server-Sent Events endpoint
func (h *Handler) Events(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")

    events := h.eventBus.Subscribe()
    defer h.eventBus.Unsubscribe(events)

    for event := range events {
        fmt.Fprintf(w, "event: %s\n", event.Type)
        fmt.Fprintf(w, "data: %s\n\n", event.JSON())
        w.(http.Flusher).Flush()
    }
}
```

```javascript
// Client-side
const events = new EventSource('/events');

events.addEventListener('worker.status', (e) => {
    const data = JSON.parse(e.data);
    updateWorkerStatus(data.worker, data.status);
});

events.addEventListener('convoy.progress', (e) => {
    const data = JSON.parse(e.data);
    updateConvoyProgress(data.convoy, data.percent);
});
```

---

## Action Framework

Every status should map to clear actions:

### Status → Action Matrix

| Status | Primary Action | Secondary Actions |
|--------|---------------|-------------------|
| 🟢 Active | None (working) | View logs, View progress |
| 🔵 Thinking | Wait | View logs, Set reminder |
| 🟡 Slow | Check in | Nudge, View logs |
| 🟠 Unresponsive | Nudge | View logs, Reassign, Kill |
| 🔴 Dead | Restart | Reassign, View logs, Cleanup |
| ⬛ Blocked | Resolve blocker | View blocker, Remove dep |
| ✅ Done | Next task | View results, Cleanup |

### Action Definitions

| Action | Command | When to Use |
|--------|---------|-------------|
| **View Logs** | Opens tmux session or log viewer | Understand what's happening |
| **Nudge** | `gt nudge <worker>` | Gently ping stuck worker |
| **Reassign** | `gt sling <issue> <new-worker>` | Move work to different worker |
| **Kill** | `gt polecat remove <worker>` | Terminate unrecoverable worker |
| **Restart** | `gt polecat add <rig> <name>` | Start fresh worker |
| **Cleanup** | `gt polecat cleanup <rig>` | Remove done workers |
| **View Blocker** | Navigate to blocking issue | Understand dependency |
| **Prioritize** | `bd update <id> --priority=1` | Bump issue priority |

---

## Project Structure

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js Dashboard (port 3000)               │    │
│  │  React + Tailwind + shadcn/ui + Lucide                   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/SSE
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Go Backend (port 8080)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   REST API   │  │  SSE Events  │  │   Legacy UI  │          │
│  │  /api/v1/*   │  │  /events     │  │  / (old)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ CLI / Files
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Sources                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Beads     │  │    Tmux      │  │     Git      │          │
│  │  (issues)    │  │  (sessions)  │  │  (commits)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
gastown-dev/
│
├── dashboard/                    # NEW: Next.js frontend
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   │   ├── layout.tsx        # Root layout (Black & Chrome theme)
│   │   │   ├── page.tsx          # Level 0: Town Overview
│   │   │   ├── globals.css       # Tailwind + CSS variables
│   │   │   │
│   │   │   ├── rig/
│   │   │   │   └── [name]/
│   │   │   │       └── page.tsx  # Level 1: Rig View
│   │   │   │
│   │   │   ├── convoy/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Level 2: Convoy Detail
│   │   │   │
│   │   │   ├── worker/
│   │   │   │   └── [name]/
│   │   │   │       └── page.tsx  # Level 2: Worker Detail
│   │   │   │
│   │   │   └── attention/
│   │   │       └── page.tsx      # Attention Required view
│   │   │
│   │   ├── components/
│   │   │   ├── ui/               # Base components (shadcn-style)
│   │   │   │   ├── panel.tsx
│   │   │   │   ├── status-badge.tsx
│   │   │   │   ├── gauge.tsx
│   │   │   │   ├── action-button.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── header.tsx
│   │   │   │   ├── nav.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   └── page-header.tsx
│   │   │   │
│   │   │   ├── town/             # Level 0 components
│   │   │   │   ├── health-summary.tsx
│   │   │   │   ├── rig-list.tsx
│   │   │   │   └── stats-grid.tsx
│   │   │   │
│   │   │   ├── convoys/          # Convoy components
│   │   │   │   ├── convoy-row.tsx
│   │   │   │   ├── convoy-list.tsx
│   │   │   │   ├── convoy-detail.tsx
│   │   │   │   └── issue-list.tsx
│   │   │   │
│   │   │   ├── workers/          # Worker components
│   │   │   │   ├── worker-card.tsx
│   │   │   │   ├── worker-grid.tsx
│   │   │   │   ├── worker-detail.tsx
│   │   │   │   └── activity-timeline.tsx
│   │   │   │
│   │   │   ├── merge-queue/      # Merge queue components
│   │   │   │   ├── merge-item.tsx
│   │   │   │   └── merge-queue.tsx
│   │   │   │
│   │   │   └── events/           # Event feed components
│   │   │       ├── event-feed.tsx
│   │   │       └── event-item.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── utils.ts          # cn() helper, formatters
│   │   │   ├── api.ts            # API client (fetch wrappers)
│   │   │   └── constants.ts      # Status configs, colors
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-events.ts     # SSE subscription hook
│   │   │   ├── use-api.ts        # Data fetching hook
│   │   │   └── use-actions.ts    # Action execution hook
│   │   │
│   │   └── types/
│   │       ├── api.ts            # API response types
│   │       └── domain.ts         # Domain types (Convoy, Worker, etc.)
│   │
│   ├── public/
│   │   ├── noise.png             # Subtle texture overlay
│   │   └── favicon.ico
│   │
│   ├── package.json
│   ├── tailwind.config.js        # Black & Chrome theme
│   ├── tsconfig.json
│   ├── next.config.js
│   └── .env.local                # API_URL=http://localhost:8080
│
├── internal/
│   ├── web/                      # EXISTING: Go web server
│   │   ├── handler.go            # Legacy HTML handler (keep for now)
│   │   ├── fetcher.go            # Data fetching (reuse)
│   │   ├── templates/            # Legacy templates (deprecate later)
│   │   │
│   │   ├── api/                  # NEW: JSON API handlers
│   │   │   ├── api.go            # Router setup
│   │   │   ├── town.go           # GET /api/v1/town
│   │   │   ├── rigs.go           # GET /api/v1/rigs, /api/v1/rigs/:name
│   │   │   ├── convoys.go        # GET /api/v1/convoys, /api/v1/convoys/:id
│   │   │   ├── workers.go        # GET /api/v1/workers, POST /api/v1/workers/:name/nudge
│   │   │   └── actions.go        # POST /api/v1/actions/*
│   │   │
│   │   └── events/               # NEW: SSE event system
│   │       ├── bus.go            # Event bus (pub/sub)
│   │       ├── handler.go        # GET /events (SSE endpoint)
│   │       └── types.go          # Event type definitions
│   │
│   └── ...                       # Other existing packages
│
├── docs/
│   └── designs/
│       ├── dashboard-redesign.md # This document
│       └── design-system.md      # Visual design system
│
└── ...
```

### API Endpoints (New)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/town` | Town overview (health, stats) |
| `GET` | `/api/v1/rigs` | List all rigs with status |
| `GET` | `/api/v1/rigs/:name` | Single rig detail |
| `GET` | `/api/v1/convoys` | List convoys (filter by rig, status) |
| `GET` | `/api/v1/convoys/:id` | Convoy detail with issues |
| `GET` | `/api/v1/workers` | List workers (filter by rig, status) |
| `GET` | `/api/v1/workers/:name` | Worker detail with timeline |
| `GET` | `/api/v1/merge-queue` | Merge queue items |
| `GET` | `/events` | SSE event stream |
| `POST` | `/api/v1/workers/:name/nudge` | Nudge a worker |
| `POST` | `/api/v1/workers/:name/kill` | Kill a worker |
| `POST` | `/api/v1/convoys/:id/cancel` | Cancel a convoy |

### SSE Event Types

```typescript
// Event stream format
interface ServerEvent {
  type: EventType
  data: EventData
  timestamp: string
}

type EventType =
  | 'worker.spawned'
  | 'worker.status'
  | 'worker.done'
  | 'convoy.progress'
  | 'convoy.complete'
  | 'issue.updated'
  | 'issue.closed'
  | 'merge.ready'
  | 'merge.complete'
  | 'agent.heartbeat'
  | 'attention.required'
```

### Development Workflow

```bash
# Terminal 1: Go backend
cd gastown-dev
go run ./cmd/gt dashboard --port 8080

# Terminal 2: Next.js frontend (hot reload)
cd gastown-dev/dashboard
npm run dev  # runs on port 3000

# Browser
open http://localhost:3000
```

### Production Options

**Option A: Separate deployment**
- Deploy Next.js to Vercel/Netlify
- Go binary serves API only
- Configure CORS

**Option B: Embedded (single binary)**
```go
//go:embed dashboard/out/*
var dashboardFS embed.FS

// Serve static files from embedded FS
```
- Build Next.js: `npm run build && npm run export`
- Embed in Go binary
- Single `gt dashboard` command serves everything

---

## Implementation Phases

### Phase 0: Design System (see `design-system.md`)
- [ ] Initialize Next.js 14+ with App Router
- [ ] Install Tailwind CSS + shadcn/ui + Lucide React
- [ ] Configure "Black & Chrome" theme
- [ ] Build base components: Panel, StatusBadge, Gauge, ActionButton
- [ ] Create layout shell with header/nav
- [ ] Verify responsive + accessibility
- [ ] Create component storybook/playground

### Phase 1: Foundation
- [ ] New status model with multi-signal detection
- [ ] Event bus infrastructure
- [ ] Basic SSE endpoint
- [ ] Level 0 town overview

### Phase 2: Progressive Disclosure
- [ ] Level 1 rig view
- [ ] Level 2 detail views
- [ ] Collapsible convoy sections
- [ ] Activity timeline component

### Phase 3: Actions
- [ ] Action buttons with confirmation
- [ ] Inline command execution
- [ ] Status → action suggestions
- [ ] Keyboard shortcuts

### Phase 4: Polish
- [ ] Attention-required view
- [ ] Notifications (optional)
- [ ] Dark mode
- [ ] Mobile responsive

---

## Open Questions

1. **Heartbeat frequency**: How often should agents report status? (Currently via Deacon)
2. **Event persistence**: Should we store events for replay/history?
3. **Multi-user**: Should dashboard support multiple viewers with different permissions?
4. **Notifications**: Push notifications for attention-required items?
5. **Historical view**: Show completed convoys/work history?

---

## Appendix: Current vs Proposed Comparison

| Aspect | Current | Proposed |
|--------|---------|----------|
| Update mechanism | Poll every 10s | Event-driven (SSE) |
| Status granularity | 3 states (active/stale/stuck) | 7 states with clear meaning |
| Information hierarchy | Flat table | 3-level progressive disclosure |
| Stuck detection | tmux activity only | Multi-signal (git, beads, session, explicit) |
| User actions | None in UI | Contextual actions per status |
| Blocked visibility | Hidden | First-class status |
| Event history | None | Activity timeline |

---

## References

- Current dashboard: `internal/web/`
- Activity detection: `internal/activity/activity.go`
- Agent states: `internal/agent/state.go`
- Convoy tracking: `internal/cmd/convoy.go`
- Witness monitoring: `internal/witness/manager.go`
