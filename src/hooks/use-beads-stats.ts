"use client";

import { useState, useEffect, useCallback } from "react";
import type { BeadsStats } from "@/lib/gastown";

export interface UseBeadsStatsOptions {
  rig?: string;
  refreshInterval?: number;
}

export interface UseBeadsStatsResult {
  data: BeadsStats | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useBeadsStats(options: UseBeadsStatsOptions = {}): UseBeadsStatsResult {
  const { rig, refreshInterval } = options;
  const [data, setData] = useState<BeadsStats | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const url = rig
        ? `/api/gastown/beads?rig=${encodeURIComponent(rig)}`
        : "/api/gastown/beads";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Derive stats from beads data
      const beads = result.beads || [];
      const stats: BeadsStats = {
        summary: {
          total_issues: beads.length,
          open_issues: beads.filter((b: { status: string }) => b.status === 'open').length,
          in_progress_issues: beads.filter((b: { status: string }) => b.status === 'in_progress' || b.status === 'hooked').length,
          ready_issues: beads.filter((b: { status: string; depends_on?: string[] }) =>
            b.status === 'open' && (!b.depends_on || b.depends_on.length === 0)
          ).length,
          blocked_issues: beads.filter((b: { status: string }) => b.status === 'blocked').length,
          closed_issues: beads.filter((b: { status: string }) => b.status === 'closed').length,
        }
      };

      setData(stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [rig]);

  useEffect(() => {
    fetchData();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, error, isLoading, refresh: fetchData };
}
