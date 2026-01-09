"use client";

import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui";
import type { Convoy } from "@/lib/gastown";
import { Truck } from "lucide-react";

interface ConvoyListProps {
  convoys: Convoy[];
  isLoading?: boolean;
}

function mapConvoyStatusToStatus(status: string): Status {
  switch (status.toLowerCase()) {
    case "active":
    case "running":
      return "active";
    case "pending":
    case "queued":
      return "thinking";
    case "blocked":
      return "blocked";
    case "completed":
    case "done":
      return "done";
    case "failed":
    case "error":
      return "dead";
    default:
      return "thinking";
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function ConvoyList({ convoys, isLoading }: ConvoyListProps) {
  if (isLoading) {
    return (
      <Panel>
        <PanelHeader icon="truck" title="Convoys" />
        <PanelBody>
          <div className="flex items-center justify-center py-8">
            <span className="text-ash">Loading convoys...</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  if (!convoys || convoys.length === 0) {
    return (
      <Panel>
        <PanelHeader icon="truck" title="Convoys" />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Truck className="w-8 h-8 text-ash mb-2" />
            <span className="text-ash">No active convoys</span>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  const activeCount = convoys.filter(
    (c) => c.status.toLowerCase() === "active"
  ).length;

  return (
    <Panel>
      <PanelHeader
        icon="truck"
        title="Convoys"
        actions={
          <span className="text-xs text-ash">
            {activeCount} active / {convoys.length} total
          </span>
        }
      />
      <PanelBody className="p-0">
        <div className="divide-y divide-chrome-border/50">
          {convoys.map((convoy) => (
            <div
              key={convoy.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-carbon-black/30 transition-mechanical"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-bone truncate">
                    {convoy.title || convoy.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-ash font-mono">
                    {convoy.id}
                  </span>
                  <span className="text-xs text-ash">
                    {formatDate(convoy.created_at)}
                  </span>
                </div>
              </div>
              <StatusBadge
                status={mapConvoyStatusToStatus(convoy.status)}
                size="sm"
              />
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}
