import type { IconName } from "@/components/ui/icon"

/**
 * Entity types in Gas Town architecture
 */
export type EntityType = 'town' | 'rig' | 'convoy' | 'polecat' | 'refinery' | 'witness' | 'beads'

/**
 * Live data that can be displayed for each entity type
 */
export interface EntityLiveData {
  town?: {
    rigCount: number
    totalPolecats: number
    activeConvoys: number
  }
  rig?: {
    name: string
    polecatCount: number
    convoyCount: number
    openBeads: number
  }
  convoy?: {
    id: string
    name: string
    issueCount: number
    completedCount: number
    status: string
  }
  polecat?: {
    name: string
    currentTask: string
    status: string
    rig: string
  }
  refinery?: {
    queueDepth: number
    processing: number
    completed24h: number
  }
  witness?: {
    monitoredPolecats: number
    activePolecats: number
    alertCount: number
  }
  beads?: {
    openCount: number
    closedCount: number
    blockedCount: number
  }
}

/**
 * Static definition for each entity type
 */
export interface EntityDefinition {
  type: EntityType
  name: string
  tagline: string
  description: string
  icon: IconName
  liveDataLabel: string
  relatedEntities: EntityType[]
}

/**
 * Entity definitions for the Guide page
 * Content matches spec section 4.3 table
 */
export const entityDefinitions: Record<EntityType, EntityDefinition> = {
  town: {
    type: 'town',
    name: 'Town',
    tagline: 'Your workspace root',
    description: 'The Town is Gas Town itself - the root directory that contains all your rigs, the Mayor, and global configuration. Think of it as the settlement that all operations are based out of. The Mayor coordinates work across all rigs from here.',
    icon: 'home',
    liveDataLabel: 'Rigs',
    relatedEntities: ['rig'],
  },
  rig: {
    type: 'rig',
    name: 'Rig',
    tagline: 'Project container',
    description: 'A Rig is a container for a single project or repository. Each rig has its own polecats (workers), a refinery (merge queue), a witness (lifecycle manager), and beads (issue tracking). Rigs are independent - work in one rig doesn\'t affect others.',
    icon: 'container',
    liveDataLabel: 'Workers / Convoys',
    relatedEntities: ['polecat', 'refinery', 'witness', 'beads', 'convoy'],
  },
  convoy: {
    type: 'convoy',
    name: 'Convoy',
    tagline: 'Batch of related work',
    description: 'A Convoy is a group of related issues traveling together through the system. When you dispatch multiple related tasks, they form a convoy. Convoys let you track batch progress and see how related work moves through stages together.',
    icon: 'truck',
    liveDataLabel: 'Progress',
    relatedEntities: ['beads', 'polecat'],
  },
  polecat: {
    type: 'polecat',
    name: 'Polecat',
    tagline: 'AI worker agent',
    description: 'A Polecat is an AI worker agent that executes tasks. Each polecat has its own git worktree and works independently. Polecats pick up work from beads, implement changes, and submit pull requests. They report status to their Witness.',
    icon: 'terminal',
    liveDataLabel: 'Current Task',
    relatedEntities: ['rig', 'witness', 'beads'],
  },
  refinery: {
    type: 'refinery',
    name: 'Refinery',
    tagline: 'Merge queue processor',
    description: 'The Refinery processes the merge queue for a rig. When polecats submit pull requests, they enter the refinery queue. The refinery handles rebasing, conflict resolution, and ensures clean merges to the main branch.',
    icon: 'factory',
    liveDataLabel: 'Queue Depth',
    relatedEntities: ['rig', 'polecat'],
  },
  witness: {
    type: 'witness',
    name: 'Witness',
    tagline: 'Polecat lifecycle manager',
    description: 'The Witness monitors all polecats in a rig. It tracks their health, detects when they\'re stuck or unresponsive, and can nudge or restart them. Think of it as the foreman watching over the workers.',
    icon: 'eye',
    liveDataLabel: 'Monitored',
    relatedEntities: ['rig', 'polecat'],
  },
  beads: {
    type: 'beads',
    name: 'Beads',
    tagline: 'Issue tracking system',
    description: 'Beads is the issue tracking system that powers Gas Town. Each bead represents a unit of work - a task, bug, or feature. Beads track dependencies, status, and assignment. They\'re the fuel that drives the convoy.',
    icon: 'circle',
    liveDataLabel: 'Open / Closed',
    relatedEntities: ['convoy', 'polecat'],
  },
}

/**
 * Get all entity types in display order
 */
export const entityOrder: EntityType[] = [
  'town',
  'rig',
  'convoy',
  'polecat',
  'refinery',
  'witness',
  'beads',
]
