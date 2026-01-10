import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EntityCard, EntityCardList } from './entity-card'
import type { EntityLiveData } from '../data/entities'

const meta = {
  title: 'Guide/EntityCard',
  component: EntityCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    entity: {
      control: 'select',
      options: ['town', 'rig', 'convoy', 'polecat', 'refinery', 'witness', 'beads'],
    },
    expanded: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof EntityCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    entity: 'polecat',
  },
}

export const Expanded: Story = {
  args: {
    entity: 'polecat',
    expanded: true,
  },
}

export const WithLiveData: Story = {
  args: {
    entity: 'polecat',
    expanded: true,
    liveData: {
      name: 'toast',
      currentTask: 'Implementing EntityCard component',
      status: 'active',
      rig: 'citadel',
    },
  },
}

export const Town: Story = {
  args: {
    entity: 'town',
    expanded: true,
    liveData: {
      rigCount: 3,
      totalPolecats: 8,
      activeConvoys: 2,
    },
  },
}

export const Rig: Story = {
  args: {
    entity: 'rig',
    expanded: true,
    liveData: {
      name: 'citadel',
      polecatCount: 3,
      convoyCount: 2,
      openBeads: 15,
    },
  },
}

export const Convoy: Story = {
  args: {
    entity: 'convoy',
    expanded: true,
    liveData: {
      id: 'cv-abc',
      name: 'Phase 3 Guide',
      issueCount: 8,
      completedCount: 3,
      status: 'in_progress',
    },
  },
}

export const Refinery: Story = {
  args: {
    entity: 'refinery',
    expanded: true,
    liveData: {
      queueDepth: 3,
      processing: 1,
      completed24h: 12,
    },
  },
}

export const Witness: Story = {
  args: {
    entity: 'witness',
    expanded: true,
    liveData: {
      monitoredPolecats: 5,
      activePolecats: 3,
      alertCount: 1,
    },
  },
}

export const Beads: Story = {
  args: {
    entity: 'beads',
    expanded: true,
    liveData: {
      openCount: 23,
      closedCount: 147,
      blockedCount: 2,
    },
  },
}

export const AllEntitiesCollapsed: Story = {
  render: () => (
    <div className="space-y-2 max-w-xl">
      <EntityCard entity="town" />
      <EntityCard entity="rig" />
      <EntityCard entity="convoy" />
      <EntityCard entity="polecat" />
      <EntityCard entity="refinery" />
      <EntityCard entity="witness" />
      <EntityCard entity="beads" />
    </div>
  ),
}

const sampleLiveData: EntityLiveData = {
  town: {
    rigCount: 3,
    totalPolecats: 8,
    activeConvoys: 2,
  },
  rig: {
    name: 'citadel',
    polecatCount: 3,
    convoyCount: 2,
    openBeads: 15,
  },
  convoy: {
    id: 'cv-abc',
    name: 'Phase 3 Guide',
    issueCount: 8,
    completedCount: 3,
    status: 'in_progress',
  },
  polecat: {
    name: 'toast',
    currentTask: 'Implementing EntityCard',
    status: 'active',
    rig: 'citadel',
  },
  refinery: {
    queueDepth: 3,
    processing: 1,
    completed24h: 12,
  },
  witness: {
    monitoredPolecats: 5,
    activePolecats: 3,
    alertCount: 1,
  },
  beads: {
    openCount: 23,
    closedCount: 147,
    blockedCount: 2,
  },
}

export const EntityCardListDefault: Story = {
  render: () => (
    <div className="max-w-xl">
      <EntityCardList />
    </div>
  ),
}

export const EntityCardListWithLiveData: Story = {
  render: () => (
    <div className="max-w-xl">
      <EntityCardList liveData={sampleLiveData} />
    </div>
  ),
}

export const InteractiveExample: Story = {
  render: () => (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold text-bone mb-4">Gas Town Entities</h2>
      <p className="text-sm text-ash mb-6">
        Click on any card to expand and learn more about each entity type.
      </p>
      <EntityCardList
        liveData={sampleLiveData}
        onEntityClick={(entity) => console.log('Selected:', entity)}
      />
    </div>
  ),
}
