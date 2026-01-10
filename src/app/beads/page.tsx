"use client";

import { useState } from "react";
import { useBeads, useBeadsStats } from "@/hooks";
import { BeadsStatsGrid, BeadsFilterTabs, BeadsTable } from "@/components/beads";
import { Breadcrumb } from "@/components/layout";
import type { BeadsFilter } from "@/lib/gastown";

export default function BeadsPage() {
  const [filter, setFilter] = useState<BeadsFilter>("open");
  const { data: beads, isLoading: beadsLoading } = useBeads({
    filter,
    refreshInterval: 30000,
  });
  const { data: stats, isLoading: statsLoading } = useBeadsStats({
    refreshInterval: 30000,
  });

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

      <BeadsStatsGrid stats={stats} isLoading={statsLoading} />

      <BeadsTable beads={beads} isLoading={beadsLoading} />
    </div>
  );
}
