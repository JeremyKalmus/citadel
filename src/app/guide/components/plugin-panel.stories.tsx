import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PluginPanel } from './plugin-panel'
import type { PluginInfo } from '@/hooks/use-plugins'

const meta = {
  title: 'Guide/PluginPanel',
  component: PluginPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PluginPanel>

export default meta
type Story = StoryObj<typeof meta>

// Sample plugin data matching ~/gt/plugins/
const samplePlugins: PluginInfo[] = [
  {
    name: 'guzzoline',
    version: '1.0.0',
    description: 'Token efficiency and headless polecat mode for Gas Town',
    hasClaudeMd: true,
    effects: [
      'Town-wide plugin',
      'Affects all rigs',
      'Installs hooks',
      'Adds formulas/templates',
      'Token budget enforcement',
      'Model tier recommendations',
      'Enforcement gates',
    ],
    enabled: true,
    scope: 'town',
    type: 'town-plugin',
  },
  {
    name: 'hitch',
    version: '0.1.0',
    description: 'Phase chain automation - mechanical link that keeps multi-phase features moving forward',
    hasClaudeMd: true,
    effects: [
      'Background service',
      'Affects all rigs',
      'Runs background daemon',
      'Requires: keeper',
    ],
    enabled: true,
    scope: 'town',
    type: 'global-daemon',
  },
  {
    name: 'keeper',
    version: '1.0.0',
    description: 'Governance and approval system for Gas Town components',
    hasClaudeMd: false,
    effects: [
      'Per-rig configuration',
      'Enforcement gates',
    ],
    enabled: true,
    scope: 'rig',
    type: 'rig-plugin',
  },
]

export const Default: Story = {
  args: {
    plugins: samplePlugins,
  },
}

export const Empty: Story = {
  args: {
    plugins: [],
  },
}

export const SinglePlugin: Story = {
  args: {
    plugins: [samplePlugins[0]],
  },
}

export const WithoutClaudeMd: Story = {
  args: {
    plugins: samplePlugins.map((p) => ({ ...p, hasClaudeMd: false })),
  },
}

export const MinimalPlugins: Story = {
  args: {
    plugins: [
      {
        name: 'custom-plugin',
        version: 'unknown',
        description: 'Plugin without manifest',
        hasClaudeMd: false,
        effects: [],
        enabled: true,
      },
    ],
  },
}

export const ManyPlugins: Story = {
  args: {
    plugins: [
      ...samplePlugins,
      {
        name: 'telemetry',
        version: '2.0.0',
        description: 'Usage tracking and analytics for Gas Town operations',
        hasClaudeMd: true,
        effects: ['Town-wide plugin', 'Runs background daemon'],
        enabled: true,
        scope: 'town',
        type: 'global-daemon',
      },
      {
        name: 'slack-notify',
        version: '1.2.0',
        description: 'Slack notifications for convoy events',
        hasClaudeMd: false,
        effects: ['Installs hooks', 'Affects all rigs'],
        enabled: true,
        scope: 'town',
        type: 'town-plugin',
      },
    ],
  },
}
