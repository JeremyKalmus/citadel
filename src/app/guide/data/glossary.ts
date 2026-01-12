/**
 * Gas Town Glossary - Complete terminology reference
 */

export type GlossaryCategory =
  | 'principles'
  | 'town-roles'
  | 'rig-roles'
  | 'work-units'
  | 'commands'

export interface GlossaryTerm {
  term: string
  definition: string
  category: GlossaryCategory
}

export interface GlossaryGroup {
  id: GlossaryCategory
  label: string
  description: string
}

/**
 * Category definitions for organizing glossary terms
 */
export const glossaryCategories: GlossaryGroup[] = [
  {
    id: 'principles',
    label: 'Core Principles',
    description: 'Foundational concepts that define Gas Town operations',
  },
  {
    id: 'town-roles',
    label: 'Town-Level Roles',
    description: 'Entities that operate at the town/workspace level',
  },
  {
    id: 'rig-roles',
    label: 'Rig-Level Roles',
    description: 'Entities that operate within a single project',
  },
  {
    id: 'work-units',
    label: 'Work Units',
    description: 'Units of work that flow through the system',
  },
  {
    id: 'commands',
    label: 'Workflow Commands',
    description: 'Commands used to manage work and workers',
  },
]

/**
 * Complete glossary of Gas Town terminology
 */
export const glossaryTerms: GlossaryTerm[] = [
  // Core Principles
  {
    term: 'GUPP',
    definition: 'Gas Town Universal Propulsion Principle - if work is on your hook, YOU RUN IT. No waiting, no confirmation.',
    category: 'principles',
  },
  {
    term: 'MEOW',
    definition: 'Molecular Expression of Work - breaking complex work into small, atomic units that can be processed independently.',
    category: 'principles',
  },
  {
    term: 'NDI',
    definition: 'Nondeterministic Idempotence - operations produce consistent outcomes despite unpredictable execution order.',
    category: 'principles',
  },

  // Town-Level Roles
  {
    term: 'Town',
    definition: 'The workspace root - contains all rigs, Mayor, and global configuration. The settlement all operations base from.',
    category: 'town-roles',
  },
  {
    term: 'Mayor',
    definition: 'Town-level orchestrator that coordinates work across all rigs and manages global operations.',
    category: 'town-roles',
  },
  {
    term: 'Deacon',
    definition: 'Handles cross-rig communication and dependency resolution between projects.',
    category: 'town-roles',
  },
  {
    term: 'Dogs',
    definition: 'Background processes that monitor town health, run scheduled tasks, and handle system maintenance.',
    category: 'town-roles',
  },
  {
    term: 'Boot',
    definition: 'Initial setup process that bootstraps a new rig or polecat with required configuration.',
    category: 'town-roles',
  },

  // Rig-Level Roles
  {
    term: 'Rig',
    definition: 'Container for a project - has workers (polecats), a refinery, witness, and beads. Independent from other rigs.',
    category: 'rig-roles',
  },
  {
    term: 'Polecat',
    definition: 'AI worker agent that executes tasks in its own git worktree. Implements changes and submits PRs.',
    category: 'rig-roles',
  },
  {
    term: 'Refinery',
    definition: 'Merge queue processor - handles rebasing, conflict resolution, and ensures clean merges to main.',
    category: 'rig-roles',
  },
  {
    term: 'Witness',
    definition: 'Monitors all polecats in a rig, tracks health, detects stuck workers, and can nudge or restart them.',
    category: 'rig-roles',
  },
  {
    term: 'Crew',
    definition: 'The collective set of polecats working in a rig, managed by the witness.',
    category: 'rig-roles',
  },

  // Work Units
  {
    term: 'Bead',
    definition: 'Single unit of work (issue/task) in the beads tracking system. The atomic fuel that drives convoys.',
    category: 'work-units',
  },
  {
    term: 'Beads',
    definition: 'Issue tracking system - each bead tracks status, dependencies, and assignment for a unit of work.',
    category: 'work-units',
  },
  {
    term: 'Formula',
    definition: 'Template for creating consistent beads - defines structure and requirements for common work types.',
    category: 'work-units',
  },
  {
    term: 'Protomolecule',
    definition: 'Initial work specification before it becomes a full molecule. The seed of a larger piece of work.',
    category: 'work-units',
  },
  {
    term: 'Molecule',
    definition: 'Composite work unit - a bead with child beads that together form a larger deliverable.',
    category: 'work-units',
  },
  {
    term: 'Wisp',
    definition: 'Lightweight work hint or suggestion that may become a bead. Pre-bead ideation.',
    category: 'work-units',
  },
  {
    term: 'Hook',
    definition: "Assignment slot where work lands for a polecat. If work is on your hook, GUPP demands you run it.",
    category: 'work-units',
  },
  {
    term: 'Convoy',
    definition: 'Batch of related beads traveling together through the system as a coordinated unit.',
    category: 'work-units',
  },

  // Workflow Commands
  {
    term: 'Sling',
    definition: "Dispatch work to a polecat (gt sling <bead> <rig>). Throws work onto a worker's hook.",
    category: 'commands',
  },
  {
    term: 'Nudge',
    definition: 'Gently prompt a stuck or slow polecat to continue. Less forceful than a restart.',
    category: 'commands',
  },
  {
    term: 'Handoff',
    definition: 'Transfer work context to a new session when current one expires or needs fresh start.',
    category: 'commands',
  },
  {
    term: 'Seance',
    definition: 'Recover context from a dead or stale session. Resurrect work that was in progress.',
    category: 'commands',
  },
  {
    term: 'Patrol',
    definition: "Witness's regular check of all polecats in a rig. Monitors health and detects issues.",
    category: 'commands',
  },
]

/**
 * Get terms grouped by category
 */
export function getTermsByCategory(): Record<GlossaryCategory, GlossaryTerm[]> {
  const grouped = {} as Record<GlossaryCategory, GlossaryTerm[]>

  for (const category of glossaryCategories) {
    grouped[category.id] = glossaryTerms.filter(t => t.category === category.id)
  }

  return grouped
}

/**
 * Get category info by ID
 */
export function getCategoryInfo(categoryId: GlossaryCategory): GlossaryGroup | undefined {
  return glossaryCategories.find(c => c.id === categoryId)
}
