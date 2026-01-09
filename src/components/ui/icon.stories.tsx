import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Icon, type IconName, type IconVariant } from './icon'

const allIcons: IconName[] = [
  // Status icons (Heroicons)
  "play-circle",
  "check-circle",
  "exclamation-triangle",
  "x-circle",
  "clock",
  "lock",
  "cpu",
  "cog",
  // Activity icons (Lucide)
  "activity",
  "brain",
  "container",
  "truck-lucide",
  "terminal",
  "settings",
  // Domain icons (Font Awesome)
  "truck",
  "road",
]

const meta = {
  title: 'UI/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: allIcons,
    },
    variant: {
      control: 'select',
      options: ['default', 'alert', 'active', 'ok', 'muted'] as IconVariant[],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'check-circle',
    'aria-label': 'Success',
  },
}

export const Variants: Story = {
  args: {
    name: 'check-circle',
    'aria-label': 'Status icon',
  },
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <Icon name="check-circle" aria-label="Default" variant="default" />
        <span className="text-xs text-ash">default</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Icon name="exclamation-triangle" aria-label="Alert" variant="alert" />
        <span className="text-xs text-ash">alert</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Icon name="play-circle" aria-label="Active" variant="active" />
        <span className="text-xs text-ash">active</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Icon name="check-circle" aria-label="OK" variant="ok" />
        <span className="text-xs text-ash">ok</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Icon name="clock" aria-label="Muted" variant="muted" />
        <span className="text-xs text-ash">muted</span>
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  args: {
    name: 'truck',
    'aria-label': 'Rig',
  },
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-1">
        <Icon name="truck" aria-label="XS" size="xs" />
        <span className="text-xs text-ash">xs</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Icon name="truck" aria-label="SM" size="sm" />
        <span className="text-xs text-ash">sm</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Icon name="truck" aria-label="MD" size="md" />
        <span className="text-xs text-ash">md</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Icon name="truck" aria-label="LG" size="lg" />
        <span className="text-xs text-ash">lg</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Icon name="truck" aria-label="XL" size="xl" />
        <span className="text-xs text-ash">xl</span>
      </div>
    </div>
  ),
}

export const StatusIcons: Story = {
  args: {
    name: 'play-circle',
    'aria-label': 'Status',
  },
  render: () => (
    <div className="space-y-4">
      <h4 className="section-header">Status Icons (Heroicons)</h4>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <Icon name="play-circle" aria-label="Running" variant="ok" />
          <span className="text-xs text-ash">Running</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon name="check-circle" aria-label="Complete" variant="ok" />
          <span className="text-xs text-ash">Complete</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon name="clock" aria-label="Throttled" variant="active" />
          <span className="text-xs text-ash">Throttled</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon name="exclamation-triangle" aria-label="Stalled" variant="alert" />
          <span className="text-xs text-ash">Stalled</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon name="x-circle" aria-label="Dead" className="text-status-dead" />
          <span className="text-xs text-ash">Dead</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon name="lock" aria-label="Blocked" variant="muted" />
          <span className="text-xs text-ash">Blocked</span>
        </div>
      </div>
    </div>
  ),
}

export const DomainIcons: Story = {
  args: {
    name: 'truck',
    'aria-label': 'Domain',
  },
  render: () => (
    <div className="space-y-4">
      <h4 className="section-header">Domain Icons (Font Awesome)</h4>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <Icon name="truck" aria-label="Rig" size="lg" />
          <span className="text-xs text-ash">Rig</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Icon name="road" aria-label="Convoy" size="lg" />
          <span className="text-xs text-ash">Convoy</span>
        </div>
      </div>
    </div>
  ),
}

export const AllIcons: Story = {
  args: {
    name: 'check-circle',
    'aria-label': 'All icons',
  },
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="section-header">Heroicons (Status)</h4>
        <div className="flex flex-wrap gap-4">
          {(['play-circle', 'check-circle', 'exclamation-triangle', 'x-circle', 'clock', 'lock', 'cpu', 'cog'] as IconName[]).map((name) => (
            <div key={name} className="flex flex-col items-center gap-1 w-20">
              <Icon name={name} aria-label={name} size="md" />
              <span className="text-xs text-ash text-center truncate w-full">{name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="section-header">Lucide (UI)</h4>
        <div className="flex flex-wrap gap-4">
          {(['activity', 'brain', 'container', 'truck-lucide', 'terminal', 'settings'] as IconName[]).map((name) => (
            <div key={name} className="flex flex-col items-center gap-1 w-20">
              <Icon name={name} aria-label={name} size="md" />
              <span className="text-xs text-ash text-center truncate w-full">{name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="section-header">Font Awesome (Domain)</h4>
        <div className="flex flex-wrap gap-4">
          {(['truck', 'road'] as IconName[]).map((name) => (
            <div key={name} className="flex flex-col items-center gap-1 w-20">
              <Icon name={name} aria-label={name} size="md" />
              <span className="text-xs text-ash text-center truncate w-full">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}
