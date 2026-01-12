"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTownStatus } from "@/hooks";
import { BeadsStatsGrid, BeadsFilterTabs, BeadsTree, BeadDetailModal } from "@/components/beads";
import { Breadcrumb } from "@/components/layout";
import { Panel, PanelHeader, PanelBody } from "@/components/ui";
import type { BeadsFilter, Bead, BeadsData } from "@/lib/gastown";
import { WORK_ITEM_TYPES } from "@/lib/bead-types";

interface RigBeadsData {
  rigName: string;
  beads: BeadsData;
}

export default function BeadsPage() {
  const [filter, setFilter] = useState<BeadsFilter>("all");
  const [rigBeadsMap, setRigBeadsMap] = useState<RigBeadsData[]>([]);
  const [beadsLoading, setBeadsLoading] = useState(true);
  const [selectedBead, setSelectedBead] = useState<Bead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Handle bead selection - open modal
  const handleBeadSelect = useCallback((bead: Bead) => {
    setSelectedBead(bead);
    setModalOpen(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    // Clear selected bead after animation
    setTimeout(() => setSelectedBead(null), 200);
  }, []);

  // Fetch town status to discover rigs dynamically
  const { data: townStatus, isLoading: statusLoading } = useTownStatus({
    refreshInterval: 30000,
  });

  // Fetch beads for rig-level work only (excludes HQ/town-level)
  // Town-level beads are shown on the Town Mail page (/mail)
  const fetchAllBeads = useCallback(async (rigNames: string[]) => {
    setBeadsLoading(true);

    // Only fetch rig-level beads (NOT HQ - those go to Town Mail)
    const fetchPromises: Promise<RigBeadsData>[] = [];

    for (const rigName of rigNames) {
      fetchPromises.push(
        fetch(`/api/gastown/beads?rig=${encodeURIComponent(rigName)}`)
          .then(res => res.ok ? res.json() : { beads: [], total: 0, open: 0, in_progress: 0, blocked: 0 })
          .then(data => ({ rigName, beads: data }))
          .catch(() => ({ rigName, beads: { beads: [], total: 0, open: 0, in_progress: 0, blocked: 0 } }))
      );
    }

    const results = await Promise.all(fetchPromises);
    setRigBeadsMap(results.filter(r => r.beads.beads.length > 0));
    setBeadsLoading(false);
  }, []);

  // When town status loads, fetch beads for all rigs
  useEffect(() => {
    if (townStatus?.rigs && townStatus.rigs.length > 0) {
      const rigNames = townStatus.rigs.map(r => r.name);
      fetchAllBeads(rigNames);
    } else if (!statusLoading) {
      // No rigs found - nothing to fetch (HQ beads go to Town Mail)
      setBeadsLoading(false);
    }
  }, [townStatus, statusLoading, fetchAllBeads]);

  const isLoading = statusLoading || beadsLoading;

  // Combine beads from all rigs
  const beadsData = useMemo(() => {
    const allBeads: Bead[] = [];
    let open = 0;
    let in_progress = 0;
    let blocked = 0;

    for (const rigData of rigBeadsMap) {
      allBeads.push(...(rigData.beads.beads || []));
      open += rigData.beads.open || 0;
      in_progress += rigData.beads.in_progress || 0;
      blocked += rigData.beads.blocked || 0;
    }

    return {
      beads: allBeads,
      total: allBeads.length,
      open,
      in_progress,
      blocked,
    };
  }, [rigBeadsMap]);

  // Derive stats from filtered work beads (matching BeadsStats.summary format)
  const stats = useMemo(() => {
    // Get all work beads across all rigs (filtered to work types)
    const allWorkBeads: Bead[] = [];
    for (const rigData of rigBeadsMap) {
      const workBeads = (rigData.beads.beads || []).filter(b =>
        WORK_ITEM_TYPES.includes(b.issue_type?.toLowerCase() as typeof WORK_ITEM_TYPES[number])
      );
      allWorkBeads.push(...workBeads);
    }

    if (allWorkBeads.length === 0) return null;

    // Calculate stats from actual beads
    let open = 0;
    let in_progress = 0;
    let blocked = 0;
    let closed = 0;

    for (const bead of allWorkBeads) {
      const status = bead.status?.toLowerCase() || "";
      const hasBlockers = (bead.depends_on?.length ?? 0) > 0;

      if (status === "closed" || status === "done") {
        closed++;
      } else if (status === "in_progress" || status === "hooked") {
        in_progress++;
      } else if (status === "open") {
        open++;
      }

      // Count blocked separately (beads with unresolved dependencies)
      if (hasBlockers && status !== "closed" && status !== "done") {
        blocked++;
      }
    }

    // Ready = open with no blocking dependencies
    const ready = allWorkBeads.filter(b =>
      b.status === "open" && (!b.depends_on || b.depends_on.length === 0)
    ).length;

    return {
      summary: {
        total_issues: allWorkBeads.length,
        open_issues: open,
        in_progress_issues: in_progress,
        ready_issues: ready,
        blocked_issues: blocked,
        closed_issues: closed,
      }
    };
  }, [rigBeadsMap]);

  // Filter to only show actual work beads (tasks, bugs, features, epics)
  // Exclude system beads and communications (mail, handoff, message, convoy)
  // Communication types are shown on the Town Mail page (/mail)

  // Apply status filter to beads per rig, preserving rig grouping
  const filteredRigBeads = useMemo(() => {
    return rigBeadsMap.map(rigData => {
      let beads = rigData.beads.beads || [];

      // Apply status filter
      switch (filter) {
        case "open":
          beads = beads.filter(b => b.status === "open");
          break;
        case "in_progress":
          beads = beads.filter(b => b.status === "in_progress" || b.status === "hooked");
          break;
        case "ready":
          // Ready = open with no blocking dependencies
          beads = beads.filter(b => b.status === "open" && (!b.depends_on || b.depends_on.length === 0));
          break;
        case "blocked":
          beads = beads.filter(b => b.depends_on && b.depends_on.length > 0);
          break;
        case "closed":
          beads = beads.filter(b => b.status === "closed");
          break;
      }

      // Filter to work types only (excludes communications shown on /mail)
      beads = beads.filter(b =>
        WORK_ITEM_TYPES.includes(b.issue_type?.toLowerCase() as typeof WORK_ITEM_TYPES[number])
      );

      return {
        rigName: rigData.rigName,
        beads,
      };
    }).filter(r => r.beads.length > 0);
  }, [rigBeadsMap, filter]);

  // Total work beads count for empty state
  const totalWorkBeads = useMemo(() =>
    filteredRigBeads.reduce((sum, r) => sum + r.beads.length, 0),
    [filteredRigBeads]
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
        <h1 className="text-2xl font-bold text-bone">Work Items</h1>
        <BeadsFilterTabs value={filter} onChange={setFilter} />
      </div>

      <BeadsStatsGrid stats={stats} isLoading={isLoading} />

      {/* Work items organized by rig, then by epic */}
      {filteredRigBeads.map(({ rigName, beads }) => (
        <Panel key={rigName}>
          <PanelHeader
            icon="container"
            title={rigName === "hq" ? "Town-Level Work" : `${rigName} Issues`}
            actions={<span className="text-xs text-ash">{beads.length} items</span>}
          />
          <PanelBody className="p-0">
            <BeadsTree
              beads={beads}
              groupBy="epic"
              onBeadSelect={handleBeadSelect}
              selectedBeadId={selectedBead?.id}
            />
          </PanelBody>
        </Panel>
      ))}

      {totalWorkBeads === 0 && (
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

      {/* Bead Detail Modal */}
      <BeadDetailModal
        bead={selectedBead}
        open={modalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}
