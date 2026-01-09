import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Gauge } from './gauge'

const meta = {
  title: 'UI/Gauge',
  component: Gauge,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showLabel: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Gauge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 50,
    size: 'md',
    showLabel: true,
  },
}

export const Small: Story = {
  args: {
    value: 75,
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    value: 50,
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    value: 25,
    size: 'lg',
  },
}

export const Empty: Story = {
  args: {
    value: 0,
  },
}

export const Full: Story = {
  args: {
    value: 100,
  },
}

export const NoLabel: Story = {
  args: {
    value: 65,
    showLabel: false,
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <div>
        <p className="text-xs text-chrome-dust mb-1">Small</p>
        <Gauge value={75} size="sm" />
      </div>
      <div>
        <p className="text-xs text-chrome-dust mb-1">Medium</p>
        <Gauge value={50} size="md" />
      </div>
      <div>
        <p className="text-xs text-chrome-dust mb-1">Large</p>
        <Gauge value={25} size="lg" />
      </div>
    </div>
  ),
}
