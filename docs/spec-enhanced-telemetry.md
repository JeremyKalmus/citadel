# Citadel UI/UX Enhancement Spec: Enhanced Telemetry

> **Purpose**: Spec for mayor to dispatch to polecats via beads
> **Status**: DRAFT - Awaiting approval
> **Created**: 2026-01-11

---

## Executive Summary

Enhance Gas Town telemetry to provide complete visibility into:
1. **Token usage per bead** with actual model identification
2. **Cost tracking** with accurate model-based pricing
3. **Git diff statistics** per work session
4. **Duration tracking** for efficiency analysis
5. **Time series visualization** at town level

---

## Problem Statement

### Current Gaps

| Data Point | Current State | Problem |
|------------|--------------|---------|
| Model used | Not captured | Costs calculated assuming Sonnet; Opus work is under-billed 5x |
| Bead linkage | Partial (sling only) | Can't attribute token costs to specific work items |
| Git diffs | Not tracked | No visibility into code output per session |
| Duration | Derivable but not explicit | Efficiency metrics impossible |
| Per-bead view | Not implemented | Users can't see what a task actually cost |

### Impact

- **Budget surprises**: Opus sessions cost 5x Sonnet but we price as Sonnet
- **No ROI visibility**: Can't answer "What did this feature cost to build?"
- **Efficiency blindness**: No way to compare polecat productivity
- **Missing accountability**: Token spend can't be tied to work output

---

## Target Data Model

### Enhanced Token Usage Event

```jsonl
{
  "ts": "2026-01-11T14:30:00Z",
  "source": "guzzoline",
  "type": "session_ended",
  "actor": "citadel/polecats/furiosa",
  "payload": {
    // Work attribution
    "bead_id": "ci-nvz",
    "rig": "citadel",
    "polecat": "furiosa",
    "session_id": "gt-citadel-furiosa-abc123",

    // Model identification
    "model_id": "claude-opus-4-5-20251101",
    "model_tier": "opus",  // opus | sonnet | haiku

    // Token breakdown
    "tokens": {
      "input": 45000,
      "output": 12000,
      "cache_read": 8000,
      "cache_write": 3000,
      "total": 68000
    },

    // Cost (calculated with actual model pricing)
    "cost": {
      "input_usd": 0.675,
      "output_usd": 0.900,
      "cache_read_usd": 0.012,
      "cache_write_usd": 0.056,
      "total_usd": 1.643
    },

    // Timing
    "session_start": "2026-01-11T14:00:00Z",
    "session_end": "2026-01-11T14:30:00Z",
    "duration_ms": 1800000,
    "duration_human": "30m",

    // Git statistics
    "git_stats": {
      "branch": "ci-nvz-fix-auth-bug",
      "commits": 2,
      "files_changed": 3,
      "insertions": 87,
      "deletions": 23,
      "diff_summary": "+87 -23 in 3 files"
    }
  }
}
```

### Aggregation Hierarchy

```
Per-Bead Telemetry
├── tokens (input/output/cache)
├── cost_usd (model-accurate)
├── model_id (actual model used)
├── duration_ms
├── git_stats
└── sessions[] (multiple sessions per bead possible)
    │
    ▼ aggregates into
Per-Worker Telemetry
├── total_tokens
├── total_cost
├── beads_worked[]
├── avg_tokens_per_bead
├── avg_duration_per_bead
└── efficiency_score
    │
    ▼ aggregates into
Per-Convoy Telemetry
├── total_tokens
├── total_cost
├── beads[]
├── workers_involved[]
└── progress_percent
    │
    ▼ aggregates into
Town-Level Telemetry (Time Series)
├── hourly_usage[]
├── daily_usage[]
├── by_model_breakdown
├── by_rig_breakdown
└── budget_status
```

---

## Implementation Plan

### Task 1: Capture Model ID from Claude Sessions

**Goal**: Extract the actual model used from Claude Code session data.

**Files:**
- `gt/bin/gt` (Go) - `costs record` command
- `gt/plugins/guzzoline/hooks/token-accounting.sh`

**Approach:**

Claude Code exposes model info in its status. Options to capture:

#### Option A: Parse from Claude Code output
```bash
# Claude Code prints model at start
# "Using claude-opus-4-5-20251101"
MODEL_ID=$(grep -m1 "Using claude-" /path/to/session/log | sed 's/.*Using //')
```

#### Option B: Check environment variable
```bash
# If Claude Code sets ANTHROPIC_MODEL or similar
MODEL_ID="${CLAUDE_MODEL:-${ANTHROPIC_MODEL:-unknown}}"
```

#### Option C: Parse from API response (most reliable)
```bash
# Claude API responses include model in metadata
# Requires capturing API response headers/body
```

**Changes to token-accounting.sh:**
```bash
# Add model detection
MODEL_ID=$(detect_model_from_session)
MODEL_TIER="sonnet"  # default
case "$MODEL_ID" in
  *opus*) MODEL_TIER="opus" ;;
  *haiku*) MODEL_TIER="haiku" ;;
  *sonnet*) MODEL_TIER="sonnet" ;;
esac

# Include in event
EVENT=$(jq -n \
  --arg model_id "$MODEL_ID" \
  --arg model_tier "$MODEL_TIER" \
  # ... rest of fields
)
```

**Acceptance Criteria:**
- [ ] Model ID captured in 95%+ of session_ended events
- [ ] Model tier (opus/sonnet/haiku) correctly derived
- [ ] Unknown models default to "sonnet" with warning logged

---

### Task 2: Always Include Bead ID in Cost Events

**Goal**: Every token_usage/session_ended event links to its bead.

**Files:**
- `gt/bin/gt` - Ensure bead_id passed to hooks
- `gt/plugins/guzzoline/hooks/token-accounting.sh`

**Current problem:**
The `sling` command links bead to polecat, but the Stop hook doesn't have access to this.

**Solution:**
Store hook state in polecat directory:

```bash
# When sling runs (in gt sling command):
echo "$BEAD_ID" > "$POLECAT_DIR/.current_bead"

# When Stop hook runs:
BEAD_ID=$(cat "$POLECAT_DIR/.current_bead" 2>/dev/null || echo "")
```

**Alternative: Environment variable approach:**
```bash
# gt sling sets:
export GT_CURRENT_BEAD="ci-nvz"

# Hook reads:
BEAD_ID="${GT_CURRENT_BEAD:-}"
```

**Acceptance Criteria:**
- [ ] 100% of session_ended events include bead_id when work was hooked
- [ ] Events without hooked work have bead_id: null (not missing)

---

### Task 3: Track Git Diff Statistics

**Goal**: Capture code changes made during each session.

**Files:**
- `gt/plugins/guzzoline/hooks/token-accounting.sh` (or new hook)
- New: `gt/plugins/guzzoline/hooks/git-stats.sh`

**Approach:**

On session end, run git commands in polecat's working directory:

```bash
#!/bin/bash
# git-stats.sh - Capture git statistics for session

POLECAT_DIR="$1"
BRANCH=$(git -C "$POLECAT_DIR" branch --show-current 2>/dev/null)

if [[ -n "$BRANCH" ]]; then
  # Get diff stats against main/master
  BASE_BRANCH=$(git -C "$POLECAT_DIR" symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
  BASE_BRANCH="${BASE_BRANCH:-main}"

  # Count commits on this branch
  COMMITS=$(git -C "$POLECAT_DIR" rev-list --count "$BASE_BRANCH..$BRANCH" 2>/dev/null || echo "0")

  # Get diff statistics
  DIFF_STAT=$(git -C "$POLECAT_DIR" diff --stat "$BASE_BRANCH..$BRANCH" 2>/dev/null)
  FILES_CHANGED=$(echo "$DIFF_STAT" | grep -E "^\s*[0-9]+ file" | grep -oE "[0-9]+" | head -1 || echo "0")
  INSERTIONS=$(echo "$DIFF_STAT" | grep -oE "[0-9]+ insertion" | grep -oE "[0-9]+" || echo "0")
  DELETIONS=$(echo "$DIFF_STAT" | grep -oE "[0-9]+ deletion" | grep -oE "[0-9]+" || echo "0")

  # Output as JSON
  jq -n \
    --arg branch "$BRANCH" \
    --argjson commits "$COMMITS" \
    --argjson files "$FILES_CHANGED" \
    --argjson ins "$INSERTIONS" \
    --argjson del "$DELETIONS" \
    '{
      branch: $branch,
      commits: $commits,
      files_changed: $files,
      insertions: $ins,
      deletions: $del,
      diff_summary: "\("+") \($ins) \("-") \($del) in \($files) files"
    }'
fi
```

**Integration with token-accounting.sh:**
```bash
# Get git stats
GIT_STATS=$(./git-stats.sh "$POLECAT_DIR")

# Include in event
EVENT=$(jq -n \
  --argjson git_stats "$GIT_STATS" \
  # ... other fields
  '{..., payload: {..., git_stats: $git_stats}}'
)
```

**Acceptance Criteria:**
- [ ] Git stats captured for sessions with git changes
- [ ] Branch name, commit count, insertions, deletions tracked
- [ ] Sessions with no git changes have git_stats: null

---

### Task 4: Track Session Duration

**Goal**: Explicit duration tracking for efficiency analysis.

**Files:**
- `gt/plugins/guzzoline/hooks/token-accounting.sh`

**Approach:**

Record session start timestamp, calculate duration at end:

```bash
# On session start (SessionStart hook):
echo "$(date -u +%s)" > "$POLECAT_DIR/.session_start"

# On session end (Stop hook):
SESSION_START=$(cat "$POLECAT_DIR/.session_start" 2>/dev/null || echo "0")
SESSION_END=$(date -u +%s)
DURATION_MS=$(( (SESSION_END - SESSION_START) * 1000 ))

# Format human-readable
if [[ $DURATION_MS -lt 60000 ]]; then
  DURATION_HUMAN="${DURATION_MS}ms"
elif [[ $DURATION_MS -lt 3600000 ]]; then
  DURATION_HUMAN="$((DURATION_MS / 60000))m"
else
  DURATION_HUMAN="$((DURATION_MS / 3600000))h $((DURATION_MS % 3600000 / 60000))m"
fi
```

**Acceptance Criteria:**
- [ ] Duration captured in milliseconds
- [ ] Human-readable format included (30m, 1h 15m, etc.)
- [ ] Start/end timestamps both recorded

---

### Task 5: Update Citadel Cost Calculation

**Goal**: Use actual model for pricing instead of assuming Sonnet.

**Files:**
- `citadel/src/lib/gastown/cost.ts`
- `citadel/src/app/api/gastown/guzzoline/route.ts`

**Changes:**

```typescript
// In API route - read model from event
const events = await parseEventsJsonl();
const costEvents = events
  .filter(e => e.type === 'session_ended')
  .map(e => ({
    ...e,
    // Use actual model, fallback to sonnet
    calculatedCost: calculateCost(e.payload.tokens, e.payload.model_id)
  }));
```

**Acceptance Criteria:**
- [ ] Opus sessions priced at Opus rates ($15/$75 per 1M)
- [ ] Haiku sessions priced at Haiku rates ($0.80/$4 per 1M)
- [ ] Unknown models default to Sonnet with warning

---

### Task 6: Create BeadTelemetryPanel Component

**Goal**: Display per-bead telemetry in BeadDetailPanel.

**File:** `citadel/src/components/beads/bead-telemetry-panel.tsx` (NEW)

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ TELEMETRY                                                    ci-nvz │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   TOKENS     │  │    COST      │  │   DURATION   │              │
│  │    68K       │  │   $1.64      │  │    30m       │              │
│  │  ▲ +12% avg  │  │  opus model  │  │  2 sessions  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  MODEL: claude-opus-4-5-20251101                                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ GIT CHANGES                                                  │   │
│  │ Branch: ci-nvz-fix-auth-bug                                  │   │
│  │ Commits: 2  │  +87 -23 in 3 files                           │   │
│  │                                                              │   │
│  │ [View Diff]                                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  TOKEN BREAKDOWN                                                    │
│  ████████████████████░░░░░░░ Input: 45K (66%)                      │
│  ██████████░░░░░░░░░░░░░░░░░ Output: 12K (18%)                     │
│  ████░░░░░░░░░░░░░░░░░░░░░░░ Cache Read: 8K (12%)                  │
│  ██░░░░░░░░░░░░░░░░░░░░░░░░░ Cache Write: 3K (4%)                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Component Structure:**
```tsx
interface BeadTelemetryPanelProps {
  beadId: string;
  telemetry: BeadTelemetry | null;
  loading?: boolean;
}

interface BeadTelemetry {
  bead_id: string;
  model_id: string;
  model_tier: 'opus' | 'sonnet' | 'haiku';
  tokens: {
    input: number;
    output: number;
    cache_read: number;
    cache_write: number;
    total: number;
  };
  cost: {
    total_usd: number;
    breakdown: CostBreakdown;
  };
  duration_ms: number;
  session_count: number;
  git_stats?: {
    branch: string;
    commits: number;
    files_changed: number;
    insertions: number;
    deletions: number;
  };
}
```

**Acceptance Criteria:**
- [ ] Panel shows in BeadDetailPanel when telemetry available
- [ ] Model tier displayed with visual indicator (Opus=purple, Sonnet=blue, Haiku=green)
- [ ] Token breakdown shows visual bars
- [ ] Git stats link to diff viewer (Task 7)
- [ ] Empty state when no telemetry

---

### Task 7: Create GitDiffViewer Component

**Goal**: Display code changes in Citadel.

**File:** `citadel/src/components/git/git-diff-viewer.tsx` (NEW)

**Approach:**

Fetch diff from API, display with syntax highlighting:

```tsx
interface GitDiffViewerProps {
  rig: string;
  branch: string;
  baseBranch?: string;  // defaults to main
}

// API: GET /api/gastown/git/diff?rig=citadel&branch=ci-nvz-fix
// Returns: { diff: string, stats: GitStats }
```

**Wireframe:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ DIFF: ci-nvz-fix-auth-bug vs main                          [Close] │
├─────────────────────────────────────────────────────────────────────┤
│ 3 files changed, 87 insertions(+), 23 deletions(-)                  │
├─────────────────────────────────────────────────────────────────────┤
│ src/auth/login.ts                                          +45 -10 │
│ ─────────────────────────────────────────────────────────────────── │
│  10   import { validateToken } from './utils';                      │
│  11 - const AUTH_TIMEOUT = 5000;                                    │
│  11 + const AUTH_TIMEOUT = 10000; // increased for slow networks   │
│  12   const AUTH_RETRIES = 3;                                       │
│  ...                                                                │
├─────────────────────────────────────────────────────────────────────┤
│ src/auth/utils.ts                                          +32 -8  │
│ ─────────────────────────────────────────────────────────────────── │
│  ...                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Diff displayed with syntax highlighting
- [ ] File-by-file collapsible sections
- [ ] Line numbers shown
- [ ] Insertions green, deletions red
- [ ] Handles large diffs (virtualization or pagination)

---

### Task 8: Create Town-Level Time Series Charts

**Goal**: Visualize token usage and costs over time.

**File:** `citadel/src/components/dashboard/telemetry-charts.tsx` (NEW)

**Charts to implement:**

#### 8a. Hourly Token Usage (24h)
```
Tokens (K)
   50│    ▄▄
   40│   ████ ▄▄
   30│  ██████████
   20│ ████████████▄▄
   10│██████████████████
    0└─────────────────────────
     00  04  08  12  16  20  24
```

#### 8b. Cost by Model (Pie/Donut)
```
     ┌─────────────┐
     │   $45.20    │
     │   Total     │
     │             │
     │  ██ Opus    │ $32.50 (72%)
     │  ░░ Sonnet  │ $11.20 (25%)
     │  ▒▒ Haiku   │ $1.50 (3%)
     └─────────────┘
```

#### 8c. Daily Trend (7d)
```
Cost ($)
  $20│        ▄▄
  $15│    ▄▄ ████
  $10│▄▄ ████████▄▄
   $5│██████████████
   $0└───────────────
    Mon Tue Wed Thu Fri Sat Sun
```

**Acceptance Criteria:**
- [ ] 24-hour token usage chart on Town dashboard
- [ ] Model breakdown pie chart
- [ ] 7-day trend line chart
- [ ] Hover tooltips with exact values
- [ ] Auto-refresh every 5 minutes

---

### Task 9: Add Telemetry API Endpoints

**Files:**
- `citadel/src/app/api/gastown/telemetry/bead/[id]/route.ts` (NEW)
- `citadel/src/app/api/gastown/telemetry/timeseries/route.ts` (NEW)
- `citadel/src/app/api/gastown/git/diff/route.ts` (NEW)

**Endpoints:**

```typescript
// GET /api/gastown/telemetry/bead/[id]
// Returns telemetry for a specific bead
{
  bead_id: "ci-nvz",
  sessions: [...],
  aggregated: {
    tokens: {...},
    cost: {...},
    duration_ms: 1800000,
    git_stats: {...}
  }
}

// GET /api/gastown/telemetry/timeseries?period=24h|7d|30d
// Returns time-bucketed data
{
  period: "24h",
  buckets: [
    { timestamp: "2026-01-11T00:00:00Z", tokens: 45000, cost_usd: 1.20 },
    { timestamp: "2026-01-11T01:00:00Z", tokens: 32000, cost_usd: 0.85 },
    ...
  ],
  by_model: {
    opus: { tokens: 120000, cost_usd: 8.50 },
    sonnet: { tokens: 85000, cost_usd: 1.20 },
    haiku: { tokens: 45000, cost_usd: 0.15 }
  }
}

// GET /api/gastown/git/diff?rig=citadel&branch=ci-nvz-fix
// Returns git diff
{
  branch: "ci-nvz-fix",
  base: "main",
  stats: { files: 3, insertions: 87, deletions: 23 },
  diff: "diff --git a/src/auth/login.ts..."
}
```

**Acceptance Criteria:**
- [ ] Per-bead telemetry endpoint returns aggregated data
- [ ] Time series endpoint supports 24h/7d/30d periods
- [ ] Git diff endpoint returns raw diff and stats
- [ ] All endpoints return proper error responses

---

### Task 10: Create Telemetry Hooks

**Goal**: Wire up telemetry collection in Gas Town hooks.

**Files:**
- `gt/plugins/guzzoline/hooks/session-start.sh` (NEW or modify)
- `gt/plugins/guzzoline/hooks/token-accounting.sh` (modify)

**Hook registration in plugin.yaml:**
```yaml
hooks:
  SessionStart:
    - command: "${GT_ROOT}/plugins/guzzoline/hooks/session-start.sh"
      scope: polecat
      matcher: "*/polecats/*"

  Stop:
    - command: "${GT_ROOT}/plugins/guzzoline/hooks/token-accounting.sh"
      scope: polecat
      matcher: "*/polecats/*"
```

**Acceptance Criteria:**
- [ ] SessionStart hook records start timestamp and bead_id
- [ ] Stop hook captures all telemetry fields
- [ ] Events written to .events.jsonl atomically
- [ ] Hooks don't block session exit (async write)

---

## File Summary

### New Files
```
gt/plugins/guzzoline/hooks/session-start.sh
gt/plugins/guzzoline/hooks/git-stats.sh
citadel/src/components/beads/bead-telemetry-panel.tsx
citadel/src/components/git/git-diff-viewer.tsx
citadel/src/components/dashboard/telemetry-charts.tsx
citadel/src/hooks/use-bead-telemetry.ts
citadel/src/hooks/use-telemetry-timeseries.ts
citadel/src/app/api/gastown/telemetry/bead/[id]/route.ts
citadel/src/app/api/gastown/telemetry/timeseries/route.ts
citadel/src/app/api/gastown/git/diff/route.ts
```

### Modified Files
```
gt/plugins/guzzoline/hooks/token-accounting.sh
gt/plugins/guzzoline/plugin.yaml
citadel/src/lib/gastown/cost.ts
citadel/src/lib/gastown/types.ts
citadel/src/components/beads/bead-detail-panel.tsx
citadel/src/app/page.tsx (add charts)
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SESSION LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  gt sling ci-nvz citadel/furiosa                                   │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────┐                                                │
│  │ Write .current_ │  bead_id saved to polecat dir                 │
│  │ bead file       │                                                │
│  └────────┬────────┘                                                │
│           │                                                         │
│           ▼                                                         │
│  SessionStart Hook fires                                            │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────┐                                                │
│  │ Write .session_ │  start timestamp saved                        │
│  │ start file      │                                                │
│  └────────┬────────┘                                                │
│           │                                                         │
│           ▼                                                         │
│  ═══════════════════  Polecat works...  ═══════════════════        │
│           │                                                         │
│           ▼                                                         │
│  Stop Hook fires                                                    │
│       │                                                             │
│       ├──▶ Read .current_bead ──▶ bead_id                          │
│       ├──▶ Read .session_start ──▶ duration                        │
│       ├──▶ Detect model ──▶ model_id                               │
│       ├──▶ Read Claude costs ──▶ tokens                            │
│       ├──▶ Run git-stats.sh ──▶ git_stats                          │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────┐                                                │
│  │ Write complete  │  All telemetry in one event                   │
│  │ event to        │                                                │
│  │ .events.jsonl   │                                                │
│  └────────┬────────┘                                                │
│           │                                                         │
│           ▼                                                         │
│  Citadel API reads .events.jsonl                                   │
│       │                                                             │
│       ├──▶ /api/gastown/telemetry/bead/[id]                        │
│       ├──▶ /api/gastown/telemetry/timeseries                       │
│       └──▶ /api/gastown/guzzoline                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Model identification rate | 0% | 95%+ |
| Bead-cost linkage | ~50% (sling only) | 100% |
| Cost accuracy | ±5x (Opus as Sonnet) | ±5% |
| Per-bead visibility | None | Full telemetry panel |
| Git diff visibility | None | Inline diff viewer |
| Time series data | None | 24h/7d/30d charts |

---

## Dependencies

- **Claude Code**: Must expose model info (env var or log parsing)
- **Git**: Polecat directories must have git repos
- **Guzzoline plugin**: Must be installed

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Model detection fails | Inaccurate costs | Default to Sonnet, log warning |
| Large git diffs slow UI | Poor UX | Virtualize/paginate diff viewer |
| High event volume | Storage growth | Rotate .events.jsonl weekly |
| Clock skew in duration | Inaccurate metrics | Use monotonic clock where possible |

---

## Open Questions

1. **How to reliably detect model?**
   - Claude Code env var? Log parsing? API response capture?
   - Need to test what's actually available

2. **Should we store full git diffs or just stats?**
   - Stats: Low storage, fast
   - Full diff: Rich but large
   - Recommendation: Stats in event, diff fetched on-demand via API

3. **Retention policy for events?**
   - Current: Unbounded growth
   - Recommendation: 90 days hot, archive older

4. **Should telemetry be real-time or batch?**
   - Current: On session end (batch)
   - Could add: Periodic heartbeats during long sessions

---

## Appendix: Model Pricing Reference

| Model | Input/1M | Output/1M | Cache Read/1M | Cache Write/1M |
|-------|----------|-----------|---------------|----------------|
| Opus 4.5 | $15.00 | $75.00 | $1.50 | $18.75 |
| Sonnet 4 | $3.00 | $15.00 | $0.30 | $3.75 |
| Haiku 3.5 | $0.80 | $4.00 | $0.08 | $1.00 |

**Cost difference example (100K tokens, 75% input / 25% output):**
- Opus: $1.125 + $1.875 = **$3.00**
- Sonnet: $0.225 + $0.375 = **$0.60**
- Haiku: $0.06 + $0.10 = **$0.16**

Pricing Opus as Sonnet under-reports cost by **5x**.
