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

export const IconOnly: Story = {
  args: {
    status: 'active',
    showLabel: false,
  },
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
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
