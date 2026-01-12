import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Gauge, GaugeCompact } from './gauge'

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

export const Compact: Story = {
  args: {
    value: 75,
  },
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="label mb-2">Compact Gauge (inline use)</p>
        <div className="flex items-center gap-4">
          <span className="text-xs text-ash w-20">Epic 1</span>
          <div className="w-24">
            <GaugeCompact value={80} />
          </div>
          <span className="text-xs text-ash">8/10</span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs text-ash w-20">Epic 2</span>
          <div className="w-24">
            <GaugeCompact value={40} />
          </div>
          <span className="text-xs text-ash">4/10</span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs text-ash w-20">Epic 3</span>
          <div className="w-24">
            <GaugeCompact value={100} />
          </div>
          <span className="text-xs text-ash">5/5</span>
        </div>
      </div>
    </div>
  ),
}

export const InContext: Story = {
  args: {
    value: 67,
  },
  render: () => (
    <div className="space-y-6 max-w-lg">
      {/* Convoy progress example */}
      <div className="p-4 bg-gunmetal rounded-sm border border-chrome-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-bone font-semibold">Convoy hq-cv-123</span>
          <span className="text-xs text-ash">8/12 issues</span>
        </div>
        <Gauge value={67} size="md" />
      </div>

      {/* Token usage example */}
      <div className="p-4 bg-gunmetal rounded-sm border border-chrome-border">
        <p className="section-header mb-3">Token Usage by Agent</p>
        <div className="space-y-2">
          {[
            { label: "Polecats", value: 85, tokens: "125K" },
            { label: "Witness", value: 45, tokens: "66K" },
            { label: "Refinery", value: 30, tokens: "44K" },
            { label: "Mayor", value: 15, tokens: "22K" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-ash w-20">{item.label}</span>
              <Gauge value={item.value} size="sm" showLabel={false} className="flex-1" />
              <span className="text-xs font-mono text-bone w-12 text-right">
                {item.tokens}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}
