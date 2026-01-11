"use client";

import { useState, useMemo } from "react";
import { useBeads } from "@/hooks";
import { BeadsStatsGrid, BeadsFilterTabs, BeadsTree } from "@/components/beads";
import { Breadcrumb } from "@/components/layout";
import { Panel, PanelHeader, PanelBody } from "@/components/ui";
import type { BeadsFilter, Bead } from "@/lib/gastown";

export default function BeadsPage() {
  const [filter, setFilter] = useState<BeadsFilter>("all");

  // Fetch beads from both HQ and citadel rig
  const { data: hqBeadsData, isLoading: hqLoading } = useBeads({
    refreshInterval: 30000,
  });
  const { data: rigBeadsData, isLoading: rigLoading } = useBeads({
    rig: "citadel/mayor/rig",
    refreshInterval: 30000,
  });

  const isLoading = hqLoading || rigLoading;

  // Combine beads from all sources
  const beadsData = useMemo(() => {
    const allBeads: Bead[] = [
      ...(hqBeadsData?.beads || []),
      ...(rigBeadsData?.beads || []),
    ];
    return {
      beads: allBeads,
      total: allBeads.length,
      open: (hqBeadsData?.open || 0) + (rigBeadsData?.open || 0),
      in_progress: (hqBeadsData?.in_progress || 0) + (rigBeadsData?.in_progress || 0),
      blocked: (hqBeadsData?.blocked || 0) + (rigBeadsData?.blocked || 0),
    };
  }, [hqBeadsData, rigBeadsData]);

  // Derive stats from beadsData
  const stats = useMemo(() => {
    if (!beadsData) return null;
    const closedCount = beadsData.beads.filter(b => b.status === "closed").length;
    const readyCount = beadsData.beads.filter(b =>
      b.status === "open" && (!b.depends_on || b.depends_on.length === 0)
    ).length;
    return {
      summary: {
        total_issues: beadsData.total,
        open_issues: beadsData.open,
        in_progress_issues: beadsData.in_progress,
        ready_issues: readyCount,
        blocked_issues: beadsData.blocked,
        closed_issues: closedCount,
      }
    };
  }, [beadsData]);

  // Filter beads based on selected filter
  const filteredBeads = useMemo((): Bead[] => {
    if (!beadsData?.beads) return [];

    switch (filter) {
      case "open":
        return beadsData.beads.filter(b => b.status === "open");
      case "in_progress":
        return beadsData.beads.filter(b => b.status === "in_progress" || b.status === "hooked");
      case "blocked":
        return beadsData.beads.filter(b => b.depends_on && b.depends_on.length > 0);
      case "closed":
        return beadsData.beads.filter(b => b.status === "closed");
      case "all":
      default:
        return beadsData.beads;
    }
  }, [beadsData, filter]);

  // Filter to only show actual work beads (tasks, bugs, features, epics)
  // Exclude system beads: agents, roles, molecules, messages, convoys
  const WORK_TYPES = ["task", "bug", "feature", "epic"];

  const workBeads = useMemo(() =>
    filteredBeads.filter(b => WORK_TYPES.includes(b.type?.toLowerCase() || "")),
    [filteredBeads]
  );

  // Separate by rig prefix for organization
  const rigGroups = useMemo(() => {
    const groups: Record<string, typeof workBeads> = {};
    for (const bead of workBeads) {
      // Extract rig prefix (e.g., "ci" from "ci-123")
      const prefix = bead.id.split("-")[0];
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(bead);
    }
    return groups;
  }, [workBeads]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Beads", href: "/beads" }]} />
        <div className="flex items-center justify-center py-12">
          <span className="text-ash">Loading beads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Beads", href: "/beads" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-bone">Issue Tracker</h1>
        <BeadsFilterTabs value={filter} onChange={setFilter} />
      </div>

      <BeadsStatsGrid stats={stats} isLoading={isLoading} />

      {/* Work items organized by rig, then by epic */}
      {Object.entries(rigGroups).map(([prefix, beads]) => (
        <Panel key={prefix}>
          <PanelHeader
            icon="container"
            title={prefix === "hq" ? "Town-Level Work" : `${prefix.toUpperCase()} Issues`}
            actions={<span className="text-xs text-ash">{beads.length} items</span>}
          />
          <PanelBody className="p-0">
            <BeadsTree beads={beads} groupBy="epic" />
          </PanelBody>
        </Panel>
      ))}

      {workBeads.length === 0 && (
        <Panel>
          <PanelBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-ash">No work items found matching filter</span>
              <span className="text-xs text-ash mt-1">
                Only showing tasks, bugs, features, and epics
              </span>
            </div>
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}
