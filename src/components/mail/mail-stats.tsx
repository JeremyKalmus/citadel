"use client";

import { Panel } from "@/components/ui";

interface MailStats {
  total: number;
  recent: number;    // Items from last 24 hours
  pending: number;   // Items requiring action (hooked/open)
  fromMayor: number;
  fromWitness: number;
  fromDeacon: number;
  stale: number;     // Items older than 7 days
}

interface MailStatsGridProps {
  stats: MailStats | null;
  isLoading?: boolean;
}

interface StatCardProps {
  label: string;
  value: number | string;
  variant?: "default" | "success" | "warning" | "danger" | "muted";
  loading?: boolean;
}

function StatCard({ label, value, variant = "default", loading }: StatCardProps) {
  const variantStyles = {
    default: "text-bone",
    success: "text-acid-green",
    warning: "text-fuel-yellow",
    danger: "text-rust-orange",
    muted: "text-ash",
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

export function MailStatsGrid({ stats, isLoading }: MailStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="Total Mail"
        value={stats?.total ?? 0}
        loading={isLoading}
      />
      <StatCard
        label="Recent (24h)"
        value={stats?.recent ?? 0}
        variant="success"
        loading={isLoading}
      />
      <StatCard
        label="Pending"
        value={stats?.pending ?? 0}
        variant="warning"
        loading={isLoading}
      />
      <StatCard
        label="From Mayor"
        value={stats?.fromMayor ?? 0}
        loading={isLoading}
      />
      <StatCard
        label="From Witness"
        value={stats?.fromWitness ?? 0}
        loading={isLoading}
      />
      <StatCard
        label="Stale (7d+)"
        value={stats?.stale ?? 0}
        variant="muted"
        loading={isLoading}
      />
    </div>
  );
}

export type { MailStats, MailStatsGridProps };
