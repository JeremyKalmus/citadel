import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Panel } from './panel'

const meta = {
  title: 'UI/Panel',
  component: Panel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'inset'],
    },
  },
} satisfies Meta<typeof Panel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="p-4">
        <h3 className="text-sm font-medium mb-2">Default Panel</h3>
        <p className="text-xs text-chrome-dust">Standard panel with subtle background</p>
      </div>
    ),
  },
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div className="p-4">
        <h3 className="text-sm font-medium mb-2">Elevated Panel</h3>
        <p className="text-xs text-chrome-dust">Panel with shadow for emphasis</p>
      </div>
    ),
  },
}

export const Inset: Story = {
  args: {
    variant: 'inset',
    children: (
      <div className="p-4">
        <h3 className="text-sm font-medium mb-2">Inset Panel</h3>
        <p className="text-xs text-chrome-dust">Recessed panel for nested content</p>
      </div>
    ),
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Panel>
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2">Default</h3>
          <p className="text-xs text-chrome-dust">bg-steel - Standard content container</p>
        </div>
      </Panel>
      <Panel variant="elevated">
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2">Elevated</h3>
          <p className="text-xs text-chrome-dust">bg-oil + shadow - For important content</p>
        </div>
      </Panel>
      <Panel variant="inset">
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2">Inset</h3>
          <p className="text-xs text-chrome-dust">bg-abyss - For nested/secondary content</p>
        </div>
      </Panel>
    </div>
  ),
}

export const NestedPanels: Story = {
  render: () => (
    <Panel variant="elevated" className="p-4">
      <h3 className="text-sm font-medium mb-3">Parent Panel (Elevated)</h3>
      <Panel variant="inset" className="p-3">
        <h4 className="text-xs font-medium mb-2">Child Panel (Inset)</h4>
        <p className="text-xs text-chrome-dust">
          Panels can be nested to create visual hierarchy
        </p>
      </Panel>
    </Panel>
  ),
}

export const WithContent: Story = {
  render: () => (
    <Panel className="w-80">
      <div className="p-4 border-b border-chrome-shadow/50">
        <h3 className="text-sm font-medium">Worker Status</h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-chrome-dust">Status</span>
          <span className="text-status-active">Active</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-chrome-dust">Uptime</span>
          <span>2h 34m</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-chrome-dust">Tasks</span>
          <span>12 completed</span>
        </div>
      </div>
    </Panel>
  ),
}
