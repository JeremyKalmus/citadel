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
    type: "epic",
    status: "open",
    priority: 1,
    created: "2026-01-09T10:00:00Z",
    updated: "2026-01-09T10:00:00Z",
    rig: "citadel",
  },
  {
    id: "ci-tlj",
    title: "BeadsTree hierarchical view",
    type: "feature",
    status: "in_progress",
    priority: 2,
    assignee: "nux",
    created: "2026-01-10T13:27:00Z",
    updated: "2026-01-10T13:43:00Z",
    parent: "ci-785",
    rig: "citadel",
  },
  {
    id: "ci-nvz",
    title: "BeadDetail panel UI",
    type: "task",
    status: "closed",
    priority: 1,
    assignee: "furiosa",
    created: "2026-01-09T11:00:00Z",
    updated: "2026-01-10T09:00:00Z",
    parent: "ci-785",
    rig: "citadel",
  },
  {
    id: "ci-zqb",
    title: "Add Beads nav item",
    type: "task",
    status: "closed",
    priority: 1,
    created: "2026-01-09T11:30:00Z",
    updated: "2026-01-10T08:00:00Z",
    parent: "ci-785",
    rig: "citadel",
  },
  {
    id: "ci-cg3",
    title: "Fix convoy beads API - add getBeadsForConvoy method",
    type: "bug",
    status: "blocked",
    priority: 2,
    blockedBy: ["ci-tlj"],
    created: "2026-01-10T10:00:00Z",
    updated: "2026-01-10T12:00:00Z",
    parent: "ci-785",
    rig: "citadel",
  },
  // Citadel rig - Phase 2B Epic
  {
    id: "ci-2b",
    title: "Phase 2B: Cost Visibility",
    type: "epic",
    status: "closed",
    priority: 1,
    created: "2026-01-05T10:00:00Z",
    updated: "2026-01-08T16:00:00Z",
    rig: "citadel",
  },
  {
    id: "ci-cost1",
    title: "Implement CostSparkline component",
    type: "task",
    status: "closed",
    priority: 2,
    assignee: "slit",
    created: "2026-01-05T11:00:00Z",
    updated: "2026-01-06T14:00:00Z",
    parent: "ci-2b",
    rig: "citadel",
  },
  {
    id: "ci-cost2",
    title: "Create useCost hook",
    type: "task",
    status: "closed",
    priority: 2,
    assignee: "furiosa",
    created: "2026-01-05T12:00:00Z",
    updated: "2026-01-07T10:00:00Z",
    parent: "ci-2b",
    rig: "citadel",
  },
  // Keeper rig
  {
    id: "kp-gov",
    title: "Governance Updates",
    type: "epic",
    status: "open",
    priority: 2,
    created: "2026-01-08T09:00:00Z",
    updated: "2026-01-10T11:00:00Z",
    rig: "keeper",
  },
  {
    id: "kp-010",
    title: "Update seed registry schema",
    type: "task",
    status: "in_progress",
    priority: 2,
    assignee: "kappa",
    created: "2026-01-08T10:00:00Z",
    updated: "2026-01-10T10:00:00Z",
    parent: "kp-gov",
    rig: "keeper",
  },
  {
    id: "kp-011",
    title: "Add validation rules for new seeds",
    type: "task",
    status: "open",
    priority: 3,
    created: "2026-01-08T11:00:00Z",
    updated: "2026-01-09T15:00:00Z",
    parent: "kp-gov",
    rig: "keeper",
  },
  // Gastown rig
  {
    id: "gt-core",
    title: "Core Infrastructure",
    type: "epic",
    status: "open",
    priority: 1,
    created: "2026-01-07T08:00:00Z",
    updated: "2026-01-10T09:00:00Z",
    rig: "gastown",
  },
  {
    id: "gt-005",
    title: "Fix convoy dispatch race condition",
    type: "bug",
    status: "blocked",
    priority: 1,
    blockedBy: ["gt-006", "gt-007"],
    created: "2026-01-09T14:00:00Z",
    updated: "2026-01-10T08:00:00Z",
    parent: "gt-core",
    rig: "gastown",
  },
  {
    id: "gt-006",
    title: "Add mutex for convoy state",
    type: "task",
    status: "in_progress",
    priority: 1,
    assignee: "omega",
    created: "2026-01-09T15:00:00Z",
    updated: "2026-01-10T07:00:00Z",
    parent: "gt-core",
    rig: "gastown",
  },
  {
    id: "gt-007",
    title: "Update convoy status enum",
    type: "task",
    status: "open",
    priority: 2,
    created: "2026-01-09T16:00:00Z",
    updated: "2026-01-09T16:00:00Z",
    parent: "gt-core",
    rig: "gastown",
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

export const SingleRig: Story = {
  args: {
    beads: mockBeads.filter((b) => b.rig === "citadel"),
  },
};

export const AllClosed: Story = {
  args: {
    beads: mockBeads
      .filter((b) => b.rig === "citadel" && b.parent === "ci-2b")
      .concat(mockBeads.find((b) => b.id === "ci-2b")!),
  },
};

export const WithBlockedItems: Story = {
  args: {
    beads: mockBeads.filter(
      (b) => b.rig === "gastown" || (b.rig === "citadel" && b.id === "ci-cg3")
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
                  <p className="capitalize">{selectedBead.type}</p>
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
        type: "bug",
        status: "open",
        priority: 0,
        created: "2026-01-10T10:00:00Z",
        updated: "2026-01-10T10:00:00Z",
        rig: "test",
      },
      {
        id: "test-p1",
        title: "High priority P1 task",
        type: "task",
        status: "in_progress",
        priority: 1,
        assignee: "alpha",
        created: "2026-01-10T10:00:00Z",
        updated: "2026-01-10T10:00:00Z",
        rig: "test",
      },
      {
        id: "test-p2",
        title: "Medium priority P2 feature",
        type: "feature",
        status: "open",
        priority: 2,
        created: "2026-01-10T10:00:00Z",
        updated: "2026-01-10T10:00:00Z",
        rig: "test",
      },
      {
        id: "test-p3",
        title: "Low priority P3 task",
        type: "task",
        status: "open",
        priority: 3,
        created: "2026-01-10T10:00:00Z",
        updated: "2026-01-10T10:00:00Z",
        rig: "test",
      },
      {
        id: "test-p4",
        title: "Backlog P4 item",
        type: "task",
        status: "open",
        priority: 4,
        created: "2026-01-10T10:00:00Z",
        updated: "2026-01-10T10:00:00Z",
        rig: "test",
      },
    ],
  },
};
