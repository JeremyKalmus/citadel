"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useConvoys, useConvoyBeads } from "@/hooks";
import { Breadcrumb } from "@/components/layout";
import { Panel, PanelHeader, PanelBody, StatusBadge, ActionButton, type Status } from "@/components/ui";
import { ConvoyJourneyCompact } from "@/components/journey";
import { CostSparkline } from "@/components/cost";
import { Icon } from "@/components/ui/icon";
import type { Convoy, Bead } from "@/lib/gastown";
import type { ConvoyJourneyState } from "@/lib/gastown/types";
import { JourneyStage } from "@/lib/gastown/types";
import { RefreshCw, ChevronDown, ChevronRight, Truck, Circle, ExternalLink } from "lucide-react";

type ConvoyFilter = "all" | "active" | "pending" | "done";

interface ConvoyStats {
  total: number;
  active: number;
  pending: number;
  done: number;
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

function deriveConvoyJourneyState(convoy: Convoy): ConvoyJourneyState {
  const status = convoy.status.toLowerCase();

  let stageDistribution: Record<JourneyStage, number> = {
    [JourneyStage.QUEUED]: 0,
    [JourneyStage.CLAIMED]: 0,
    [JourneyStage.WORKING]: 0,
    [JourneyStage.PR_READY]: 0,
    [JourneyStage.REFINERY]: 0,
    [JourneyStage.MERGED]: 0,
  };

  let progressPercent = 0;
  let completedCount = 0;
  const issueCount = 1;

  switch (status) {
    case "completed":
    case "done":
      stageDistribution[JourneyStage.MERGED] = 1;
      progressPercent = 100;
      completedCount = 1;
      break;
    case "active":
    case "running":
      stageDistribution[JourneyStage.WORKING] = 1;
      progressPercent = 50;
      break;
    case "pending":
    case "queued":
      stageDistribution[JourneyStage.QUEUED] = 1;
      progressPercent = 0;
      break;
    case "blocked":
      stageDistribution[JourneyStage.WORKING] = 1;
      progressPercent = 40;
      break;
    default:
      stageDistribution[JourneyStage.QUEUED] = 1;
      progressPercent = 0;
  }

  return {
    convoyId: convoy.id,
    title: convoy.title || convoy.id,
    progressPercent,
    issueCount,
    completedCount,
    stageDistribution,
    issues: [],
  };
}

// Stats summary component
function ConvoyStatsGrid({ stats, isLoading }: { stats: ConvoyStats | null; isLoading: boolean }) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gunmetal rounded-sm p-4 animate-pulse">
            <div className="h-8 bg-carbon-black/50 rounded w-16 mb-2" />
            <div className="h-4 bg-carbon-black/50 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    { label: "Total", value: stats.total, color: "text-bone" },
    { label: "Active", value: stats.active, color: "text-status-active" },
    { label: "Pending", value: stats.pending, color: "text-status-thinking" },
    { label: "Done", value: stats.done, color: "text-status-done" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="bg-gunmetal rounded-sm p-4 border border-chrome-border/30">
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-xs text-ash mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// Filter tabs component
function ConvoyFilterTabs({
  value,
  onChange
}: {
  value: ConvoyFilter;
  onChange: (filter: ConvoyFilter) => void;
}) {
  const tabs: { value: ConvoyFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "done", label: "Done" },
  ];

  return (
    <div className="flex gap-1 p-1 bg-gunmetal rounded-sm border border-chrome-border/30">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
            value === tab.value
              ? "bg-carbon-black text-bone"
              : "text-ash hover:text-bone"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Beads summary for expanded row
interface BeadsSummary {
  total: number;
  active: number;
  blocked: number;
  done: number;
}

function calculateBeadsSummary(beads: Bead[]): BeadsSummary {
  const summary: BeadsSummary = {
    total: beads.length,
    active: 0,
    blocked: 0,
    done: 0,
  };

  for (const bead of beads) {
    switch (bead.status.toLowerCase()) {
      case "in_progress":
      case "hooked":
        summary.active++;
        break;
      case "blocked":
        summary.blocked++;
        break;
      case "closed":
      case "completed":
      case "done":
        summary.done++;
        break;
    }
  }

  return summary;
}

// Expandable convoy row component
function ConvoyRow({ convoy, isExpanded, onToggle }: {
  convoy: Convoy;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { data: beads, isLoading: beadsLoading } = useConvoyBeads({
    convoyId: convoy.id,
    refreshInterval: isExpanded ? 30000 : 0, // Only refresh when expanded
  });

  const journeyState = deriveConvoyJourneyState(convoy);
  const beadsSummary = beads ? calculateBeadsSummary(beads) : null;

  return (
    <div className="border-b border-chrome-border/30 last:border-0">
      {/* Main row - clickable to expand */}
      <div
        className="flex items-center justify-between px-4 py-3 hover:bg-carbon-black/30 transition-mechanical cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            className="p-0.5 hover:bg-gunmetal rounded-sm transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-ash" />
            ) : (
              <ChevronRight className="w-4 h-4 text-ash" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-bone truncate">
                {convoy.title || convoy.id}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-ash font-mono">{convoy.id}</span>
              <span className="text-xs text-ash">{formatDate(convoy.created_at)}</span>
              <ConvoyJourneyCompact convoy={journeyState} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {beadsSummary && beadsSummary.total > 0 && (
            <div className="flex items-center gap-2 text-[10px]">
              {beadsSummary.active > 0 && (
                <span className="flex items-center gap-0.5 text-status-active">
                  <Circle className="w-1.5 h-1.5 fill-current" />
                  {beadsSummary.active}
                </span>
              )}
              {beadsSummary.blocked > 0 && (
                <span className="flex items-center gap-0.5 text-status-blocked">
                  <Circle className="w-1.5 h-1.5 fill-current" />
                  {beadsSummary.blocked}
                </span>
              )}
              <span className="text-ash">
                {beadsSummary.done}/{beadsSummary.total}
              </span>
            </div>
          )}
          <StatusBadge status={mapConvoyStatusToStatus(convoy.status)} size="sm" />
        </div>
      </div>

      {/* Expanded details panel */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 bg-carbon-black/20 border-t border-chrome-border/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Beads summary */}
            <div className="bg-gunmetal/50 rounded-sm p-3 border border-chrome-border/20">
              <h4 className="text-xs font-medium text-ash mb-2">Issues</h4>
              {beadsLoading ? (
                <span className="text-xs text-ash">Loading...</span>
              ) : beads && beads.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-ash">Total</span>
                    <span className="text-bone">{beadsSummary?.total ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ash">Active</span>
                    <span className="text-status-active">{beadsSummary?.active ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ash">Blocked</span>
                    <span className="text-status-blocked">{beadsSummary?.blocked ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ash">Done</span>
                    <span className="text-status-done">{beadsSummary?.done ?? 0}</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-ash">No issues linked</span>
              )}
            </div>

            {/* Journey progress */}
            <div className="bg-gunmetal/50 rounded-sm p-3 border border-chrome-border/20">
              <h4 className="text-xs font-medium text-ash mb-2">Progress</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ash">Status</span>
                  <span className="text-bone capitalize">{convoy.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ash">Completion</span>
                  <span className="text-bone">{journeyState.progressPercent}%</span>
                </div>
                <div className="w-full bg-carbon-black rounded-full h-2 mt-2">
                  <div
                    className="bg-status-active h-2 rounded-full transition-all"
                    style={{ width: `${journeyState.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-gunmetal/50 rounded-sm p-3 border border-chrome-border/20">
              <h4 className="text-xs font-medium text-ash mb-2">Actions</h4>
              <Link href={`/convoy/${encodeURIComponent(convoy.id)}`}>
                <ActionButton
                  variant="ghost"
                  icon={<ExternalLink className="w-3 h-3" />}
                  className="w-full justify-center text-xs"
                >
                  View Details
                </ActionButton>
              </Link>
            </div>
          </div>

          {/* Beads list preview */}
          {beads && beads.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-ash mb-2">Issues ({beads.length})</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {beads.slice(0, 5).map((bead) => (
                  <Link
                    key={bead.id}
                    href={`/bead/${encodeURIComponent(bead.id)}`}
                    className="flex items-center justify-between px-2 py-1.5 hover:bg-gunmetal/30 rounded-sm transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-ash">{bead.id}</span>
                      <span className="text-xs text-bone truncate">{bead.title}</span>
                    </div>
                    <StatusBadge
                      status={mapConvoyStatusToStatus(bead.status)}
                      size="sm"
                    />
                  </Link>
                ))}
                {beads.length > 5 && (
                  <div className="text-xs text-ash text-center py-1">
                    +{beads.length - 5} more issues
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ConvoysPage() {
  const [filter, setFilter] = useState<ConvoyFilter>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: convoys, isLoading, refresh } = useConvoys({ refreshInterval: 30000 });

  // Calculate stats
  const stats = useMemo<ConvoyStats | null>(() => {
    if (!convoys) return null;

    return convoys.reduce(
      (acc, convoy) => {
        acc.total++;
        const status = convoy.status.toLowerCase();
        if (status === "active" || status === "running") {
          acc.active++;
        } else if (status === "pending" || status === "queued") {
          acc.pending++;
        } else if (status === "completed" || status === "done") {
          acc.done++;
        }
        return acc;
      },
      { total: 0, active: 0, pending: 0, done: 0 }
    );
  }, [convoys]);

  // Filter convoys
  const filteredConvoys = useMemo(() => {
    if (!convoys) return [];
    if (filter === "all") return convoys;

    return convoys.filter((convoy) => {
      const status = convoy.status.toLowerCase();
      switch (filter) {
        case "active":
          return status === "active" || status === "running";
        case "pending":
          return status === "pending" || status === "queued";
        case "done":
          return status === "completed" || status === "done";
        default:
          return true;
      }
    });
  }, [convoys, filter]);

  // Toggle expand/collapse
  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Convoys", href: "/convoys" }]} />

      {/* Header with title and refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-bone">Convoys</h1>
          <p className="body-text-muted mt-1 hidden sm:block">
            Work batches and their pipeline progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConvoyFilterTabs value={filter} onChange={setFilter} />
          <ActionButton
            variant="ghost"
            onClick={() => refresh()}
            loading={isLoading}
            icon={<RefreshCw className="w-4 h-4" />}
            className="shrink-0"
          >
            <span className="hidden sm:inline">Refresh</span>
          </ActionButton>
        </div>
      </div>

      {/* Stats grid */}
      <ConvoyStatsGrid stats={stats} isLoading={isLoading} />

      {/* Convoys list */}
      <Panel>
        <PanelHeader
          icon="truck"
          title="Work Pipeline"
          actions={
            <span className="text-xs text-ash">
              {filteredConvoys.length} convoy{filteredConvoys.length !== 1 ? "s" : ""}
              {filter !== "all" && ` (${filter})`}
            </span>
          }
        />
        <PanelBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-ash">Loading convoys...</span>
            </div>
          ) : filteredConvoys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Truck className="w-8 h-8 text-ash mb-2" />
              <span className="text-ash">
                {filter === "all" ? "No convoys found" : `No ${filter} convoys`}
              </span>
            </div>
          ) : (
            <div className="divide-y divide-chrome-border/30">
              {filteredConvoys.map((convoy) => (
                <ConvoyRow
                  key={convoy.id}
                  convoy={convoy}
                  isExpanded={expandedIds.has(convoy.id)}
                  onToggle={() => toggleExpanded(convoy.id)}
                />
              ))}
            </div>
          )}
        </PanelBody>
      </Panel>
    </div>
  );
}
