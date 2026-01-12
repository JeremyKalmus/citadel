"use client";

import { StatusBadge, type Status } from "@/components/ui";

type AgentType = "witness" | "refinery" | "deacon";

interface InfraAgentStatusProps {
  /** Type of infrastructure agent */
  agentType: AgentType;
  /** Whether the agent is currently running */
  isRunning: boolean;
  /** Size of the status badge */
  size?: "sm" | "md";
}

const agentLabels: Record<AgentType, string> = {
  witness: "Witness",
  refinery: "Refinery",
  deacon: "Deacon",
};

/**
 * InfraAgentStatus - Shows infrastructure agent status with recovery tooltip
 *
 * Displays running agents with green "Running" status.
 * Displays stopped agents with red "Stopped" status and a tooltip
 * explaining how to start the agent with `gt prime`.
 */
export function InfraAgentStatus({ agentType, isRunning, size = "sm" }: InfraAgentStatusProps) {
  const status: Status = isRunning ? "active" : "stopped";
  const tooltip = isRunning
    ? `${agentLabels[agentType]} is running`
    : `${agentLabels[agentType]} stopped. Run 'gt prime' to start infrastructure agents`;

  return (
    <span title={tooltip}>
      <StatusBadge status={status} size={size} />
    </span>
  );
}
