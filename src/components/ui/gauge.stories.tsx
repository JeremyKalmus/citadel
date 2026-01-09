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
    segments: {
      control: { type: 'range', min: 5, max: 20, step: 1 },
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
    segments: 10,
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

export const FiveSegments: Story = {
  args: {
    value: 60,
    segments: 5,
  },
}

export const TwentySegments: Story = {
  args: {
    value: 85,
    segments: 20,
  },
}

export const NoLabel: Story = {
  args: {
    value: 65,
    showLabel: false,
  },
}

export const AllSizes: Story = {
  args: {
    value: 50,
  },
  render: () => (
    <div className="space-y-4 w-64">
      <div>
        <p className="label mb-2">Small (75%)</p>
        <Gauge value={75} size="sm" />
      </div>
      <div>
        <p className="label mb-2">Medium (50%)</p>
        <Gauge value={50} size="md" />
      </div>
      <div>
        <p className="label mb-2">Large (25%)</p>
        <Gauge value={25} size="lg" />
      </div>
    </div>
  ),
}

export const SegmentVariations: Story = {
  args: {
    value: 60,
  },
  render: () => (
    <div className="space-y-4 w-64">
      <div>
        <p className="label mb-2">5 Segments</p>
        <Gauge value={60} segments={5} />
      </div>
      <div>
        <p className="label mb-2">10 Segments (default)</p>
        <Gauge value={60} segments={10} />
      </div>
      <div>
        <p className="label mb-2">20 Segments</p>
        <Gauge value={60} segments={20} />
      </div>
    </div>
  ),
}
