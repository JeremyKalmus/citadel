"use client";

import Link from "next/link";
import { Panel, PanelHeader, PanelBody, StatusBadge, SkeletonRow, type Status } from "@/components/ui";
import type { Rig } from "@/lib/gastown";
import { Container, ChevronRight } from "lucide-react";

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
    <span className={`text-xs ${colorClass}`} title={tooltip}>
      {label}
    </span>
  );
}

interface RigListProps {
  rigs: Rig[];
  isLoading?: boolean;
}

function getRigStatus(rig: Rig): Status {
  // Determine rig status based on agents and workers
  const hasActivePolecats = rig.agents?.some(
    (a) => a.role === "polecat" && a.running
  );

  if (!rig.has_witness && !rig.has_refinery) {
    return "unresponsive";
  }

  if (hasActivePolecats) {
    return "active";
  }

  if (rig.polecat_count > 0) {
    return "thinking";
  }

  return "slow";
}

export function RigList({ rigs, isLoading }: RigListProps) {
  if (isLoading) {
    return (
      <Panel>
        <PanelHeader icon="container" title="Rigs" />
        <PanelBody className="p-0">
          <div className="px-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        </PanelBody>
      </Panel>
    );
  }

  if (!rigs || rigs.length === 0) {
    return (
      <Panel>
        <PanelHeader icon="container" title="Rigs" />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Container className="w-8 h-8 text-ash mb-2" />
            <span className="text-ash">No rigs found</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHeader
        icon="container"
        title="Rigs"
        actions={
          <span className="text-xs text-ash">{rigs.length} total</span>
        }
      />
      <PanelBody className="p-0">
        <div className="divide-y divide-chrome-border/50">
          {rigs.map((rig) => (
            <Link
              key={rig.name}
              href={`/rig/${encodeURIComponent(rig.name)}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-carbon-black/30 transition-mechanical group"
            >
              <div className="flex items-center gap-3">
                <Container className="w-5 h-5 text-ash" />
                <div>
                  <span className="font-mono text-sm text-bone group-hover:text-fuel-yellow transition-mechanical">
                    {rig.name}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-ash">
                      {rig.polecat_count} workers
                    </span>
                    {rig.crew_count > 0 && (
                      <span className="text-xs text-ash">
                        {rig.crew_count} crews
                      </span>
                    )}
                    {rig.has_witness && (
                      <InfraAgentLabel
                        label="witness"
                        isRunning={isAgentRunning(rig, "witness")}
                      />
                    )}
                    {rig.has_refinery && (
                      <InfraAgentLabel
                        label="refinery"
                        isRunning={isAgentRunning(rig, "refinery")}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={getRigStatus(rig)} size="sm" />
                <ChevronRight className="w-4 h-4 text-ash group-hover:text-bone transition-mechanical" />
              </div>
            </Link>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
