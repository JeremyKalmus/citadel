import { exec } from "child_process";
import { promisify } from "util";
import type {
  WorkingSubstage as TypesWorkingSubstage,
  JourneyState,
  ChartWorkerCost,
  TokenUsage as TypedTokenUsage,
  ChartHourlyUsage
} from "./gastown/types";
import {
  JourneyStage as TypesJourneyStage,
  SUBSTAGE_DETECTION_SIGNALS,
  calculateCost
} from "./gastown/types";

const execAsync = promisify(exec);

// ============================================================================
// Journey Stage Types
// ============================================================================

/**
 * JourneyStage represents the lifecycle stage of a worker's current task.
 * Used to provide at-a-glance visibility into work progress.
 *
 * Stages:
 * - idle: No work assigned, waiting for assignment
 * - assigned: Work slung but session not started
 * - working: Actively executing the task
 * - blocked: Waiting for dependency, approval, or human intervention
 * - review: Work complete, PR created, awaiting merge
 * - complete: Task finished, merged or closed
 * - error: Worker crashed or in error state
 */
export type JourneyStage =
  | "idle"
  | "assigned"
  | "working"
  | "blocked"
  | "review"
  | "complete"
  | "error";

/**
 * Substages for the "working" stage, providing more granular progress visibility.
 * These are optional refinements detected through heuristics.
 */
export type WorkingSubstage =
  | "understanding"  // 2a: Reading code, researching
  | "implementing"   // 2b: Writing code
  | "testing"        // 2c: Running tests, fixing issues
  | "preparing"      // 2d: Creating PR, final cleanup
  | null;            // Unknown/undetectable

/**
 * Journey information for a worker, including stage and metadata.
 */
export interface WorkerJourney {
  /** Current lifecycle stage */
  stage: JourneyStage;
  /** Substage if in working state */
  substage: WorkingSubstage;
  /** Human-readable stage label */
  label: string;
  /** Time entered current stage (if available) */
  stageEnteredAt?: string;
  /** Assigned issue/bead ID if any */
  assignedIssue?: string;
  /** Branch name if available */
  branch?: string;
  /** Whether a PR exists for this work */
  hasPR?: boolean;
}

// ============================================================================
// Types
// ============================================================================

export interface Overseer {
  name: string;
  email: string;
  username: string;
  source: string;
  unread_mail: number;
}

export interface Agent {
  name: string;
  address: string;
  session: string;
  role: "coordinator" | "health-check" | "witness" | "refinery" | "polecat" | "crew";
  running: boolean;
  has_work: boolean;
  state?: string;
  unread_mail: number;
  first_subject?: string;
}

export interface Hook {
  agent: string;
  role: string;
  has_work: boolean;
}

export interface MergeQueue {
  pending: number;
  in_flight: number;
  blocked: number;
  state: string;
  health: string;
}

export interface Rig {
  name: string;
  polecats: string[];
  polecat_count: number;
  crews: string[] | null;
  crew_count: number;
  has_witness: boolean;
  has_refinery: boolean;
  hooks: Hook[];
  agents: Agent[];
  mq?: MergeQueue;
}

export interface TownStatus {
  name: string;
  location: string;
  overseer: Overseer;
  agents: Agent[];
  rigs: Rig[];
}

export interface Convoy {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export interface Polecat {
  rig: string;
  name: string;
  state: string;
  session_running: boolean;
  last_activity?: string;
}

export interface PolecatDetail {
  rig: string;
  name: string;
  state: string;
  clone_path: string;
  branch: string;
  session_running: boolean;
  session_id: string;
  windows: number;
  last_activity: string;
}

export interface ConvoyDetail {
  id: string;
  title: string;
  status: string;
  created_at: string;
  issues?: string[];
  assigned_workers?: string[];
}

export interface TokenUsage {
  actor: string;
  input: number;
  output: number;
  cache_read: number;
  total: number;
  timestamp: string;
}

export interface BeadDependency {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  issue_type: string;
  assignee?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  dependency_type: "blocks" | "parent-child";
}

export interface BeadDetail {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  issue_type: string;
  assignee?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  dependencies?: BeadDependency[];
  parent?: string;
}

export interface GuzzolineStats {
  total_tokens_today: number;
  total_tokens_week: number;
  sessions_today: number;
  by_agent_type: {
    polecat: number;
    witness: number;
    refinery: number;
    mayor: number;
  };
  recent_sessions: TokenUsage[];
  budget_warnings: number;
}

// Re-export cost utilities for backwards compatibility
export { formatCost, calculateCost } from "./cost-utils";
export type { SparklinePoint, FormatCostOptions } from "./cost-utils";

// ============================================================================
// Enhanced Guzzoline Stats (CT-002)
// ============================================================================

/**
 * Token usage aggregated by issue/bead ID.
 * Enables per-issue cost visibility and ROI analysis.
 */
export interface IssueTokenUsage {
  /** Issue/bead ID (e.g., "ct-abc", "hq-xyz") */
  issueId: string;
  /** Issue title if available */
  title?: string;
  /** Total input tokens consumed */
  inputTokens: number;
  /** Total output tokens generated */
  outputTokens: number;
  /** Cache read tokens (reduced cost) */
  cacheReadTokens: number;
  /** Total tokens (input + output) */
  totalTokens: number;
  /** Number of sessions/invocations for this issue */
  sessionCount: number;
  /** First activity timestamp */
  firstActivity: string;
  /** Most recent activity timestamp */
  lastActivity: string;
  /** Actors (workers) who worked on this issue */
  actors: string[];
}

/**
 * Enhanced guzzoline stats including per-issue breakdown.
 * Extends base GuzzolineStats with issue-level granularity.
 */
export interface EnhancedGuzzolineStats extends GuzzolineStats {
  /** Token usage aggregated by issue ID */
  by_issue: IssueTokenUsage[];
  /** Top issues by token consumption (sorted descending) */
  top_issues: IssueTokenUsage[];
  /** Issues with activity today */
  active_issues_today: number;
}

/**
 * Token usage aggregated by convoy.
 * Enables cost visibility per batch of coordinated work.
 */
export interface ConvoyTokenUsage {
  /** Convoy ID */
  convoyId: string;
  /** Convoy title */
  title: string;
  /** Convoy status */
  status: string;
  /** Issues included in this convoy */
  issues: string[];
  /** Total input tokens for all issues in convoy */
  inputTokens: number;
  /** Total output tokens for all issues in convoy */
  outputTokens: number;
  /** Total cache read tokens */
  cacheReadTokens: number;
  /** Total tokens consumed by this convoy */
  totalTokens: number;
  /** Number of sessions across all issues */
  sessionCount: number;
  /** Unique actors who worked on this convoy */
  actors: string[];
  /** First activity timestamp */
  firstActivity?: string;
  /** Most recent activity timestamp */
  lastActivity?: string;
}

/**
 * Extended enhanced stats including convoy breakdown.
 */
export interface EnhancedGuzzolineStatsWithConvoys extends EnhancedGuzzolineStats {
  /** Token usage aggregated by convoy */
  by_convoy: ConvoyTokenUsage[];
  /** Top convoys by token consumption */
  top_convoys: ConvoyTokenUsage[];
}

// ============================================================================
// Journey Stage Detection
// ============================================================================

/**
 * Stage labels for display
 */
const stageLabels: Record<JourneyStage, string> = {
  idle: "Idle",
  assigned: "Assigned",
  working: "Working",
  blocked: "Blocked",
  review: "In Review",
  complete: "Complete",
  error: "Error",
};

/**
 * Substage labels for display
 */
const substageLabels: Record<Exclude<WorkingSubstage, null>, string> = {
  understanding: "Understanding",
  implementing: "Implementing",
  testing: "Testing",
  preparing: "Preparing PR",
};

/**
 * Detect the journey stage from a polecat's state and context.
 *
 * Detection logic:
 * 1. Dead state → error
 * 2. Done state with session not running → complete
 * 3. Blocked state → blocked
 * 4. Working state with session running → working
 * 5. Has work but session not running → assigned
 * 6. No work → idle
 *
 * @param polecat - The polecat to analyze
 * @param hasAssignedWork - Whether work is slung to this worker (from hook)
 * @param hasPR - Whether a PR exists for current work
 * @returns Journey information
 */
export function detectJourneyStage(
  polecat: Polecat | PolecatDetail,
  hasAssignedWork = false,
  hasPR = false
): WorkerJourney {
  const state = polecat.state?.toLowerCase() ?? "";
  const sessionRunning = polecat.session_running;
  const branch = "branch" in polecat ? polecat.branch : undefined;

  // Error state - worker crashed or dead
  if (state === "dead") {
    return {
      stage: "error",
      substage: null,
      label: stageLabels.error,
      branch,
    };
  }

  // Complete state - work finished
  if (state === "done" && !sessionRunning) {
    return {
      stage: "complete",
      substage: null,
      label: stageLabels.complete,
      branch,
    };
  }

  // Review state - PR exists, likely awaiting merge
  if (hasPR && (state === "done" || state === "waiting")) {
    return {
      stage: "review",
      substage: null,
      label: stageLabels.review,
      branch,
      hasPR: true,
    };
  }

  // Blocked state - waiting on dependency or approval
  if (state === "blocked") {
    return {
      stage: "blocked",
      substage: null,
      label: stageLabels.blocked,
      branch,
    };
  }

  // Working state - actively executing
  if ((state === "working" || state === "waiting") && sessionRunning) {
    return {
      stage: "working",
      substage: null, // Substage detection handled separately (JV-008)
      label: stageLabels.working,
      branch,
    };
  }

  // Assigned state - work slung but session not active
  if (hasAssignedWork && !sessionRunning) {
    return {
      stage: "assigned",
      substage: null,
      label: stageLabels.assigned,
      branch,
    };
  }

  // Idle state - no work assigned
  return {
    stage: "idle",
    substage: null,
    label: stageLabels.idle,
    branch,
  };
}

/**
 * Get stage label with optional substage
 */
export function getJourneyLabel(journey: WorkerJourney): string {
  if (journey.stage === "working" && journey.substage) {
    return `${stageLabels.working}: ${substageLabels[journey.substage]}`;
  }
  return journey.label;
}

/**
 * Get a journey stage icon name for the UI
 */
export function getJourneyIcon(stage: JourneyStage): string {
  switch (stage) {
    case "idle":
      return "clock";
    case "assigned":
      return "play-circle";
    case "working":
      return "activity";
    case "blocked":
      return "lock";
    case "review":
      return "check-circle";
    case "complete":
      return "check-circle";
    case "error":
      return "x-circle";
    default:
      return "clock";
  }
}

/**
 * Get a journey stage color class for the UI
 */
export function getJourneyColor(stage: JourneyStage): string {
  switch (stage) {
    case "idle":
      return "text-ash";
    case "assigned":
      return "text-fuel-yellow";
    case "working":
      return "text-acid-green";
    case "blocked":
      return "text-rust-orange";
    case "review":
      return "text-fuel-yellow";
    case "complete":
      return "text-acid-green";
    case "error":
      return "text-status-dead";
    default:
      return "text-ash";
  }
}

// ============================================================================
// Git Activity Types (Part 3: Git Diff Viewer)
// ============================================================================

export type FileChangeStatus = "added" | "modified" | "deleted" | "renamed";

export interface FileChange {
  path: string;
  status: FileChangeStatus;
  additions: number;
  deletions: number;
  patch?: string; // Unified diff format
}

export interface CommitStats {
  additions: number;
  deletions: number;
  files_changed: number;
}

export interface Commit {
  sha: string;
  message: string;
  timestamp: string;
  author: string;
  stats: CommitStats;
  files: FileChange[];
}

export interface WorkerGitActivity {
  worker: string;
  rig: string;
  branch: string;
  base_branch: string;
  commits: Commit[];
  total_additions: number;
  total_deletions: number;
  files_changed: string[];
}

// ============================================================================
// Git Activity Parsing Helpers
// ============================================================================

function parseFileStatus(statusChar: string): FileChangeStatus {
  switch (statusChar) {
    case "A":
      return "added";
    case "D":
      return "deleted";
    case "R":
      return "renamed";
    default:
      return "modified";
  }
}

function parseNumstatLine(line: string): { additions: number; deletions: number; path: string } | null {
  const match = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
  if (!match) return null;
  return {
    additions: match[1] === "-" ? 0 : parseInt(match[1], 10),
    deletions: match[2] === "-" ? 0 : parseInt(match[2], 10),
    path: match[3],
  };
}

function parseGitLog(logOutput: string): Omit<Commit, "files">[] {
  const commits: Omit<Commit, "files">[] = [];
  const lines = logOutput.trim().split("\n").filter(Boolean);

  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length >= 4) {
      commits.push({
        sha: parts[0],
        message: parts[1],
        timestamp: parts[2],
        author: parts[3],
        stats: { additions: 0, deletions: 0, files_changed: 0 },
      });
    }
  }

  return commits;
}

function parseDiffNumstat(numstatOutput: string): Map<string, { additions: number; deletions: number }> {
  const fileStats = new Map<string, { additions: number; deletions: number }>();
  const lines = numstatOutput.trim().split("\n").filter(Boolean);

  for (const line of lines) {
    const parsed = parseNumstatLine(line);
    if (parsed) {
      fileStats.set(parsed.path, { additions: parsed.additions, deletions: parsed.deletions });
    }
  }

  return fileStats;
}

function parseNameStatus(nameStatusOutput: string): Map<string, FileChangeStatus> {
  const fileStatuses = new Map<string, FileChangeStatus>();
  const lines = nameStatusOutput.trim().split("\n").filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^([AMDRT])\d*\t(.+?)(?:\t.+)?$/);
    if (match) {
      fileStatuses.set(match[2], parseFileStatus(match[1]));
    }
  }

  return fileStatuses;
}

// ============================================================================
// Beads Types (for DependencyGraph)
// ============================================================================

export type BeadStatus = 'open' | 'in_progress' | 'hooked' | 'closed' | 'blocked';
export type BeadType = 'task' | 'bug' | 'feature' | 'epic';
export type BeadPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface Bead {
  id: string;
  title: string;
  status: BeadStatus;
  type: BeadType;
  priority: BeadPriority;
  assignee?: string;
  created: string;
  updated: string;
  depends_on: string[];
  blocks: string[];
  parent?: string;
  children?: string[];
}

export interface BeadsData {
  beads: Bead[];
  total: number;
  open: number;
  in_progress: number;
  blocked: number;
}

// ============================================================================
// Client
// ============================================================================

export interface GasTownClientOptions {
  cwd?: string;
}

export class GasTownClient {
  private cwd: string;

  constructor(options: GasTownClientOptions = {}) {
    this.cwd = options.cwd || process.env.GT_ROOT || "/Users/jeremykalmus/gt";
  }

  private async runCommand<T>(command: string): Promise<T> {
    const { stdout } = await execAsync(command, { cwd: this.cwd });
    return JSON.parse(stdout) as T;
  }

  async getStatus(): Promise<TownStatus> {
    return this.runCommand<TownStatus>("gt status --json");
  }

  async getConvoys(): Promise<Convoy[]> {
    return this.runCommand<Convoy[]>("gt convoy list --json");
  }

  async getPolecats(rig: string): Promise<Polecat[]> {
    return this.runCommand<Polecat[]>(`gt polecat list ${rig} --json`);
  }

  async getAllPolecats(): Promise<Polecat[]> {
    const status = await this.getStatus();
    const allPolecats: Polecat[] = [];

    for (const rig of status.rigs) {
      const polecats = await this.getPolecats(rig.name);
      allPolecats.push(...(polecats || []));
    }

    return allPolecats;
  }

  async getGuzzolineStats(): Promise<GuzzolineStats> {
    const fs = await import("fs/promises");
    const path = await import("path");

    const eventsFile = path.join(this.cwd, ".events.jsonl");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const stats: GuzzolineStats = {
      total_tokens_today: 0,
      total_tokens_week: 0,
      sessions_today: 0,
      by_agent_type: {
        polecat: 0,
        witness: 0,
        refinery: 0,
        mayor: 0,
      },
      recent_sessions: [],
      budget_warnings: 0,
    };

    try {
      const content = await fs.readFile(eventsFile, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          const eventTime = new Date(event.ts);

          // Count token_usage events from guzzoline
          if (event.source === "guzzoline" && event.type === "token_usage") {
            const tokens = event.payload?.tokens?.total ?? 0;

            if (eventTime >= weekStart) {
              stats.total_tokens_week += tokens;

              // Categorize by agent type
              const actor = event.actor || "";
              if (actor.includes("witness")) {
                stats.by_agent_type.witness += tokens;
              } else if (actor.includes("refinery")) {
                stats.by_agent_type.refinery += tokens;
              } else if (actor.includes("mayor")) {
                stats.by_agent_type.mayor += tokens;
              } else {
                stats.by_agent_type.polecat += tokens;
              }

              if (eventTime >= todayStart) {
                stats.total_tokens_today += tokens;
                stats.sessions_today++;
              }

              // Track recent sessions (last 10)
              stats.recent_sessions.push({
                actor: event.actor,
                input: event.payload?.tokens?.input ?? 0,
                output: event.payload?.tokens?.output ?? 0,
                cache_read: event.payload?.tokens?.cache_read ?? 0,
                total: tokens,
                timestamp: event.ts,
              });
            }
          }

          // Count budget warnings
          if (event.source === "guzzoline" && event.type === "budget_exceeded") {
            if (eventTime >= todayStart) {
              stats.budget_warnings++;
            }
          }
        } catch {
          // Skip malformed lines
        }
      }

      // Keep only last 10 sessions, sorted by time descending
      stats.recent_sessions = stats.recent_sessions
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

    } catch {
      // File doesn't exist or can't be read - return empty stats
    }

    return stats;
  }

  /**
   * Get enhanced guzzoline stats including per-issue token breakdown.
   * Parses events.jsonl and aggregates token usage by issue ID.
   */
  async getEnhancedGuzzolineStats(): Promise<EnhancedGuzzolineStats> {
    const fs = await import("fs/promises");
    const path = await import("path");

    const eventsFile = path.join(this.cwd, ".events.jsonl");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    // Base stats
    const stats: EnhancedGuzzolineStats = {
      total_tokens_today: 0,
      total_tokens_week: 0,
      sessions_today: 0,
      by_agent_type: {
        polecat: 0,
        witness: 0,
        refinery: 0,
        mayor: 0,
      },
      recent_sessions: [],
      budget_warnings: 0,
      by_issue: [],
      top_issues: [],
      active_issues_today: 0,
    };

    // Map for per-issue aggregation
    const issueMap = new Map<string, IssueTokenUsage>();

    try {
      const content = await fs.readFile(eventsFile, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          const eventTime = new Date(event.ts);

          // Count token_usage events from guzzoline
          if (event.source === "guzzoline" && event.type === "token_usage") {
            const tokens = event.payload?.tokens?.total ?? 0;
            const inputTokens = event.payload?.tokens?.input ?? 0;
            const outputTokens = event.payload?.tokens?.output ?? 0;
            const cacheReadTokens = event.payload?.tokens?.cache_read ?? 0;

            if (eventTime >= weekStart) {
              stats.total_tokens_week += tokens;

              // Categorize by agent type
              const actor = event.actor || "";
              if (actor.includes("witness")) {
                stats.by_agent_type.witness += tokens;
              } else if (actor.includes("refinery")) {
                stats.by_agent_type.refinery += tokens;
              } else if (actor.includes("mayor")) {
                stats.by_agent_type.mayor += tokens;
              } else {
                stats.by_agent_type.polecat += tokens;
              }

              if (eventTime >= todayStart) {
                stats.total_tokens_today += tokens;
                stats.sessions_today++;
              }

              // Track recent sessions (last 10)
              stats.recent_sessions.push({
                actor: event.actor,
                input: inputTokens,
                output: outputTokens,
                cache_read: cacheReadTokens,
                total: tokens,
                timestamp: event.ts,
              });

              // Per-issue aggregation
              // Look for issue ID in payload.issue, payload.bead, or context.issue
              const issueId =
                event.payload?.issue ||
                event.payload?.bead ||
                event.context?.issue ||
                event.context?.bead ||
                null;

              if (issueId) {
                const existing = issueMap.get(issueId);
                if (existing) {
                  existing.inputTokens += inputTokens;
                  existing.outputTokens += outputTokens;
                  existing.cacheReadTokens += cacheReadTokens;
                  existing.totalTokens += tokens;
                  existing.sessionCount++;
                  existing.lastActivity = event.ts;
                  if (!existing.actors.includes(actor)) {
                    existing.actors.push(actor);
                  }
                } else {
                  issueMap.set(issueId, {
                    issueId,
                    title: event.payload?.title || event.context?.title,
                    inputTokens,
                    outputTokens,
                    cacheReadTokens,
                    totalTokens: tokens,
                    sessionCount: 1,
                    firstActivity: event.ts,
                    lastActivity: event.ts,
                    actors: [actor],
                  });
                }
              }
            }
          }

          // Count budget warnings
          if (event.source === "guzzoline" && event.type === "budget_exceeded") {
            if (eventTime >= todayStart) {
              stats.budget_warnings++;
            }
          }
        } catch {
          // Skip malformed lines
        }
      }

      // Keep only last 10 sessions, sorted by time descending
      stats.recent_sessions = stats.recent_sessions
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      // Convert issue map to array
      stats.by_issue = Array.from(issueMap.values());

      // Top issues sorted by total tokens (descending)
      stats.top_issues = [...stats.by_issue]
        .sort((a, b) => b.totalTokens - a.totalTokens)
        .slice(0, 10);

      // Count issues with activity today
      stats.active_issues_today = stats.by_issue.filter(
        (issue) => new Date(issue.lastActivity) >= todayStart
      ).length;

    } catch {
      // File doesn't exist or can't be read - return empty stats
    }

    return stats;
  }

  /**
   * Get enhanced guzzoline stats with convoy breakdown.
   * Aggregates issue token usage by convoy for cost visibility.
   */
  async getGuzzolineStatsWithConvoys(): Promise<EnhancedGuzzolineStatsWithConvoys> {
    // Get base enhanced stats with per-issue breakdown
    const baseStats = await this.getEnhancedGuzzolineStats();

    // Get all convoys
    const convoys = await this.getConvoys();

    // Build issue -> tokens lookup map
    const issueTokensMap = new Map<string, IssueTokenUsage>();
    for (const issue of baseStats.by_issue) {
      issueTokensMap.set(issue.issueId, issue);
    }

    // Aggregate token usage by convoy
    const convoyStats: ConvoyTokenUsage[] = [];

    for (const convoy of convoys) {
      try {
        // Get convoy details with issue list
        const detail = await this.getConvoyStatus(convoy.id);
        const issues = detail.issues || [];

        // Aggregate tokens from all issues in convoy
        let inputTokens = 0;
        let outputTokens = 0;
        let cacheReadTokens = 0;
        let totalTokens = 0;
        let sessionCount = 0;
        const actorsSet = new Set<string>();
        let firstActivity: string | undefined;
        let lastActivity: string | undefined;

        for (const issueId of issues) {
          const issueStats = issueTokensMap.get(issueId);
          if (issueStats) {
            inputTokens += issueStats.inputTokens;
            outputTokens += issueStats.outputTokens;
            cacheReadTokens += issueStats.cacheReadTokens;
            totalTokens += issueStats.totalTokens;
            sessionCount += issueStats.sessionCount;
            issueStats.actors.forEach((a) => actorsSet.add(a));

            // Track time range
            if (!firstActivity || issueStats.firstActivity < firstActivity) {
              firstActivity = issueStats.firstActivity;
            }
            if (!lastActivity || issueStats.lastActivity > lastActivity) {
              lastActivity = issueStats.lastActivity;
            }
          }
        }

        convoyStats.push({
          convoyId: convoy.id,
          title: convoy.title,
          status: convoy.status,
          issues,
          inputTokens,
          outputTokens,
          cacheReadTokens,
          totalTokens,
          sessionCount,
          actors: Array.from(actorsSet),
          firstActivity,
          lastActivity,
        });
      } catch {
        // Skip convoys we can't get details for
      }
    }

    // Sort by total tokens descending for top convoys
    const topConvoys = [...convoyStats]
      .sort((a, b) => b.totalTokens - a.totalTokens)
      .slice(0, 10);

    return {
      ...baseStats,
      by_convoy: convoyStats,
      top_convoys: topConvoys,
    };
  }

  async getRig(name: string): Promise<Rig | null> {
    const status = await this.getStatus();
    return status.rigs.find((r) => r.name === name) || null;
  }

  async getRigConvoys(rig: string): Promise<Convoy[]> {
    const convoys = await this.getConvoys();
    // Filter convoys by rig (convoy IDs include rig name as prefix)
    return convoys.filter((c) => c.id.startsWith(`${rig}/`) || c.id.includes(`/${rig}/`));
  }

  async getPolecatStatus(rig: string, name: string): Promise<PolecatDetail> {
    return this.runCommand<PolecatDetail>(`gt polecat status ${rig}/${name} --json`);
  }

  async getConvoyStatus(id: string): Promise<ConvoyDetail> {
    return this.runCommand<ConvoyDetail>(`gt convoy status ${id} --json`);
  }

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Send a nudge message to a polecat session.
   */
  async nudgePolecat(rig: string, name: string, message: string): Promise<void> {
    const escapedMessage = message.replace(/"/g, '\\"');
    await execAsync(`gt nudge ${rig}/${name} "${escapedMessage}"`, { cwd: this.cwd });
  }

  /**
   * Nuke (completely destroy) a polecat and all its artifacts.
   * This kills the session, deletes the worktree, branch, and agent bead.
   */
  async nukePolecat(rig: string, name: string, force: boolean = false): Promise<void> {
    const forceFlag = force ? "--force" : "";
    await execAsync(`gt polecat nuke ${rig}/${name} ${forceFlag}`, { cwd: this.cwd });
  }

  /**
   * Reassign work from one polecat to another.
   * First gets the hooked bead from the source, then slings it to the target.
   */
  async reassignPolecat(
    sourceRig: string,
    sourceName: string,
    targetRig: string,
    targetName: string
  ): Promise<void> {
    // Get the source polecat's hook to find what bead to reassign
    const { stdout: hookOutput } = await execAsync(
      `gt hook --json`,
      { cwd: `${this.cwd}/${sourceRig}/polecats/${sourceName}` }
    );
    const hookData = JSON.parse(hookOutput);

    if (!hookData.bead_id) {
      throw new Error("Source polecat has no work on hook to reassign");
    }

    // Unsling from source
    await execAsync(`gt unsling`, {
      cwd: `${this.cwd}/${sourceRig}/polecats/${sourceName}`
    });

    // Sling to target
    await execAsync(`gt sling ${hookData.bead_id} ${targetRig}/${targetName}`, {
      cwd: this.cwd
    });
  }

  // ============================================================================
  // Journey
  // ============================================================================

  /**
   * Get journey information for a polecat.
   * Combines polecat status with hook information to determine stage.
   */
  async getPolecatJourney(rig: string, name: string): Promise<WorkerJourney> {
    const polecatDetail = await this.getPolecatStatus(rig, name);

    // Check if polecat has work assigned via hook
    const rigData = await this.getRig(rig);
    const hook = rigData?.hooks?.find(
      (h) => h.agent === name || h.agent === `${rig}/${name}`
    );
    const hasAssignedWork = hook?.has_work ?? false;

    // TODO: Check for PR existence (requires git/gh integration)
    const hasPR = false;

    return detectJourneyStage(polecatDetail, hasAssignedWork, hasPR);
  }

  /**
   * Get journey information for all polecats across all rigs.
   */
  async getAllPolecatJourneys(): Promise<Array<{ rig: string; name: string; journey: WorkerJourney }>> {
    const polecats = await this.getAllPolecats();
    const journeys: Array<{ rig: string; name: string; journey: WorkerJourney }> = [];

    for (const polecat of polecats) {
      try {
        const journey = await this.getPolecatJourney(polecat.rig, polecat.name);
        journeys.push({
          rig: polecat.rig,
          name: polecat.name,
          journey,
        });
      } catch {
        // If we can't get detailed status, use basic detection
        journeys.push({
          rig: polecat.rig,
          name: polecat.name,
          journey: detectJourneyStage(polecat),
        });
      }
    }

    return journeys;
  }

  /**
   * Detect working substage (2a-2d) from recent events for a worker.
   *
   * Substage detection is based on the most recent tool/command events:
   * - 2a (Analyzing): Read, Grep, Glob tools - exploring codebase
   * - 2b (Coding): Write, Edit tools, git commits - making changes
   * - 2c (Testing): Test commands (pytest, npm test, etc.)
   * - 2d (PR Prep): Git push, PR creation
   *
   * @param workerPath - Path pattern to filter events (e.g., "citadel/polecats/alpha")
   * @returns The detected substage or undefined if not in WORKING stage
   */
  async detectWorkingSubstage(workerPath: string): Promise<TypesWorkingSubstage | undefined> {
    const fs = await import("fs/promises");
    const path = await import("path");

    const eventsFile = path.join(this.cwd, ".events.jsonl");

    try {
      const content = await fs.readFile(eventsFile, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      // Look at recent events (last 50) for this worker
      const recentEvents = lines
        .slice(-100)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter((e) => e && e.actor?.includes(workerPath))
        .slice(-50);

      if (recentEvents.length === 0) {
        return undefined;
      }

      // Count signal occurrences by substage
      const substageScores: Record<TypesWorkingSubstage, number> = {
        "2a": 0,
        "2b": 0,
        "2c": 0,
        "2d": 0,
      };

      // Weight recent events more heavily
      for (let i = 0; i < recentEvents.length; i++) {
        const event = recentEvents[i];
        const eventType = event.type || "";
        const weight = 1 + (i / recentEvents.length); // More recent = higher weight

        // Check against known signal patterns
        for (const [signal, substage] of Object.entries(SUBSTAGE_DETECTION_SIGNALS)) {
          if (eventType.includes(signal) || this.matchesSubstageSignal(event, signal)) {
            substageScores[substage] += weight;
          }
        }
      }

      // Find highest scoring substage
      let maxScore = 0;
      let detectedSubstage: TypesWorkingSubstage | undefined;

      for (const [substage, score] of Object.entries(substageScores)) {
        if (score > maxScore) {
          maxScore = score;
          detectedSubstage = substage as TypesWorkingSubstage;
        }
      }

      // Default to 2b (Coding) if no clear signal but worker is active
      return detectedSubstage || "2b";
    } catch {
      // Events file doesn't exist or can't be read
      return undefined;
    }
  }

  /**
   * Match event against substage signal patterns
   */
  private matchesSubstageSignal(event: Record<string, unknown>, signal: string): boolean {
    const type = String(event.type || "").toLowerCase();
    const tool = String(event.tool || "").toLowerCase();
    const command = String(event.command || "").toLowerCase();

    // Signal pattern matching
    switch (signal) {
      // 2a: Analyzing
      case "tool.read":
        return type === "tool_use" && tool === "read";
      case "tool.grep":
        return type === "tool_use" && (tool === "grep" || tool === "search");
      case "tool.glob":
        return type === "tool_use" && (tool === "glob" || tool === "find");

      // 2b: Coding
      case "tool.write":
        return type === "tool_use" && tool === "write";
      case "tool.edit":
        return type === "tool_use" && tool === "edit";
      case "git.commit":
        return type === "command" && command.includes("git commit");

      // 2c: Testing
      case "command.test":
        return type === "command" && (
          command.includes("test") ||
          command.includes("spec") ||
          command.includes("check")
        );
      case "command.pytest":
        return type === "command" && command.includes("pytest");
      case "command.npm_test":
        return type === "command" && (
          command.includes("npm test") ||
          command.includes("npm run test") ||
          command.includes("yarn test")
        );

      // 2d: PR Prep
      case "git.push":
        return type === "command" && command.includes("git push");
      case "pr.draft":
        return type === "pr_created" || (type === "command" && command.includes("gh pr"));

      default:
        return false;
    }
  }

  /**
   * Get full journey state for a worker based on their status and recent events.
   *
   * @param rig - Rig name
   * @param workerName - Worker name
   * @returns Journey state including stage, substage, timestamps
   */
  async getWorkerJourneyState(rig: string, workerName: string): Promise<JourneyState> {
    const polecatDetail = await this.getPolecatStatus(rig, workerName);
    const workerPath = `${rig}/polecats/${workerName}`;

    // Derive base journey stage from worker state
    let currentStage = TypesJourneyStage.QUEUED;
    let blocked = false;

    if (polecatDetail.session_running) {
      switch (polecatDetail.state) {
        case "waiting":
          currentStage = TypesJourneyStage.CLAIMED;
          break;
        case "working":
          currentStage = TypesJourneyStage.WORKING;
          break;
        case "blocked":
          currentStage = TypesJourneyStage.WORKING;
          blocked = true;
          break;
        case "done":
          currentStage = TypesJourneyStage.MERGED;
          break;
        default:
          currentStage = TypesJourneyStage.WORKING;
      }
    } else {
      // Session not running
      currentStage = polecatDetail.state === "done"
        ? TypesJourneyStage.MERGED
        : TypesJourneyStage.CLAIMED;
    }

    // Detect substage if in WORKING stage
    let substage: TypesWorkingSubstage | undefined;
    if (currentStage === TypesJourneyStage.WORKING) {
      substage = await this.detectWorkingSubstage(workerPath);
    }

    // Build timestamps (placeholder - would be populated from events)
    const timestamps = {
      claimed: polecatDetail.last_activity !== "0001-01-01T00:00:00Z"
        ? polecatDetail.last_activity
        : undefined,
      workStarted: currentStage >= TypesJourneyStage.WORKING && polecatDetail.session_running
        ? polecatDetail.last_activity
        : undefined,
    };

    return {
      currentStage,
      substage,
      timestamps,
      actor: `${rig}/${workerName}`,
      blocked,
    };
  }

  /**
   * Get cost breakdown by individual worker.
   *
   * Aggregates token usage from events by worker path, calculating:
   * - Total tokens and cost per worker
   * - Session count
   * - Issues worked (from event context)
   * - Efficiency score (tokens per issue)
   *
   * @returns Array of ChartWorkerCost sorted by total tokens descending
   */
  async getWorkerCosts(): Promise<ChartWorkerCost[]> {
    const fs = await import("fs/promises");
    const path = await import("path");

    const eventsFile = path.join(this.cwd, ".events.jsonl");

    // Map: workerPath -> aggregated data
    const workerMap = new Map<string, {
      tokens: { input: number; output: number; cache_read: number; total: number };
      sessionCount: number;
      issues: Set<string>;
      firstActivity?: Date;
      lastActivity?: Date;
    }>();

    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    weekStart.setDate(weekStart.getDate() - 7);

    try {
      const content = await fs.readFile(eventsFile, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          const eventTime = new Date(event.ts);

          // Only process recent token_usage events
          if (event.source === "guzzoline" && event.type === "token_usage" && eventTime >= weekStart) {
            const actor = event.actor || "";

            // Extract worker path (e.g., "citadel/polecats/alpha" from full actor path)
            const workerMatch = actor.match(/([^/]+\/(?:polecats|crew)\/[^/]+)/);
            if (!workerMatch) continue;

            const workerPath = workerMatch[1];
            const parts = workerPath.split("/");
            if (parts.length < 3) continue;

            // Initialize worker entry if needed
            if (!workerMap.has(workerPath)) {
              workerMap.set(workerPath, {
                tokens: { input: 0, output: 0, cache_read: 0, total: 0 },
                sessionCount: 0,
                issues: new Set(),
                firstActivity: eventTime,
                lastActivity: eventTime,
              });
            }

            const worker = workerMap.get(workerPath)!;

            // Aggregate tokens
            worker.tokens.input += event.payload?.tokens?.input ?? 0;
            worker.tokens.output += event.payload?.tokens?.output ?? 0;
            worker.tokens.cache_read += event.payload?.tokens?.cache_read ?? 0;
            worker.tokens.total += event.payload?.tokens?.total ?? 0;
            worker.sessionCount++;

            // Track issues from event context
            if (event.payload?.issue_id) {
              worker.issues.add(event.payload.issue_id);
            }
            if (event.context?.issue) {
              worker.issues.add(event.context.issue);
            }

            // Update activity timestamps
            if (eventTime < worker.firstActivity!) {
              worker.firstActivity = eventTime;
            }
            if (eventTime > worker.lastActivity!) {
              worker.lastActivity = eventTime;
            }
          }
        } catch {
          // Skip malformed lines
        }
      }
    } catch {
      // File doesn't exist or can't be read - return empty array
      return [];
    }

    // Convert map to ChartWorkerCost array
    const workerCosts: ChartWorkerCost[] = [];

    for (const [workerPath, data] of workerMap) {
      const parts = workerPath.split("/");
      const rig = parts[0];
      const workerName = parts[2];

      const typedTokens: TypedTokenUsage = {
        input: data.tokens.input,
        output: data.tokens.output,
        cache_read: data.tokens.cache_read,
        total: data.tokens.total,
      };

      // Calculate duration in minutes
      let durationMinutes: number | undefined;
      if (data.firstActivity && data.lastActivity) {
        durationMinutes = Math.round(
          (data.lastActivity.getTime() - data.firstActivity.getTime()) / 60000
        );
      }

      // Calculate efficiency score (tokens per issue completed)
      const issuesWorked = Array.from(data.issues);
      const efficiencyScore = issuesWorked.length > 0
        ? Math.round(data.tokens.total / issuesWorked.length)
        : undefined;

      workerCosts.push({
        workerName,
        rig,
        totalTokens: data.tokens.total,
        tokens: typedTokens,
        estimatedCostUsd: calculateCost(typedTokens),
        durationMinutes,
        tokensPerMinute: durationMinutes && durationMinutes > 0
          ? Math.round(data.tokens.total / durationMinutes)
          : undefined,
        issuesWorked,
        sessionCount: data.sessionCount,
        efficiencyScore,
      });
    }

    // Sort by total tokens descending
    return workerCosts.sort((a, b) => b.totalTokens - a.totalTokens);
  }

  /**
   * Get hourly token usage for charting.
   *
   * Aggregates token usage events by hour, calculating:
   * - Total tokens per hour
   * - Estimated cost per hour
   * - Active worker count per hour
   *
   * @param hours - Number of hours to look back (default 24)
   * @returns Array of ChartHourlyUsage sorted by hour ascending
   */
  async getHourlyUsage(hours: number = 24): Promise<ChartHourlyUsage[]> {
    const fs = await import("fs/promises");
    const path = await import("path");

    const eventsFile = path.join(this.cwd, ".events.jsonl");

    // Map: hour ISO string -> aggregated data
    const hourlyMap = new Map<string, {
      tokens: number;
      costUsd: number;
      workers: Set<string>;
    }>();

    const now = new Date();
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // Initialize all hours in range with zero values
    for (let h = 0; h < hours; h++) {
      const hourDate = new Date(now.getTime() - h * 60 * 60 * 1000);
      hourDate.setMinutes(0, 0, 0);
      const hourKey = hourDate.toISOString();
      if (!hourlyMap.has(hourKey)) {
        hourlyMap.set(hourKey, { tokens: 0, costUsd: 0, workers: new Set() });
      }
    }

    try {
      const content = await fs.readFile(eventsFile, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          const eventTime = new Date(event.ts);

          // Only process recent token_usage events
          if (event.source === "guzzoline" && event.type === "token_usage" && eventTime >= cutoff) {
            // Round to hour
            const hourDate = new Date(eventTime);
            hourDate.setMinutes(0, 0, 0);
            const hourKey = hourDate.toISOString();

            // Initialize hour if needed
            if (!hourlyMap.has(hourKey)) {
              hourlyMap.set(hourKey, { tokens: 0, costUsd: 0, workers: new Set() });
            }

            const hourData = hourlyMap.get(hourKey)!;

            // Aggregate tokens
            const tokens = event.payload?.tokens?.total ?? 0;
            hourData.tokens += tokens;

            // Calculate cost from token breakdown
            const tokenBreakdown: TypedTokenUsage = {
              input: event.payload?.tokens?.input ?? 0,
              output: event.payload?.tokens?.output ?? 0,
              cache_read: event.payload?.tokens?.cache_read ?? 0,
              total: tokens,
            };
            hourData.costUsd += calculateCost(tokenBreakdown);

            // Track active workers
            const actor = event.actor || "";
            const workerMatch = actor.match(/([^/]+\/(?:polecats|crew)\/[^/]+)/);
            if (workerMatch) {
              hourData.workers.add(workerMatch[1]);
            }
          }
        } catch {
          // Skip malformed lines
        }
      }
    } catch {
      // File doesn't exist or can't be read - return empty hours
    }

    // Convert map to ChartHourlyUsage array
    const hourlyUsage: ChartHourlyUsage[] = [];

    for (const [hour, data] of hourlyMap) {
      hourlyUsage.push({
        hour,
        tokens: data.tokens,
        costUsd: data.costUsd,
        activeWorkers: data.workers.size,
      });
    }

    // Sort by hour ascending
    return hourlyUsage.sort((a, b) => new Date(a.hour).getTime() - new Date(b.hour).getTime());
  }

  // ============================================================================
  // Beads
  // ============================================================================

  async getBeadDetail(id: string): Promise<BeadDetail> {
    const result = await this.runCommand<BeadDetail[]>(`bd show ${id} --json`);
    // bd show returns an array, we want the first element
    if (Array.isArray(result) && result.length > 0) {
      return result[0];
    }
    throw new Error(`Bead ${id} not found`);
  }

// ============================================================================
  // Git Activity
  // ============================================================================

  async getWorkerGitActivity(
    rig: string,
    worker: string,
    baseBranch: string = "main"
  ): Promise<WorkerGitActivity> {
    // Get worker's current branch
    const polecatStatus = await this.getPolecatStatus(rig, worker);
    const workerBranch = polecatStatus.branch;
    const clonePath = polecatStatus.clone_path;

    // Get commits on this branch not on base
    let logOutput = "";
    try {
      const { stdout } = await execAsync(
        `git log ${baseBranch}..${workerBranch} --format='%H|%s|%aI|%an'`,
        { cwd: clonePath }
      );
      logOutput = stdout;
    } catch {
      // No commits or branch doesn't exist yet
      logOutput = "";
    }

    // Get numstat for file stats
    let numstatOutput = "";
    try {
      const { stdout } = await execAsync(
        `git diff --numstat ${baseBranch}...${workerBranch}`,
        { cwd: clonePath }
      );
      numstatOutput = stdout;
    } catch {
      numstatOutput = "";
    }

    // Get name-status for file change types
    let nameStatusOutput = "";
    try {
      const { stdout } = await execAsync(
        `git diff --name-status ${baseBranch}...${workerBranch}`,
        { cwd: clonePath }
      );
      nameStatusOutput = stdout;
    } catch {
      nameStatusOutput = "";
    }

    // Parse outputs
    const commits = parseGitLog(logOutput);
    const fileStats = parseDiffNumstat(numstatOutput);
    const fileStatuses = parseNameStatus(nameStatusOutput);

    // Build file changes array
    const fileChanges: FileChange[] = [];
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const [path, stats] of fileStats) {
      const status = fileStatuses.get(path) || "modified";
      fileChanges.push({
        path,
        status,
        additions: stats.additions,
        deletions: stats.deletions,
      });
      totalAdditions += stats.additions;
      totalDeletions += stats.deletions;
    }

    // Build commits with empty files (detailed file info per commit would require more parsing)
    const commitsWithFiles: Commit[] = commits.map((c) => ({
      ...c,
      files: [],
    }));

    return {
      worker,
      rig,
      branch: workerBranch,
      base_branch: baseBranch,
      commits: commitsWithFiles,
      total_additions: totalAdditions,
      total_deletions: totalDeletions,
      files_changed: Array.from(fileStats.keys()),
    };
  }

  // ============================================================================
  // Beads Data
  // ============================================================================

  async getBeads(rig?: string): Promise<BeadsData> {
    const fs = await import("fs/promises");
    const path = await import("path");

    // Find the beads JSONL file for the rig
    const beadsDir = rig
      ? path.join(this.cwd, rig, ".beads")
      : path.join(this.cwd, ".beads");
    const issuesFile = path.join(beadsDir, "issues.jsonl");

    const beads: Bead[] = [];
    let open = 0;
    let in_progress = 0;
    let blocked = 0;

    try {
      const content = await fs.readFile(issuesFile, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const issue = JSON.parse(line);

          // Map beads JSONL format to our Bead interface
          const bead: Bead = {
            id: issue.id,
            title: issue.title,
            status: issue.status as BeadStatus,
            type: (issue.type || 'task') as BeadType,
            priority: (issue.priority || 'P2') as BeadPriority,
            assignee: issue.assignee,
            created: issue.created_at || issue.created,
            updated: issue.updated_at || issue.updated || issue.created_at || issue.created,
            depends_on: issue.depends_on || [],
            blocks: issue.blocks || [],
            parent: issue.parent,
            children: issue.children || [],
          };

          beads.push(bead);

          if (bead.status === 'open') open++;
          if (bead.status === 'in_progress' || bead.status === 'hooked') in_progress++;
          if (bead.depends_on && bead.depends_on.length > 0) {
            // Check if any dependencies are not closed
            const hasOpenDeps = bead.depends_on.some(depId => {
              const dep = beads.find(b => b.id === depId);
              return dep && dep.status !== 'closed';
            });
            if (hasOpenDeps) blocked++;
          }
        } catch {
          // Skip malformed lines
        }
      }
    } catch {
      // File doesn't exist or can't be read - return empty data
    }

    return {
      beads,
      total: beads.length,
      open,
      in_progress,
      blocked,
    };
  }

  /**
   * Get all beads (issues) for a convoy.
   * Fetches the convoy details and resolves full bead information for each issue.
   *
   * @param convoyId - The convoy ID to get beads for
   * @returns Array of BeadDetail objects for all issues in the convoy
   */
  async getBeadsForConvoy(convoyId: string): Promise<BeadDetail[]> {
    // Get convoy details to retrieve issue list
    const convoy = await this.getConvoyStatus(convoyId);
    const issues = convoy.issues || [];

    if (issues.length === 0) {
      return [];
    }

    // Fetch bead details for each issue in parallel
    const beadPromises = issues.map(async (issueId) => {
      try {
        return await this.getBeadDetail(issueId);
      } catch {
        // If a bead can't be found, return null and filter later
        return null;
      }
    });

    const beads = await Promise.all(beadPromises);

    // Filter out any null results (beads that couldn't be found)
    return beads.filter((bead): bead is BeadDetail => bead !== null);
  }
}

// Default client instance
export const gastown = new GasTownClient();
