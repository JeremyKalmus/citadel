import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { BeadsTree, type Bead } from "./beads-tree";
import { Panel, PanelHeader, PanelBody } from "@/components/ui";

const meta = {
  title: "Beads/BeadsTree",
  component: BeadsTree,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BeadsTree>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock bead data
const mockBeads: Bead[] = [
  // Citadel rig - Phase 2A Epic and issues
  {
    id: "ci-785",
    title: "Phase 2D: Beads Visibility Dashboard",
    issue_type: "epic",
    status: "open",
    priority: 1,
    created_at: "2026-01-09T10:00:00Z",
    updated_at: "2026-01-09T10:00:00Z",
    depends_on: [],
    blocks: [],
  },
  {
    id: "ci-tlj",
    title: "BeadsTree hierarchical view",
    issue_type: "feature",
    status: "in_progress",
    priority: 2,
    assignee: "nux",
    created_at: "2026-01-10T13:27:00Z",
    updated_at: "2026-01-10T13:43:00Z",
    parent: "ci-785",
    depends_on: [],
    blocks: [],
  },
  {
    id: "ci-nvz",
    title: "BeadDetail panel UI",
    issue_type: "task",
    status: "closed",
    priority: 1,
    assignee: "furiosa",
    created_at: "2026-01-09T11:00:00Z",
    updated_at: "2026-01-10T09:00:00Z",
    parent: "ci-785",
    depends_on: [],
    blocks: [],
  },
  {
    id: "ci-zqb",
    title: "Add Beads nav item",
    issue_type: "task",
    status: "closed",
    priority: 1,
    created_at: "2026-01-09T11:30:00Z",
    updated_at: "2026-01-10T08:00:00Z",
    parent: "ci-785",
    depends_on: [],
    blocks: [],
  },
  {
    id: "ci-cg3",
    title: "Fix convoy beads API - add getBeadsForConvoy method",
    issue_type: "bug",
    status: "blocked",
    priority: 2,
    depends_on: ["ci-tlj"],
    blocks: [],
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-10T12:00:00Z",
    parent: "ci-785",
  },
  // Citadel rig - Phase 2B Epic
  {
    id: "ci-2b",
    title: "Phase 2B: Cost Visibility",
    issue_type: "epic",
    status: "closed",
    priority: 1,
    created_at: "2026-01-05T10:00:00Z",
    updated_at: "2026-01-08T16:00:00Z",
    depends_on: [],
    blocks: [],
  },
  {
    id: "ci-cost1",
    title: "Implement CostSparkline component",
    issue_type: "task",
    status: "closed",
    priority: 2,
    assignee: "slit",
    created_at: "2026-01-05T11:00:00Z",
    updated_at: "2026-01-06T14:00:00Z",
    parent: "ci-2b",
    depends_on: [],
    blocks: [],
  },
  {
    id: "ci-cost2",
    title: "Create useCost hook",
    issue_type: "task",
    status: "closed",
    priority: 2,
    assignee: "furiosa",
    created_at: "2026-01-05T12:00:00Z",
    updated_at: "2026-01-07T10:00:00Z",
    parent: "ci-2b",
    depends_on: [],
    blocks: [],
  },
  // Keeper rig
  {
    id: "kp-gov",
    title: "Governance Updates",
    issue_type: "epic",
    status: "open",
    priority: 2,
    created_at: "2026-01-08T09:00:00Z",
    updated_at: "2026-01-10T11:00:00Z",
    depends_on: [],
    blocks: [],
  },
  {
    id: "kp-010",
    title: "Update seed registry schema",
    issue_type: "task",
    status: "in_progress",
    priority: 2,
    assignee: "kappa",
    created_at: "2026-01-08T10:00:00Z",
    updated_at: "2026-01-10T10:00:00Z",
    parent: "kp-gov",
    depends_on: [],
    blocks: [],
  },
  {
    id: "kp-011",
    title: "Add validation rules for new seeds",
    issue_type: "task",
    status: "open",
    priority: 3,
    created_at: "2026-01-08T11:00:00Z",
    updated_at: "2026-01-09T15:00:00Z",
    parent: "kp-gov",
    depends_on: [],
    blocks: [],
  },
  // Gastown rig
  {
    id: "gt-core",
    title: "Core Infrastructure",
    issue_type: "epic",
    status: "open",
    priority: 1,
    created_at: "2026-01-07T08:00:00Z",
    updated_at: "2026-01-10T09:00:00Z",
    depends_on: [],
    blocks: [],
  },
  {
    id: "gt-005",
    title: "Fix convoy dispatch race condition",
    issue_type: "bug",
    status: "blocked",
    priority: 1,
    depends_on: ["gt-006", "gt-007"],
    blocks: [],
    created_at: "2026-01-09T14:00:00Z",
    updated_at: "2026-01-10T08:00:00Z",
    parent: "gt-core",
  },
  {
    id: "gt-006",
    title: "Add mutex for convoy state",
    issue_type: "task",
    status: "in_progress",
    priority: 1,
    assignee: "omega",
    created_at: "2026-01-09T15:00:00Z",
    updated_at: "2026-01-10T07:00:00Z",
    parent: "gt-core",
    depends_on: [],
    blocks: [],
  },
  {
    id: "gt-007",
    title: "Update convoy status enum",
    issue_type: "task",
    status: "open",
    priority: 2,
    created_at: "2026-01-09T16:00:00Z",
    updated_at: "2026-01-09T16:00:00Z",
    parent: "gt-core",
    depends_on: [],
    blocks: [],
  },
];

export const Default: Story = {
  args: {
    beads: mockBeads,
  },
};

export const WithSelection: Story = {
  args: {
    beads: mockBeads,
    selectedBeadId: "ci-tlj",
  },
};

export const Empty: Story = {
  args: {
    beads: [],
  },
};

export const SingleEpic: Story = {
  args: {
    beads: mockBeads.filter((b) => b.id.startsWith("ci-")),
  },
};

export const AllClosed: Story = {
  args: {
    beads: mockBeads
      .filter((b) => b.parent === "ci-2b")
      .concat(mockBeads.find((b) => b.id === "ci-2b")!),
  },
};

export const WithBlockedItems: Story = {
  args: {
    beads: mockBeads.filter(
      (b) => b.id.startsWith("gt-") || b.id === "ci-cg3"
    ),
  },
};

export const Interactive: Story = {
  args: {
    beads: mockBeads,
  },
  render: function InteractiveStory(args) {
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [selectedBead, setSelectedBead] = useState<Bead | undefined>(
      undefined
    );

    return (
      <div className="flex gap-4">
        <Panel className="flex-1">
          <PanelHeader title="Beads Inventory" icon="circle" />
          <PanelBody className="p-0">
            <BeadsTree
              {...args}
              selectedBeadId={selectedId}
              onBeadSelect={(bead) => {
                setSelectedId(bead.id);
                setSelectedBead(bead);
              }}
            />
          </PanelBody>
        </Panel>

        {selectedBead && (
          <Panel className="w-72">
            <PanelHeader title="Selected Bead" icon="terminal" />
            <PanelBody>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-ash text-xs">ID</span>
                  <p className="font-mono">{selectedBead.id}</p>
                </div>
                <div>
                  <span className="text-ash text-xs">Title</span>
                  <p>{selectedBead.title}</p>
                </div>
                <div>
                  <span className="text-ash text-xs">Type</span>
                  <p className="capitalize">{selectedBead.issue_type}</p>
                </div>
                <div>
                  <span className="text-ash text-xs">Status</span>
                  <p className="capitalize">{selectedBead.status}</p>
                </div>
                <div>
                  <span className="text-ash text-xs">Priority</span>
                  <p>P{selectedBead.priority}</p>
                </div>
                {selectedBead.assignee && (
                  <div>
                    <span className="text-ash text-xs">Assignee</span>
                    <p>{selectedBead.assignee}</p>
                  </div>
                )}
              </div>
            </PanelBody>
          </Panel>
        )}
      </div>
    );
  },
};

export const InPanel: Story = {
  args: {
    beads: mockBeads,
  },
  render: (args) => (
    <Panel className="max-w-4xl">
      <PanelHeader
        title="Beads Inventory"
        icon="circle"
        actions={<span className="text-xs text-ash">{args.beads.length} beads</span>}
      />
      <PanelBody className="p-0">
        <BeadsTree {...args} />
      </PanelBody>
    </Panel>
  ),
};

export const MixedPriorities: Story = {
  args: {
    beads: [
      {
        id: "test-p0",
        title: "Critical P0 issue",
        issue_type: "bug",
        status: "open",
        priority: 0,
        created_at: "2026-01-10T10:00:00Z",
        updated_at: "2026-01-10T10:00:00Z",
        depends_on: [],
        blocks: [],
      },
      {
        id: "test-p1",
        title: "High priority P1 task",
        issue_type: "task",
        status: "in_progress",
        priority: 1,
        assignee: "alpha",
        created_at: "2026-01-10T10:00:00Z",
        updated_at: "2026-01-10T10:00:00Z",
        depends_on: [],
        blocks: [],
      },
      {
        id: "test-p2",
        title: "Medium priority P2 feature",
        issue_type: "feature",
        status: "open",
        priority: 2,
        created_at: "2026-01-10T10:00:00Z",
        updated_at: "2026-01-10T10:00:00Z",
        depends_on: [],
        blocks: [],
      },
      {
        id: "test-p3",
        title: "Low priority P3 task",
        issue_type: "task",
        status: "open",
        priority: 3,
        created_at: "2026-01-10T10:00:00Z",
        updated_at: "2026-01-10T10:00:00Z",
        depends_on: [],
        blocks: [],
      },
      {
        id: "test-p4",
        title: "Backlog P4 item",
        issue_type: "task",
        status: "open",
        priority: 4,
        created_at: "2026-01-10T10:00:00Z",
        updated_at: "2026-01-10T10:00:00Z",
        depends_on: [],
        blocks: [],
      },
    ],
  },
};
