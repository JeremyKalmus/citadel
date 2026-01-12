/**
 * Enhanced Guzzoline Stats Types
 *
 * Types for comprehensive token usage and cost tracking in Gas Town.
 * Used by the Command Center dashboard for cost visibility and budget management.
 */

// ============================================================================
// Base Token Types
// ============================================================================

/** Token counts from a Claude API call */
export interface TokenCounts {
  input: number;
  output: number;
  cache_read: number;
  cache_write?: number;
  total: number;
}

/** A single token usage event from the events log */
export interface TokenUsageEvent {
  id: string;
  timestamp: string;
  actor: string;
  source: "guzzoline";
  type: "token_usage";
  tokens: TokenCounts;
  /** Associated bead ID if tracked */
  bead_id?: string;
  /** Session ID for grouping */
  session_id?: string;
}

// ============================================================================
// Cost Calculation Types
// ============================================================================

/** Claude model pricing tiers (per 1M tokens) */
export interface ModelPricing {
  model: string;
  input_per_million: number;
  output_per_million: number;
  cache_read_per_million: number;
  cache_write_per_million?: number;
}

/** Calculated cost breakdown */
export interface CostBreakdown {
  input_cost: number;
  output_cost: number;
  cache_read_cost: number;
  cache_write_cost: number;
  total_cost: number;
  currency: "USD";
}

/** Token usage with calculated costs */
export interface TokenUsageWithCost {
  tokens: TokenCounts;
  cost: CostBreakdown;
  model?: string;
}

// ============================================================================
// Per-Entity Cost Types
// ============================================================================

/** Cost tracked per issue/bead */
export interface IssueTokenUsage {
  bead_id: string;
  title?: string;
  tokens: TokenCounts;
  cost: CostBreakdown;
  session_count: number;
  first_activity: string;
  last_activity: string;
}

/** Cost tracked per worker */
export interface WorkerCost {
  rig: string;
  name: string;
  tokens: TokenCounts;
  cost: CostBreakdown;
  session_count: number;
  active_issues: number;
  efficiency_score?: number;
}

/** Cost tracked per convoy */
export interface ConvoyCost {
  convoy_id: string;
  title: string;
  tokens: TokenCounts;
  cost: CostBreakdown;
  worker_count: number;
  issue_count: number;
  status: string;
}

/** Cost tracked per agent type */
export interface AgentTypeCost {
  agent_type: "polecat" | "witness" | "refinery" | "mayor" | "deacon";
  tokens: TokenCounts;
  cost: CostBreakdown;
  session_count: number;
}

// ============================================================================
// Time-Series Types
// ============================================================================

/** A single data point for sparkline charts */
export interface SparklinePoint {
  timestamp: string;
  value: number;
}

/** Hourly token usage for charts */
export interface HourlyUsage {
  hour: string; // ISO timestamp at hour boundary
  tokens: TokenCounts;
  cost: CostBreakdown;
  session_count: number;
}

/** Daily token usage summary */
export interface DailyUsage {
  date: string; // YYYY-MM-DD
  tokens: TokenCounts;
  cost: CostBreakdown;
  session_count: number;
  peak_hour?: string;
}

// ============================================================================
// Budget & Threshold Types
// ============================================================================

/** Budget configuration */
export interface BudgetConfig {
  daily_limit_usd?: number;
  weekly_limit_usd?: number;
  monthly_limit_usd?: number;
  warning_threshold_percent: number; // e.g., 80 = warn at 80% of limit
}

/** Budget status and warnings */
export interface BudgetStatus {
  config: BudgetConfig;
  daily_spent: number;
  weekly_spent: number;
  monthly_spent: number;
  daily_remaining?: number;
  weekly_remaining?: number;
  monthly_remaining?: number;
  daily_percent_used: number;
  weekly_percent_used: number;
  monthly_percent_used: number;
  warnings: BudgetWarning[];
}

/** A budget warning event */
export interface BudgetWarning {
  id: string;
  timestamp: string;
  type: "approaching_limit" | "exceeded_limit";
  period: "daily" | "weekly" | "monthly";
  threshold_percent: number;
  current_spent: number;
  limit: number;
  actor?: string;
}

// ============================================================================
// Efficiency Types
// ============================================================================

/** Efficiency metrics for cost analysis */
export interface EfficiencyMetrics {
  /** Tokens per completed issue */
  tokens_per_issue: number;
  /** Cost per completed issue */
  cost_per_issue: number;
  /** Cache hit ratio (0-1) */
  cache_hit_ratio: number;
  /** Output/Input ratio (lower is more efficient for some tasks) */
  output_input_ratio: number;
  /** Tokens per hour of work */
  tokens_per_hour?: number;
  /** Comparison to average (1.0 = average, <1 = better) */
  efficiency_index?: number;
}

// ============================================================================
// Main Enhanced Stats Interface
// ============================================================================

/** Enhanced Guzzoline stats for comprehensive cost tracking */
export interface EnhancedGuzzolineStats {
  // Time boundaries
  period_start: string;
  period_end: string;

  // Aggregate totals
  total_tokens: TokenCounts;
  total_cost: CostBreakdown;
  session_count: number;

  // By time period
  today: TokenUsageWithCost;
  this_week: TokenUsageWithCost;
  this_month: TokenUsageWithCost;

  // By entity
  by_agent_type: AgentTypeCost[];
  by_worker: WorkerCost[];
  by_convoy: ConvoyCost[];
  by_issue: IssueTokenUsage[];

  // Time series for charts
  hourly_usage: HourlyUsage[];
  daily_usage: DailyUsage[];
  sparkline_24h: SparklinePoint[];
  sparkline_7d: SparklinePoint[];

  // Recent activity
  recent_sessions: TokenUsageEvent[];

  // Budget tracking
  budget_status: BudgetStatus;

  // Efficiency metrics
  efficiency: EfficiencyMetrics;
}

// ============================================================================
// API Response Types
// ============================================================================

/** Response from /api/gastown/guzzoline/enhanced endpoint */
export interface EnhancedGuzzolineResponse {
  stats: EnhancedGuzzolineStats;
  generated_at: string;
  cache_ttl_seconds: number;
}

/** Query parameters for enhanced guzzoline endpoint */
export interface EnhancedGuzzolineQuery {
  /** Start of time range (ISO timestamp) */
  from?: string;
  /** End of time range (ISO timestamp) */
  to?: string;
  /** Filter by rig name */
  rig?: string;
  /** Filter by worker name */
  worker?: string;
  /** Filter by convoy ID */
  convoy?: string;
  /** Include full issue breakdown */
  include_issues?: boolean;
  /** Include hourly data */
  include_hourly?: boolean;
  /** Include efficiency metrics */
  include_efficiency?: boolean;
}

// ============================================================================
// Journey Types - Work lifecycle stage tracking
// ============================================================================

/**
 * Journey stages representing the work lifecycle.
 *
 * Every piece of work follows this progression:
 * ```
 * QUEUED → CLAIMED → WORKING → PR_READY → REFINERY → MERGED
 *   0        1         2          3          4          5
 * ```
 */
export enum JourneyStage {
  /** Stage 0: Issue created, not yet assigned */
  QUEUED = 0,
  /** Stage 1: Witness assigned polecat, branch created */
  CLAIMED = 1,
  /** Stage 2: Active development (see WorkingSubstage for detail) */
  WORKING = 2,
  /** Stage 3: PR opened, awaiting review */
  PR_READY = 3,
  /** Stage 4: In merge queue, processing (see RefinerySubstage for detail) */
  REFINERY = 4,
  /** Stage 5: PR merged to main (terminal state) */
  MERGED = 5,
}

/**
 * Substages within the WORKING stage (Stage 2).
 *
 * ```
 * 2a: ANALYZING → 2b: CODING → 2c: TESTING → 2d: PR_PREP
 * ```
 */
export type WorkingSubstage = "2a" | "2b" | "2c" | "2d";

/**
 * Human-readable names for working substages.
 */
export const WORKING_SUBSTAGE_LABELS: Record<WorkingSubstage, string> = {
  "2a": "Analyzing",
  "2b": "Coding",
  "2c": "Testing",
  "2d": "PR Prep",
};

/**
 * Substages within the REFINERY stage (Stage 4).
 *
 * ```
 * 4a: REBASING → 4b: TESTING → 4c: MERGING
 * ```
 */
export type RefinerySubstage = "4a" | "4b" | "4c";

/**
 * Human-readable names for refinery substages.
 */
export const REFINERY_SUBSTAGE_LABELS: Record<RefinerySubstage, string> = {
  "4a": "Rebasing",
  "4b": "Testing",
  "4c": "Merging",
};

/**
 * Human-readable names for journey stages.
 */
export const JOURNEY_STAGE_LABELS: Record<JourneyStage, string> = {
  [JourneyStage.QUEUED]: "Queued",
  [JourneyStage.CLAIMED]: "Claimed",
  [JourneyStage.WORKING]: "Working",
  [JourneyStage.PR_READY]: "PR Ready",
  [JourneyStage.REFINERY]: "Refinery",
  [JourneyStage.MERGED]: "Merged",
};

/**
 * Actor types responsible for each stage.
 */
export const JOURNEY_STAGE_ACTORS: Record<JourneyStage, string> = {
  [JourneyStage.QUEUED]: "beads",
  [JourneyStage.CLAIMED]: "witness",
  [JourneyStage.WORKING]: "polecat",
  [JourneyStage.PR_READY]: "witness",
  [JourneyStage.REFINERY]: "refinery",
  [JourneyStage.MERGED]: "refinery",
};

/**
 * Expected duration concerns for each stage.
 */
export const JOURNEY_STAGE_DURATION_CONCERNS: Record<JourneyStage, string> = {
  [JourneyStage.QUEUED]: "< 5min",
  [JourneyStage.CLAIMED]: "< 2min",
  [JourneyStage.WORKING]: "Varies by complexity",
  [JourneyStage.PR_READY]: "< 15min",
  [JourneyStage.REFINERY]: "< 10min",
  [JourneyStage.MERGED]: "Terminal state",
};

/**
 * Timestamps for journey stage transitions.
 */
export interface JourneyTimestamps {
  /** When issue entered the queue */
  queued?: string;
  /** When polecat was assigned */
  claimed?: string;
  /** When work actively started */
  workStarted?: string;
  /** When PR was opened */
  prOpened?: string;
  /** When PR entered the refinery/merge queue */
  refineryEntered?: string;
  /** When PR was merged */
  merged?: string;
}

/**
 * Complete journey state for a work item.
 */
export interface JourneyState {
  /** Current stage (0-5) */
  currentStage: JourneyStage;
  /** Substage within WORKING stage */
  substage?: WorkingSubstage;
  /** Substage within REFINERY stage */
  refinerySubstage?: RefinerySubstage;
  /** Stage transition timestamps */
  timestamps: JourneyTimestamps;
  /** Current actor (polecat name, etc.) */
  actor?: string;
  /** Whether work is blocked */
  blocked?: boolean;
  /** Blocking reason if blocked */
  blockReason?: string;
}

/**
 * Props for the JourneyTracker component.
 */
export interface JourneyTrackerProps {
  /** Issue/bead ID being tracked */
  issueId: string;
  /** Current stage (0-5) */
  currentStage: JourneyStage;
  /** Substage if in WORKING stage */
  substage?: WorkingSubstage;
  /** Substage if in REFINERY stage */
  refinerySubstage?: RefinerySubstage;
  /** Stage transition timestamps */
  timestamps: JourneyTimestamps;
  /** Current actor (polecat name, etc.) */
  actor?: string;
  /** Whether work is blocked */
  blocked?: boolean;
  /** Number of commits (if in WORKING stage) */
  commitCount?: number;
}

/**
 * Issue with journey information for convoy aggregation.
 */
export interface JourneyIssue {
  /** Issue/bead ID */
  id: string;
  /** Issue title */
  title: string;
  /** Journey state */
  journey: JourneyState;
  /** Total time spent (in minutes) */
  totalTimeMinutes?: number;
  /** Assigned worker name */
  worker?: string;
}

/**
 * Aggregate journey view for a convoy.
 */
export interface ConvoyJourneyState {
  /** Convoy ID */
  convoyId: string;
  /** Convoy title */
  title: string;
  /** Overall progress (0-100) */
  progressPercent: number;
  /** Total issues in convoy */
  issueCount: number;
  /** Issues merged (completed) */
  completedCount: number;
  /** Count of issues at each stage */
  stageDistribution: Record<JourneyStage, number>;
  /** Issues with their journey state */
  issues: JourneyIssue[];
}

// ============================================================================
// Stage Detection Signals
// ============================================================================

/**
 * Events that trigger stage transitions.
 */
export const STAGE_TRANSITION_SIGNALS = {
  // Stage 0 → 1: Issue claimed
  "issue.assigned": { from: JourneyStage.QUEUED, to: JourneyStage.CLAIMED },
  "polecat.spawned": { from: JourneyStage.QUEUED, to: JourneyStage.CLAIMED },

  // Stage 1 → 2: Work started
  "polecat.started": { from: JourneyStage.CLAIMED, to: JourneyStage.WORKING },
  "git.branch.created": { from: JourneyStage.CLAIMED, to: JourneyStage.WORKING },

  // Stage 2 → 3: PR opened
  "pr.opened": { from: JourneyStage.WORKING, to: JourneyStage.PR_READY },

  // Stage 3 → 4: Entered refinery/merge queue
  "pr.approved": { from: JourneyStage.PR_READY, to: JourneyStage.REFINERY },
  "merge_queue.entered": { from: JourneyStage.PR_READY, to: JourneyStage.REFINERY },

  // Stage 4 → 5: Merged
  "pr.merged": { from: JourneyStage.REFINERY, to: JourneyStage.MERGED },
  "issue.closed": { from: JourneyStage.REFINERY, to: JourneyStage.MERGED },
} as const;

/**
 * Signals that indicate substage within WORKING stage.
 */
export const SUBSTAGE_DETECTION_SIGNALS: Record<string, WorkingSubstage> = {
  // 2a: Analyzing
  "tool.read": "2a",
  "tool.grep": "2a",
  "tool.glob": "2a",

  // 2b: Coding
  "tool.write": "2b",
  "tool.edit": "2b",
  "git.commit": "2b",

  // 2c: Testing
  "command.test": "2c",
  "command.pytest": "2c",
  "command.npm_test": "2c",

  // 2d: PR Prep
  "git.push": "2d",
  "pr.draft": "2d",
};

/**
 * Signals that indicate substage within REFINERY stage.
 */
export const REFINERY_SUBSTAGE_DETECTION_SIGNALS: Record<string, RefinerySubstage> = {
  // 4a: Rebasing
  "refinery.rebase.start": "4a",
  "refinery.rebase.in_progress": "4a",

  // 4b: Testing
  "refinery.test.start": "4b",
  "refinery.test.running": "4b",
  "refinery.ci.running": "4b",

  // 4c: Merging
  "refinery.merge.start": "4c",
  "refinery.merge.in_progress": "4c",
};

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Check if a stage is terminal (no further progression possible).
 */
export function isTerminalStage(stage: JourneyStage): boolean {
  return stage === JourneyStage.MERGED;
}

/**
 * Check if a stage is actionable (work can be done).
 */
export function isActionableStage(stage: JourneyStage): boolean {
  return stage === JourneyStage.QUEUED || stage === JourneyStage.WORKING;
}

/**
 * Get the next expected stage in the journey.
 */
export function getNextStage(stage: JourneyStage): JourneyStage | null {
  if (stage >= JourneyStage.MERGED) return null;
  return stage + 1;
}

/**
 * Calculate duration between two timestamps in human-readable format.
 */
export function formatDuration(start: string, end?: string): string {
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  const diffMinutes = Math.floor((endTime - startTime) / 60000);

  if (diffMinutes < 1) return "< 1m";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format timestamp as relative time (e.g., "2m ago", "1h ago").
 */
export function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diffMinutes = Math.floor((now - time) / 60000);

  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ============================================================================
// Cost/Token Types (Phase 2B)
// ============================================================================

/**
 * Token pricing constants (Claude 3.5 Sonnet baseline)
 */
export const TOKEN_PRICING = {
  /** $ per 1M input tokens */
  input_per_million: 3.0,
  /** $ per 1M output tokens */
  output_per_million: 15.0,
  /** $ per 1M cache read tokens */
  cache_read_per_million: 0.3,
} as const;

/**
 * Token usage breakdown
 */
export interface TokenUsage {
  input: number;
  output: number;
  cache_read: number;
  total: number;
}

/**
 * Cost breakdown for an entity (issue, convoy, worker)
 */
export interface EntityCost {
  /** Total tokens used */
  totalTokens: number;
  /** Token breakdown */
  tokens: TokenUsage;
  /** Estimated cost in USD */
  estimatedCostUsd: number;
  /** Duration in minutes */
  durationMinutes?: number;
  /** Efficiency metric: tokens per minute */
  tokensPerMinute?: number;
}

/**
 * Issue-level cost tracking
 */
export interface IssueCost extends EntityCost {
  issueId: string;
  workersInvolved: string[];
}

/**
 * Convoy-level cost tracking
 */
export interface ConvoyCost extends EntityCost {
  convoyId: string;
  issueCount: number;
  avgCostPerIssue: number;
  issues: IssueCost[];
}

/**
 * Worker-level cost tracking (for charts)
 */
export interface ChartWorkerCost extends EntityCost {
  workerName: string;
  rig: string;
  issuesWorked: string[];
  sessionCount: number;
  /** Efficiency score: tokens per issue completed */
  efficiencyScore?: number;
}

/**
 * Simple hourly usage data point for charts (used by cost visualization)
 */
export interface ChartHourlyUsage {
  hour: string; // ISO timestamp
  tokens: number;
  costUsd: number;
  activeWorkers: number;
}

/**
 * Cost breakdown by agent type
 */
export interface AgentTypeCosts {
  polecat: EntityCost;
  witness: EntityCost;
  refinery: EntityCost;
  mayor: EntityCost;
}

/**
 * Trend direction for cost comparisons
 */
export type CostTrend = "up" | "down" | "flat";

/**
 * Calculate USD cost from token usage
 */
export function calculateCost(usage: TokenUsage): number {
  return (
    (usage.input * TOKEN_PRICING.input_per_million) / 1_000_000 +
    (usage.output * TOKEN_PRICING.output_per_million) / 1_000_000 +
    (usage.cache_read * TOKEN_PRICING.cache_read_per_million) / 1_000_000
  );
}

/**
 * Format token count for display (e.g., "1.2M", "450k")
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${Math.round(tokens / 1_000)}k`;
  }
  return String(tokens);
}

/**
 * Format USD cost for display (e.g., "$12.50", "$0.87")
 */
export function formatCostUsd(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

/**
 * Calculate trend based on current vs previous value
 */
export function calculateTrend(current: number, previous: number): CostTrend {
  if (previous === 0) return "flat";
  const change = (current - previous) / previous;
  if (change > 0.05) return "up";
  if (change < -0.05) return "down";
  return "flat";
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

// ============================================================================
// Epic Journey Types - Container work lifecycle
// ============================================================================

/**
 * Epic journey stages representing the container work lifecycle.
 *
 * Epics follow a different progression than tasks:
 * ```
 * CREATED → PLANNED → ACTIVE → CLOSE_ELIGIBLE → CLOSED
 *    0         1         2           3            4
 * ```
 *
 * Key difference from task journey:
 * - CLOSE_ELIGIBLE is GREEN (ready to close) not yellow (in-progress)
 * - Progress is based on children, not the epic itself
 */
export enum EpicJourneyStage {
  /** Stage 0: Epic created, no children yet */
  CREATED = 0,
  /** Stage 1: Children defined but none started */
  PLANNED = 1,
  /** Stage 2: At least one child is in progress */
  ACTIVE = 2,
  /** Stage 3: All children closed - READY TO CLOSE (GREEN!) */
  CLOSE_ELIGIBLE = 3,
  /** Stage 4: Epic officially closed (terminal state) */
  CLOSED = 4,
}

/**
 * Human-readable labels for epic journey stages.
 */
export const EPIC_JOURNEY_LABELS: Record<EpicJourneyStage, string> = {
  [EpicJourneyStage.CREATED]: "Created",
  [EpicJourneyStage.PLANNED]: "Planned",
  [EpicJourneyStage.ACTIVE]: "Active",
  [EpicJourneyStage.CLOSE_ELIGIBLE]: "Ready to Close",
  [EpicJourneyStage.CLOSED]: "Closed",
};

/**
 * Actor types responsible for each epic stage.
 */
export const EPIC_STAGE_ACTORS: Record<EpicJourneyStage, string> = {
  [EpicJourneyStage.CREATED]: "beads",
  [EpicJourneyStage.PLANNED]: "beads",
  [EpicJourneyStage.ACTIVE]: "polecats",
  [EpicJourneyStage.CLOSE_ELIGIBLE]: "beads",
  [EpicJourneyStage.CLOSED]: "beads",
};

/**
 * Timestamps for epic journey stage transitions.
 */
export interface EpicJourneyTimestamps {
  /** When epic was created */
  created?: string;
  /** When first child was added */
  planned?: string;
  /** When first child entered in_progress */
  activated?: string;
  /** When all children became closed */
  closeEligible?: string;
  /** When epic was officially closed */
  closed?: string;
}

/**
 * Progress tracking for epic children.
 * Note: Excludes the epic itself from counts.
 */
export interface EpicProgress {
  /** Total number of children (NOT including the epic) */
  total: number;
  /** Children with open status */
  open: number;
  /** Children with in_progress or hooked status */
  inProgress: number;
  /** Children with blocked status */
  blocked: number;
  /** Children with deferred status */
  deferred: number;
  /** Children with closed status */
  closed: number;
  /** Percentage complete: (closed / total) * 100 */
  percentComplete: number;
}

/**
 * Props for the EpicJourneyTracker component.
 */
export interface EpicJourneyTrackerProps {
  /** Epic ID being tracked */
  epicId: string;
  /** Current stage (0-4) */
  currentStage: EpicJourneyStage;
  /** Stage transition timestamps */
  timestamps: EpicJourneyTimestamps;
  /** Progress of children */
  progress: EpicProgress;
}

/**
 * Derive epic journey stage from child progress and epic status.
 */
export function deriveEpicJourneyStage(
  epicStatus: string,
  progress: EpicProgress
): EpicJourneyStage {
  // If explicitly closed
  if (epicStatus === "closed") {
    return EpicJourneyStage.CLOSED;
  }

  // No children = just created
  if (progress.total === 0) {
    return EpicJourneyStage.CREATED;
  }

  // All children closed = close-eligible
  if (progress.closed === progress.total) {
    return EpicJourneyStage.CLOSE_ELIGIBLE;
  }

  // At least one child in progress = active
  if (progress.inProgress > 0) {
    return EpicJourneyStage.ACTIVE;
  }

  // Has children but none in progress = planned
  return EpicJourneyStage.PLANNED;
}

/**
 * Calculate epic progress from a list of child beads.
 */
export function calculateEpicProgress(children: Array<{ status: string }>): EpicProgress {
  const stats = children.reduce(
    (acc, child) => {
      const status = child.status.toLowerCase();
      switch (status) {
        case "open":
          acc.open++;
          break;
        case "in_progress":
        case "hooked":
          acc.inProgress++;
          break;
        case "blocked":
          acc.blocked++;
          break;
        case "deferred":
          acc.deferred++;
          break;
        case "closed":
        case "done":
        case "completed":
          acc.closed++;
          break;
        default:
          acc.open++; // Unknown status counts as open
      }
      return acc;
    },
    { open: 0, inProgress: 0, blocked: 0, deferred: 0, closed: 0 }
  );

  const total = children.length;
  const percentComplete = total > 0 ? Math.round((stats.closed / total) * 100) : 0;

  return {
    total,
    ...stats,
    percentComplete,
  };
}
