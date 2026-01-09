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
}

// Default client instance
export const gastown = new GasTownClient();
