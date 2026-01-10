"use client";

import { useState, useMemo } from "react";
import { useBeads } from "@/hooks";
import { BeadsStatsGrid, BeadsFilterTabs, BeadsTree } from "@/components/beads";
import { Breadcrumb } from "@/components/layout";
import { Panel, PanelHeader, PanelBody } from "@/components/ui";
import type { BeadsFilter, Bead } from "@/lib/gastown";

export default function BeadsPage() {
  const [filter, setFilter] = useState<BeadsFilter>("all");
  const { data: beadsData, isLoading } = useBeads({
    refreshInterval: 30000,
  });

  // Derive stats from beadsData
  const stats = useMemo(() => {
    if (!beadsData) return null;
    return {
      total: beadsData.total,
      open: beadsData.open,
      in_progress: beadsData.in_progress,
      blocked: beadsData.blocked,
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

  // Separate HQ (town-level) beads from rig beads
  const hqBeads = useMemo(() =>
    filteredBeads.filter(b => b.id.startsWith("hq-")),
    [filteredBeads]
  );

  const rigBeads = useMemo(() =>
    filteredBeads.filter(b => !b.id.startsWith("hq-")),
    [filteredBeads]
  );

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

      {/* Town-level (HQ) Communications */}
      {hqBeads.length > 0 && (
        <Panel>
          <PanelHeader
            icon="radio"
            title="Gas Town Communications"
            actions={<span className="text-xs text-ash">{hqBeads.length} items</span>}
          />
          <PanelBody className="p-0">
            <BeadsTree beads={hqBeads} groupBy="status" />
          </PanelBody>
        </Panel>
      )}

      {/* Rig-level Issues organized by Epic */}
      {rigBeads.length > 0 && (
        <Panel>
          <PanelHeader
            icon="container"
            title="Rig Issues"
            actions={<span className="text-xs text-ash">{rigBeads.length} items</span>}
          />
          <PanelBody className="p-0">
            <BeadsTree beads={rigBeads} groupBy="epic" />
          </PanelBody>
        </Panel>
      )}

      {filteredBeads.length === 0 && (
        <Panel>
          <PanelBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-ash">No beads found matching filter</span>
            </div>
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}
