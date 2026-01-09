import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ActionButton } from './action-button'
import { Play, Trash2, Settings, RefreshCw } from 'lucide-react'

const meta = {
  title: 'UI/ActionButton',
  component: ActionButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'danger', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ActionButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Action',
    variant: 'default',
  },
}

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
    icon: <Trash2 className="w-4 h-4" />,
  },
}

export const Ghost: Story = {
  args: {
    children: 'Settings',
    variant: 'ghost',
    icon: <Settings className="w-4 h-4" />,
  },
}

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    children: 'Medium',
    size: 'md',
  },
}

export const WithIcon: Story = {
  args: {
    children: 'Start',
    icon: <Play className="w-4 h-4" />,
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
}

export const IconOnly: Story = {
  args: {
    icon: <RefreshCw className="w-4 h-4" />,
    variant: 'ghost',
    'aria-label': 'Refresh',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ActionButton variant="default" icon={<Play className="w-4 h-4" />}>
        Default
      </ActionButton>
      <ActionButton variant="danger" icon={<Trash2 className="w-4 h-4" />}>
        Danger
      </ActionButton>
      <ActionButton variant="ghost" icon={<Settings className="w-4 h-4" />}>
        Ghost
      </ActionButton>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ActionButton size="sm">Small</ActionButton>
      <ActionButton size="md">Medium</ActionButton>
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <ActionButton>Normal</ActionButton>
        <ActionButton loading>Loading</ActionButton>
        <ActionButton disabled>Disabled</ActionButton>
      </div>
      <div className="flex gap-4">
        <ActionButton variant="danger">Normal</ActionButton>
        <ActionButton variant="danger" loading>Loading</ActionButton>
        <ActionButton variant="danger" disabled>Disabled</ActionButton>
      </div>
      <div className="flex gap-4">
        <ActionButton variant="ghost">Normal</ActionButton>
        <ActionButton variant="ghost" loading>Loading</ActionButton>
        <ActionButton variant="ghost" disabled>Disabled</ActionButton>
      </div>
    </div>
  ),
}

/**
 * DS2 Phase 4: Mechanical Motion Demo
 * Demonstrates the snappy, mechanical click feedback.
 * Hover and click to see the industrial control panel feel.
 */
export const MechanicalMotion: Story = {
  render: () => (
    <div className="space-y-6 p-4">
      <div className="text-ash text-sm uppercase tracking-wider mb-2">
        Click to feel the mechanical feedback
      </div>
      <div className="flex gap-4">
        <ActionButton variant="default" icon={<Play className="w-4 h-4" />}>
          Execute
        </ActionButton>
        <ActionButton variant="danger" icon={<Trash2 className="w-4 h-4" />}>
          Terminate
        </ActionButton>
        <ActionButton variant="ghost" icon={<RefreshCw className="w-4 h-4" />}>
          Refresh
        </ActionButton>
      </div>
      <div className="text-ash text-xs mt-4">
        DS2 Phase 4: btn-mechanical class provides stepped transitions (no soft easing)
      </div>
    </div>
  ),
}
