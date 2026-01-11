import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatusBadge, type Status } from './status-badge'

const meta = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [
        'active', 'thinking', 'slow', 'unresponsive', 'dead', 'blocked', 'done',
        'refinery_queued', 'refinery_rebasing', 'refinery_testing', 'refinery_merging'
      ] as Status[],
    },
    showLabel: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = {
  args: {
    status: 'active',
  },
}

export const Thinking: Story = {
  args: {
    status: 'thinking',
  },
}

export const Slow: Story = {
  args: {
    status: 'slow',
  },
}

export const Unresponsive: Story = {
  args: {
    status: 'unresponsive',
  },
}

export const Dead: Story = {
  args: {
    status: 'dead',
  },
}

export const Blocked: Story = {
  args: {
    status: 'blocked',
  },
}

export const Done: Story = {
  args: {
    status: 'done',
  },
}

// Refinery Pipeline States
export const RefineryQueued: Story = {
  args: {
    status: 'refinery_queued',
  },
}

export const RefineryRebasing: Story = {
  args: {
    status: 'refinery_rebasing',
  },
}

export const RefineryTesting: Story = {
  args: {
    status: 'refinery_testing',
  },
}

export const RefineryMerging: Story = {
  args: {
    status: 'refinery_merging',
  },
}

export const Small: Story = {
  args: {
    status: 'active',
    size: 'sm',
  },
}

export const DotOnly: Story = {
  args: {
    status: 'active',
    showLabel: false,
  },
}

export const AllStates: Story = {
  args: {
    status: 'active',
  },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <StatusBadge status="active" />
      <StatusBadge status="thinking" />
      <StatusBadge status="slow" />
      <StatusBadge status="unresponsive" />
      <StatusBadge status="dead" />
      <StatusBadge status="blocked" />
      <StatusBadge status="done" />
    </div>
  ),
}

/**
 * Refinery Pipeline States
 * These states track a PR through the merge queue:
 * Queued → Rebasing → Testing → Merging
 */
export const RefineryStates: Story = {
  args: {
    status: 'refinery_queued',
  },
  render: () => (
    <div className="space-y-4">
      <div className="text-ash text-sm uppercase tracking-wider">
        Refinery Pipeline States
      </div>
      <div className="flex flex-wrap gap-4">
        <StatusBadge status="refinery_queued" />
        <StatusBadge status="refinery_rebasing" />
        <StatusBadge status="refinery_testing" />
        <StatusBadge status="refinery_merging" />
      </div>
    </div>
  ),
}

export const AllStatesSmall: Story = {
  args: {
    status: 'active',
  },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <StatusBadge status="active" size="sm" />
      <StatusBadge status="thinking" size="sm" />
      <StatusBadge status="slow" size="sm" />
      <StatusBadge status="unresponsive" size="sm" />
      <StatusBadge status="dead" size="sm" />
      <StatusBadge status="blocked" size="sm" />
      <StatusBadge status="done" size="sm" />
    </div>
  ),
}

export const RefineryStatesSmall: Story = {
  args: {
    status: 'refinery_queued',
  },
  render: () => (
    <div className="space-y-4">
      <div className="text-ash text-sm uppercase tracking-wider">
        Refinery States (Small)
      </div>
      <div className="flex flex-wrap gap-4">
        <StatusBadge status="refinery_queued" size="sm" />
        <StatusBadge status="refinery_rebasing" size="sm" />
        <StatusBadge status="refinery_testing" size="sm" />
        <StatusBadge status="refinery_merging" size="sm" />
      </div>
    </div>
  ),
}

/**
 * DS2 Phase 4: Animated Status Indicators
 * Active and Processing states pulse with mechanical timing (steps, not ease).
 * Static states remain steady - animation is earned through activity.
 */
export const AnimatedStates: Story = {
  args: {
    status: 'active',
  },
  render: () => (
    <div className="space-y-6 p-4">
      <div className="text-ash text-sm uppercase tracking-wider mb-2">
        Animated (active states pulse)
      </div>
      <div className="flex flex-wrap gap-6">
        <StatusBadge status="active" />
        <StatusBadge status="thinking" />
      </div>
      <div className="text-ash text-sm uppercase tracking-wider mt-6 mb-2">
        Static (inactive states stay steady)
      </div>
      <div className="flex flex-wrap gap-6">
        <StatusBadge status="slow" />
        <StatusBadge status="blocked" />
        <StatusBadge status="done" />
      </div>
      <div className="text-ash text-xs mt-4">
        DS2 Phase 4: status-pulse uses steps(2, end) for mechanical pulsing
      </div>
    </div>
  ),
}
