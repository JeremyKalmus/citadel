import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DependencyGraph } from './dependency-graph'
import { Panel, PanelHeader, PanelBody } from '../ui/panel'
import type { Bead } from '@/lib/gastown'

const meta = {
  title: 'Beads/DependencyGraph',
  component: DependencyGraph,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DependencyGraph>

export default meta
type Story = StoryObj<typeof meta>

const mockBeads: Bead[] = [
  {
    id: 'ct-001',
    title: 'Phase 2D: Beads Dashboard',
    status: 'open',
    issue_type: 'epic',
    priority: 1,
    created_at: '2024-01-09T12:00:00Z',
    updated_at: '2024-01-09T12:00:00Z',
    depends_on: [],
    blocks: ['ct-002', 'ct-003', 'ct-004'],
  },
  {
    id: 'ct-002',
    title: 'Core Table Implementation',
    status: 'in_progress',
    issue_type: 'task',
    priority: 1,
    assignee: 'furiosa',
    created_at: '2024-01-09T12:00:00Z',
    updated_at: '2024-01-09T12:00:00Z',
    depends_on: ['ct-001'],
    blocks: ['ct-003', 'ct-004'],
  },
  {
    id: 'ct-003',
    title: 'Dependency Graph Visualization',
    status: 'hooked',
    issue_type: 'task',
    priority: 2,
    assignee: 'rictus',
    created_at: '2024-01-09T12:00:00Z',
    updated_at: '2024-01-09T12:00:00Z',
    depends_on: ['ct-001', 'ct-002'],
    blocks: [],
  },
  {
    id: 'ct-004',
    title: 'Convoy Integration',
    status: 'blocked',
    issue_type: 'task',
    priority: 2,
    created_at: '2024-01-09T12:00:00Z',
    updated_at: '2024-01-09T12:00:00Z',
    depends_on: ['ct-002'],
    blocks: [],
  },
]

const complexBeads: Bead[] = [
  {
    id: 'epic-1',
    title: 'Epic: User Auth System',
    status: 'open',
    issue_type: 'epic',
    priority: 0,
    created_at: '2024-01-09T12:00:00Z',
    updated_at: '2024-01-09T12:00:00Z',
    depends_on: [],
    blocks: ['task-1', 'task-2'],
  },
  {
    id: 'task-1',
    title: 'Database schema design',
    status: 'closed',
    issue_type: 'task',
    priority: 1,
    created_at: '2024-01-09T12:00:00Z',
    updated_at: '2024-01-09T12:00:00Z',
    depends_on: ['epic-1'],
    blocks: ['task-3', 'task-4'],
  },
  {
    id: 'task-2',
    title: 'API endpoint design',
    status: 'closed',
    issue_type: 'task',
    priority: 1,
    created_at: '2024-01-09T12:00:00Z',
    updated_at: '2024-01-09T12:00:00Z',
    depends_on: ['epic-1'],
    blocks: ['task-4'],
  },
  {
    id: 'task-3',
    title: 'User model implementation',
    status: 'in_progress',
    issue_type: 'task',
    priority: 2,
    assignee: 'worker-1',
    created_at: '2024-01-09T12:00:00Z',
    updated_at: '2024-01-09T12:00:00Z',
    depends_on: ['task-1'],
    blocks: ['task-5'],
  },
  {
    id: 'task-4',
    title: 'Auth middleware',
    status: 'hooked',
    issue_type: 'task',
    priority: 2,
    assignee: 'worker-2',
    created_at: '2024-01-09T12:00:00Z',
    updated_at: '2024-01-09T12:00:00Z',
    depends_on: ['task-1', 'task-2'],
    blocks: ['task-5'],
  },
  {
    id: 'task-5',
    title: 'Integration tests',
    status: 'blocked',
    issue_type: 'task',
    priority: 3,
    created_at: '2024-01-09T12:00:00Z',
    updated_at: '2024-01-09T12:00:00Z',
    depends_on: ['task-3', 'task-4'],
    blocks: [],
  },
]

export const Default: Story = {
  args: {
    beads: mockBeads,
  },
}

export const WithSelection: Story = {
  args: {
    beads: mockBeads,
    selectedId: 'ct-003',
    onSelect: (bead) => console.log('Selected:', bead.id),
  },
}

export const ComplexGraph: Story = {
  args: {
    beads: complexBeads,
  },
}

export const EmptyState: Story = {
  args: {
    beads: [],
  },
}

export const SingleNode: Story = {
  args: {
    beads: [
      {
        id: 'single-1',
        title: 'Standalone Task',
        status: 'open',
        issue_type: 'task',
        priority: 2,
        created_at: '2024-01-09T12:00:00Z',
        updated_at: '2024-01-09T12:00:00Z',
        depends_on: [],
        blocks: [],
      },
    ],
  },
}

export const InPanel: Story = {
  args: {
    beads: mockBeads,
  },
  render: (args) => (
    <Panel className="max-w-3xl">
      <PanelHeader title="Dependency Graph" icon="activity" />
      <PanelBody>
        <DependencyGraph {...args} />
      </PanelBody>
    </Panel>
  ),
}
