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
