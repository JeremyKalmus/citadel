"use client";

import { Panel, PanelHeader, PanelBody } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { WorkflowNode } from "./workflow-node";
import { StageNode } from "./stage-node";
import { Arrow } from "./arrow";

/**
 * WorkflowDiagram - Vertical layered diagram showing Gas Town architecture
 *
 * Three layers:
 * 1. Coordination: User → Mayor → Convoy
 * 2. Execution: Queued → Hooked → Working → PR Ready → Refinery
 * 3. Completion: Merged to Main
 */
export function WorkflowDiagram() {
  return (
    <div className="space-y-4">
      {/* Layer 1: Coordination */}
      <Panel>
        <PanelHeader title="COORDINATION" />
        <PanelBody>
          <div className="flex items-center justify-center gap-6 py-4 flex-wrap">
            <WorkflowNode icon="user" label="Request" sublabel="User asks" />
            <Arrow />
            <WorkflowNode icon="settings" label="Mayor" sublabel="Plans & dispatches" />
            <Arrow />
            <WorkflowNode icon="truck" label="Convoy" sublabel="Tracks batch" />
          </div>
        </PanelBody>
      </Panel>

      {/* Vertical connector with label */}
      <div className="flex flex-col items-center text-ash">
        <div className="w-px h-4 bg-chrome-border" />
        <span className="text-xs font-mono px-2 py-1 bg-gunmetal border border-chrome-border rounded-sm">
          gt sling
        </span>
        <div className="w-px h-4 bg-chrome-border" />
      </div>

      {/* Layer 2: Execution */}
      <Panel>
        <PanelHeader
          title="EXECUTION"
          actions={<span className="text-xs text-ash font-mono">per rig</span>}
        />
        <PanelBody>
          <div className="flex items-center justify-between gap-2 py-4 overflow-x-auto">
            <StageNode icon="clock" label="Queued" sublabel="Bead created" />
            <Arrow />
            <StageNode icon="lock" label="Hooked" sublabel="Polecat assigned" />
            <Arrow />
            <StageNode icon="terminal" label="Working" sublabel="Coding" active />
            <Arrow />
            <StageNode icon="link" label="PR Ready" sublabel="gt done" />
            <Arrow />
            <StageNode icon="cog" label="Refinery" sublabel="Merge queue" />
          </div>
        </PanelBody>
      </Panel>

      {/* Vertical connector */}
      <div className="flex justify-center">
        <div className="w-px h-8 bg-chrome-border" />
      </div>

      {/* Layer 3: Complete */}
      <Panel variant="inset">
        <div className="flex items-center justify-center gap-2 py-4">
          <Icon name="check-circle" aria-label="Merged" variant="ok" size="md" />
          <span className="text-acid-green font-mono text-lg">MERGED TO MAIN</span>
        </div>
      </Panel>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-ash mt-6">
        <span className="flex items-center gap-1">
          <Icon name="user" aria-label="" size="xs" />
          User
        </span>
        <span className="flex items-center gap-1">
          <Icon name="settings" aria-label="" size="xs" />
          Mayor
        </span>
        <span className="flex items-center gap-1">
          <Icon name="truck" aria-label="" size="xs" />
          Convoy
        </span>
        <span className="flex items-center gap-1">
          <Icon name="terminal" aria-label="" size="xs" />
          Polecat
        </span>
        <span className="flex items-center gap-1">
          <Icon name="cog" aria-label="" size="xs" />
          Refinery
        </span>
      </div>
    </div>
  );
}
