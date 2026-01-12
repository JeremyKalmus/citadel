/**
 * Shared bead type constants for filtering work items vs communications.
 *
 * Work Items: Rig-level coding tasks (tracked in <rig>/.beads/)
 * Communications: Town-level coordination (tracked in ~/.beads/ or HQ)
 */

// Work item types - actual coding work
export const WORK_ITEM_TYPES = ["task", "bug", "feature", "epic"] as const;

// Communication types - agent coordination
export const COMMUNICATION_TYPES = ["mail", "handoff", "message", "convoy"] as const;

// All bead types
export const ALL_BEAD_TYPES = [...WORK_ITEM_TYPES, ...COMMUNICATION_TYPES] as const;

// Type definitions
export type WorkItemType = typeof WORK_ITEM_TYPES[number];
export type CommunicationType = typeof COMMUNICATION_TYPES[number];
export type AllBeadType = typeof ALL_BEAD_TYPES[number];

// Type guards
export function isWorkItemType(type: string): type is WorkItemType {
  return WORK_ITEM_TYPES.includes(type.toLowerCase() as WorkItemType);
}

export function isCommunicationType(type: string): type is CommunicationType {
  return COMMUNICATION_TYPES.includes(type.toLowerCase() as CommunicationType);
}

// Age threshold for auto-collapsing old communications (7 days in ms)
export const STALE_COMMUNICATION_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Check if a bead is considered stale (older than threshold)
 */
export function isStale(updatedAt: string, thresholdMs = STALE_COMMUNICATION_THRESHOLD_MS): boolean {
  const updated = new Date(updatedAt).getTime();
  const now = Date.now();
  return now - updated > thresholdMs;
}

/**
 * Group beads by their convoy association (for communications)
 */
export function groupByConvoy<T extends { id: string; parent?: string }>(
  beads: T[]
): { convoyId: string | null; beads: T[] }[] {
  const grouped = new Map<string | null, T[]>();

  for (const bead of beads) {
    // Use parent as convoy association (if present)
    const convoyId = bead.parent || null;
    const existing = grouped.get(convoyId) || [];
    existing.push(bead);
    grouped.set(convoyId, existing);
  }

  // Convert to array, putting ungrouped (null) last
  const result: { convoyId: string | null; beads: T[] }[] = [];
  const ungrouped = grouped.get(null);

  // Add grouped items first
  for (const [convoyId, convoyBeads] of grouped) {
    if (convoyId !== null) {
      result.push({ convoyId, beads: convoyBeads });
    }
  }

  // Add ungrouped last
  if (ungrouped && ungrouped.length > 0) {
    result.push({ convoyId: null, beads: ungrouped });
  }

  return result;
}
