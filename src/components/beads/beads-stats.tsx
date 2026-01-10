"use client";

import { Panel } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import type { BeadsStats } from "@/lib/gastown";

interface BeadsStatsGridProps {
  stats: BeadsStats | null;
  isLoading?: boolean;
}

interface StatCardProps {
  label: string;
  value: number | string;
  variant?: "default" | "success" | "warning" | "danger";
  loading?: boolean;
}

function StatCard({ label, value, variant = "default", loading }: StatCardProps) {
  const variantStyles = {
    default: "text-bone",
    success: "text-acid-green",
    warning: "text-fuel-yellow",
    danger: "text-rust-orange",
  };

  return (
    <Panel className="p-4">
      <p className="section-header text-ash">{label}</p>
      <p className={`text-2xl font-mono font-bold mt-1 ${variantStyles[variant]}`}>
        {loading ? "—" : value}
      </p>
    </Panel>
  );
}

export function BeadsStatsGrid({ stats, isLoading }: BeadsStatsGridProps) {
  const summary = stats?.summary;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <StatCard
        label="Total"
        value={summary?.total_issues ?? 0}
        loading={isLoading}
      />
      <StatCard
        label="Open"
        value={summary?.open_issues ?? 0}
        variant="warning"
        loading={isLoading}
      />
      <StatCard
        label="In Progress"
        value={summary?.in_progress_issues ?? 0}
        variant="success"
        loading={isLoading}
      />
      <StatCard
        label="Ready"
        value={summary?.ready_issues ?? 0}
        loading={isLoading}
      />
      <StatCard
        label="Blocked"
        value={summary?.blocked_issues ?? 0}
        variant="danger"
        loading={isLoading}
      />
      <StatCard
        label="Closed"
        value={summary?.closed_issues ?? 0}
        loading={isLoading}
      />
    </div>
  );
}

interface BeadsStatsCompactProps {
  stats: BeadsStats | null;
  isLoading?: boolean;
}

export function BeadsStatsCompact({ stats, isLoading }: BeadsStatsCompactProps) {
  const summary = stats?.summary;

  if (isLoading) {
    return <span className="text-ash text-sm">Loading stats...</span>;
  }

  return (
    <div className="flex items-center gap-4 text-xs">
      <span className="flex items-center gap-1">
        <Icon name="activity" aria-label="Open" size="xs" variant="muted" />
        <span className="text-fuel-yellow">{summary?.open_issues ?? 0}</span>
        <span className="text-ash">open</span>
      </span>
      <span className="flex items-center gap-1">
        <Icon name="play-circle" aria-label="In Progress" size="xs" variant="muted" />
        <span className="text-acid-green">{summary?.in_progress_issues ?? 0}</span>
        <span className="text-ash">active</span>
      </span>
      <span className="flex items-center gap-1">
        <Icon name="lock" aria-label="Blocked" size="xs" variant="muted" />
        <span className="text-rust-orange">{summary?.blocked_issues ?? 0}</span>
        <span className="text-ash">blocked</span>
      </span>
    </div>
  );
}
