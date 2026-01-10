import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatusReference, StatusReferenceCompact } from './status-reference'

const meta = {
  title: 'Guide/StatusReference',
  component: StatusReference,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    interactive: {
      control: 'boolean',
      description: 'Enable hover interactions for highlighting',
    },
    variant: {
      control: 'select',
      options: ['table', 'cards'],
      description: 'Display variant',
    },
  },
} satisfies Meta<typeof StatusReference>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default table view showing all status states
 */
export const Default: Story = {
  args: {},
}

/**
 * Interactive mode with hover highlighting
 */
export const Interactive: Story = {
  args: {
    interactive: true,
  },
}

/**
 * Cards variant for detailed view
 */
export const CardsVariant: Story = {
  args: {
    variant: 'cards',
  },
}

/**
 * Interactive cards variant
 */
export const CardsInteractive: Story = {
  args: {
    variant: 'cards',
    interactive: true,
  },
}

/**
 * Constrained width to test responsiveness
 */
export const Narrow: Story = {
  args: {},
  render: (args) => (
    <div className="max-w-md">
      <StatusReference {...args} />
    </div>
  ),
}

/**
 * Cards in narrow container
 */
export const NarrowCards: Story = {
  args: {
    variant: 'cards',
  },
  render: (args) => (
    <div className="max-w-sm">
      <StatusReference {...args} />
    </div>
  ),
}

/**
 * Compact inline legend
 */
export const CompactLegend: Story = {
  args: {},
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-bone">Compact Status Legend</h3>
      <StatusReferenceCompact />
    </div>
  ),
}

/**
 * Compact legend with subset of statuses
 */
export const CompactSubset: Story = {
  args: {},
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-bone">Worker Statuses</h3>
      <StatusReferenceCompact statuses={['active', 'thinking', 'slow', 'unresponsive', 'dead']} />

      <h3 className="text-lg font-semibold text-bone mt-6">Issue Statuses</h3>
      <StatusReferenceCompact statuses={['blocked', 'done']} />
    </div>
  ),
}

/**
 * Full page example with context
 */
export const InContext: Story = {
  args: {},
  render: () => (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-bone mb-2">Status Reference</h2>
        <p className="text-ash">
          Gas Town uses 7 status states to communicate what&apos;s happening with workers and work items.
          Here&apos;s what each status means and what you should do.
        </p>
      </div>

      <StatusReference interactive />

      <div className="p-4 rounded-sm border border-chrome-border/50 bg-carbon-black/30">
        <h3 className="label text-bone mb-2">Quick Tip</h3>
        <p className="text-sm text-ash">
          Status colors are the only colors in Gas Town - they&apos;re &quot;earned&quot; through state.
          A green badge means things are good. Yellow or orange means pay attention.
          Red means investigate.
        </p>
      </div>
    </div>
  ),
}
