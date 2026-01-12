"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Bead } from "@/lib/gastown";
import { type EpicProgress, calculateEpicProgress } from "@/lib/gastown/types";

export interface UseEpicChildrenOptions {
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
}

export interface UseEpicChildrenResult {
  /** Child beads of the epic */
  children: Bead[];
  /** Calculated progress stats */
  progress: EpicProgress;
  /** Any error that occurred */
  error: Error | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Refresh function */
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch children of an epic
 *
 * Uses the API endpoint: GET /api/gastown/bead/{id}/children
 * Which internally calls: bd list --parent <epicId>
 *
 * @param epicId - The ID of the epic to fetch children for
 * @param options - Configuration options
 * @returns Children beads and progress stats
 *
 * @example
 * ```tsx
 * const { children, progress, isLoading } = useEpicChildren("beads-epic-001");
 * ```
 */
export function useEpicChildren(
  epicId: string,
  options: UseEpicChildrenOptions = {}
): UseEpicChildrenResult {
  const { refreshInterval } = options;
  const [children, setChildren] = useState<Bead[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!epicId) {
      setChildren([]);
      setIsLoading(false);
      return;
    }

    try {
      const url = `/api/gastown/beads/${encodeURIComponent(epicId)}/children`;
      const response = await fetch(url);

      if (!response.ok) {
        // If 404, epic might have no children yet - that's okay
        if (response.status === 404) {
          setChildren([]);
          setError(null);
          setIsLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setChildren(result.children || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setChildren([]);
    } finally {
      setIsLoading(false);
    }
  }, [epicId]);

  useEffect(() => {
    fetchData();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  // Calculate progress from children
  const progress = useMemo(() => calculateEpicProgress(children), [children]);

  return { children, progress, error, isLoading, refresh: fetchData };
}
