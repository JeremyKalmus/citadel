"use client";

import { useState, useMemo } from "react";
import { useBeads } from "@/hooks";
import { BeadsStatsGrid, BeadsFilterTabs, BeadsTable } from "@/components/beads";
import { Breadcrumb } from "@/components/layout";
import type { BeadsFilter, Bead } from "@/lib/gastown";

export default function BeadsPage() {
  const [filter, setFilter] = useState<BeadsFilter>("open");
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
  const filteredBeads = useMemo((): Bead[] | null => {
    if (!beadsData?.beads) return null;

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

      <BeadsTable beads={filteredBeads} isLoading={isLoading} />
    </div>
  );
}
