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
      options: ['active', 'thinking', 'slow', 'unresponsive', 'dead', 'blocked', 'done'] as Status[],
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
