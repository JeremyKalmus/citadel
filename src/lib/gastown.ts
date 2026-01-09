import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
}

export interface TokenUsage {
  actor: string;
  input: number;
  output: number;
  cache_read: number;
  total: number;
  timestamp: string;
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
}

// Default client instance
export const gastown = new GasTownClient();
