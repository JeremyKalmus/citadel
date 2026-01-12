"use client"

import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui"
import { Icon } from "@/components/ui/icon"
import type { Rig } from "@/lib/gastown"

interface RigListProps {
  rigs: Rig[] | undefined
  loading?: boolean
}

/** Helper to check if an infrastructure agent is running */
function isAgentRunning(rig: Rig, role: "witness" | "refinery"): boolean {
  return rig.agents?.some((a) => a.role === role && a.running) ?? false;
}

/** InfraAgentLabel - Shows agent name with color and tooltip based on running state */
function InfraAgentLabel({
  label,
  isRunning,
}: {
  label: string;
  isRunning: boolean;
}) {
  const tooltip = isRunning
    ? `${label} is running`
    : `${label} stopped. Run 'gt prime' to start infrastructure agents`;
  const colorClass = isRunning ? "text-acid-green" : "text-status-dead";

  return (
    <span className={colorClass} title={tooltip}>
      {" • "}{label}
    </span>
  );
}

function getRigStatus(rig: Rig): Status {
  const activeAgents = rig.agents?.filter(a => a.running).length ?? 0
  const totalAgents = rig.agents?.length ?? 0

  if (totalAgents === 0) return "done"
  if (activeAgents === 0) return "unresponsive"
  if (activeAgents < totalAgents) return "slow"
  return "active"
}

interface RigRowProps {
  rig: Rig
}

function RigRow({ rig }: RigRowProps) {
  const status = getRigStatus(rig)
  const activePolecats = rig.agents?.filter(a => a.role === "polecat" && a.running).length ?? 0

  return (
    <div className="flex items-center justify-between py-3 border-b border-chrome-border/30 last:border-0">
      <div className="flex items-center gap-3">
        <Icon name="container" aria-label="" variant="muted" size="md" />
        <div>
          <p className="body-text font-medium">{rig.name}</p>
          <p className="caption text-ash">
            {rig.polecat_count} polecat{rig.polecat_count !== 1 ? "s" : ""}
            {rig.has_witness && (
              <InfraAgentLabel label="witness" isRunning={isAgentRunning(rig, "witness")} />
            )}
            {rig.has_refinery && (
              <InfraAgentLabel label="refinery" isRunning={isAgentRunning(rig, "refinery")} />
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="caption text-ash">
          {activePolecats} active
        </span>
        <StatusBadge status={status} size="sm" />
      </div>
    </div>
  )
}

export function RigList({ rigs, loading = false }: RigListProps) {
  return (
    <Panel>
      <PanelHeader
        icon="truck"
        title="Rigs"
        actions={
          <span className="caption text-ash">
            {loading ? "—" : `${rigs?.length ?? 0} total`}
          </span>
        }
      />
      <PanelBody className="p-0">
        {loading ? (
          <div className="p-4 text-center">
            <p className="caption text-ash">Loading...</p>
          </div>
        ) : !rigs || rigs.length === 0 ? (
          <div className="p-4 text-center">
            <p className="caption text-ash">No rigs found</p>
          </div>
        ) : (
          <div className="px-4">
            {rigs.map((rig) => (
              <RigRow key={rig.name} rig={rig} />
            ))}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
