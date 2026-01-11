import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { JourneyTracker, JourneyTrackerCompact } from './journey-tracker'
import { JourneyStage } from '@/lib/gastown/types'

const meta = {
  title: 'Journey/JourneyTracker',
  component: JourneyTracker,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-deep-black p-6 max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof JourneyTracker>

export default meta
type Story = StoryObj<typeof meta>

const baseTimestamps = {
  queued: '2026-01-11T10:00:00Z',
  claimed: '2026-01-11T10:02:00Z',
  workStarted: '2026-01-11T10:05:00Z',
  prOpened: '2026-01-11T11:30:00Z',
  refineryEntered: '2026-01-11T11:45:00Z',
  merged: '2026-01-11T11:55:00Z',
}

// Stage progression stories
export const Queued: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.QUEUED,
    timestamps: { queued: baseTimestamps.queued },
  },
}

export const Claimed: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.CLAIMED,
    timestamps: {
      queued: baseTimestamps.queued,
      claimed: baseTimestamps.claimed,
    },
  },
}

export const Working: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.WORKING,
    substage: '2b',
    actor: 'polecat/dementus',
    commitCount: 3,
    timestamps: {
      queued: baseTimestamps.queued,
      claimed: baseTimestamps.claimed,
      workStarted: baseTimestamps.workStarted,
    },
  },
}

export const PRReady: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.PR_READY,
    timestamps: {
      queued: baseTimestamps.queued,
      claimed: baseTimestamps.claimed,
      workStarted: baseTimestamps.workStarted,
      prOpened: baseTimestamps.prOpened,
    },
  },
}

export const RefineryRebasing: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.REFINERY,
    refinerySubstage: '4a',
    timestamps: {
      queued: baseTimestamps.queued,
      claimed: baseTimestamps.claimed,
      workStarted: baseTimestamps.workStarted,
      prOpened: baseTimestamps.prOpened,
      refineryEntered: baseTimestamps.refineryEntered,
    },
  },
}

export const RefineryTesting: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.REFINERY,
    refinerySubstage: '4b',
    timestamps: {
      queued: baseTimestamps.queued,
      claimed: baseTimestamps.claimed,
      workStarted: baseTimestamps.workStarted,
      prOpened: baseTimestamps.prOpened,
      refineryEntered: baseTimestamps.refineryEntered,
    },
  },
}

export const RefineryMerging: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.REFINERY,
    refinerySubstage: '4c',
    timestamps: {
      queued: baseTimestamps.queued,
      claimed: baseTimestamps.claimed,
      workStarted: baseTimestamps.workStarted,
      prOpened: baseTimestamps.prOpened,
      refineryEntered: baseTimestamps.refineryEntered,
    },
  },
}

export const Merged: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.MERGED,
    timestamps: baseTimestamps,
  },
}

export const Blocked: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.WORKING,
    substage: '2c',
    actor: 'polecat/dementus',
    blocked: true,
    timestamps: {
      queued: baseTimestamps.queued,
      claimed: baseTimestamps.claimed,
      workStarted: baseTimestamps.workStarted,
    },
  },
}

/**
 * Full journey progression showing all stages
 */
export const AllStages: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.REFINERY,
    refinerySubstage: '4b',
    timestamps: {
      queued: baseTimestamps.queued,
      claimed: baseTimestamps.claimed,
      workStarted: baseTimestamps.workStarted,
      prOpened: baseTimestamps.prOpened,
      refineryEntered: baseTimestamps.refineryEntered,
    },
  },
  render: () => (
    <div className="space-y-8">
      <div className="text-ash text-sm uppercase tracking-wider mb-2">
        Journey Progression
      </div>
      <JourneyTracker
        issueId="ci-001"
        currentStage={JourneyStage.QUEUED}
        timestamps={{ queued: baseTimestamps.queued }}
      />
      <JourneyTracker
        issueId="ci-002"
        currentStage={JourneyStage.CLAIMED}
        timestamps={{ queued: baseTimestamps.queued, claimed: baseTimestamps.claimed }}
      />
      <JourneyTracker
        issueId="ci-003"
        currentStage={JourneyStage.WORKING}
        substage="2b"
        actor="polecat/dementus"
        commitCount={5}
        timestamps={{ queued: baseTimestamps.queued, claimed: baseTimestamps.claimed, workStarted: baseTimestamps.workStarted }}
      />
      <JourneyTracker
        issueId="ci-004"
        currentStage={JourneyStage.PR_READY}
        timestamps={{ queued: baseTimestamps.queued, claimed: baseTimestamps.claimed, workStarted: baseTimestamps.workStarted, prOpened: baseTimestamps.prOpened }}
      />
      <JourneyTracker
        issueId="ci-005"
        currentStage={JourneyStage.REFINERY}
        refinerySubstage="4b"
        timestamps={{ queued: baseTimestamps.queued, claimed: baseTimestamps.claimed, workStarted: baseTimestamps.workStarted, prOpened: baseTimestamps.prOpened, refineryEntered: baseTimestamps.refineryEntered }}
      />
      <JourneyTracker
        issueId="ci-006"
        currentStage={JourneyStage.MERGED}
        timestamps={baseTimestamps}
      />
    </div>
  ),
}

/**
 * Refinery substages showing the merge queue progression
 */
export const RefinerySubstages: Story = {
  args: {
    issueId: 'ci-abc',
    currentStage: JourneyStage.REFINERY,
    refinerySubstage: '4a',
    timestamps: {
      queued: baseTimestamps.queued,
      claimed: baseTimestamps.claimed,
      workStarted: baseTimestamps.workStarted,
      prOpened: baseTimestamps.prOpened,
      refineryEntered: baseTimestamps.refineryEntered,
    },
  },
  render: () => (
    <div className="space-y-8">
      <div className="text-ash text-sm uppercase tracking-wider mb-2">
        Refinery Substages (Stage 4)
      </div>
      <div className="space-y-6">
        <div>
          <div className="text-ash/70 text-xs mb-2">4a: Rebasing</div>
          <JourneyTracker
            issueId="ci-rebase"
            currentStage={JourneyStage.REFINERY}
            refinerySubstage="4a"
            timestamps={{ queued: baseTimestamps.queued, claimed: baseTimestamps.claimed, workStarted: baseTimestamps.workStarted, prOpened: baseTimestamps.prOpened, refineryEntered: baseTimestamps.refineryEntered }}
          />
        </div>
        <div>
          <div className="text-ash/70 text-xs mb-2">4b: Testing</div>
          <JourneyTracker
            issueId="ci-test"
            currentStage={JourneyStage.REFINERY}
            refinerySubstage="4b"
            timestamps={{ queued: baseTimestamps.queued, claimed: baseTimestamps.claimed, workStarted: baseTimestamps.workStarted, prOpened: baseTimestamps.prOpened, refineryEntered: baseTimestamps.refineryEntered }}
          />
        </div>
        <div>
          <div className="text-ash/70 text-xs mb-2">4c: Merging</div>
          <JourneyTracker
            issueId="ci-merge"
            currentStage={JourneyStage.REFINERY}
            refinerySubstage="4c"
            timestamps={{ queued: baseTimestamps.queued, claimed: baseTimestamps.claimed, workStarted: baseTimestamps.workStarted, prOpened: baseTimestamps.prOpened, refineryEntered: baseTimestamps.refineryEntered }}
          />
        </div>
      </div>
    </div>
  ),
}

// Compact variant stories
const compactMeta = {
  title: 'Journey/JourneyTrackerCompact',
  component: JourneyTrackerCompact,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div className="bg-deep-black p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof JourneyTrackerCompact>

type CompactStory = StoryObj<typeof compactMeta>

export const CompactQueued: CompactStory = {
  args: { currentStage: JourneyStage.QUEUED },
  render: () => <JourneyTrackerCompact currentStage={JourneyStage.QUEUED} />,
}

export const CompactWorking: CompactStory = {
  args: { currentStage: JourneyStage.WORKING },
  render: () => <JourneyTrackerCompact currentStage={JourneyStage.WORKING} />,
}

export const CompactRefinery: CompactStory = {
  args: { currentStage: JourneyStage.REFINERY },
  render: () => <JourneyTrackerCompact currentStage={JourneyStage.REFINERY} />,
}

export const CompactMerged: CompactStory = {
  args: { currentStage: JourneyStage.MERGED },
  render: () => <JourneyTrackerCompact currentStage={JourneyStage.MERGED} />,
}

export const CompactBlocked: CompactStory = {
  args: { currentStage: JourneyStage.WORKING, blocked: true },
  render: () => <JourneyTrackerCompact currentStage={JourneyStage.WORKING} blocked />,
}

export const CompactAllStages: CompactStory = {
  args: { currentStage: JourneyStage.QUEUED },
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-ash text-xs w-16">Queued</span>
        <JourneyTrackerCompact currentStage={JourneyStage.QUEUED} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash text-xs w-16">Claimed</span>
        <JourneyTrackerCompact currentStage={JourneyStage.CLAIMED} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash text-xs w-16">Working</span>
        <JourneyTrackerCompact currentStage={JourneyStage.WORKING} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash text-xs w-16">PR Ready</span>
        <JourneyTrackerCompact currentStage={JourneyStage.PR_READY} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash text-xs w-16">Refinery</span>
        <JourneyTrackerCompact currentStage={JourneyStage.REFINERY} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash text-xs w-16">Merged</span>
        <JourneyTrackerCompact currentStage={JourneyStage.MERGED} />
      </div>
    </div>
  ),
}
