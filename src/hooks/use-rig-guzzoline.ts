"use client";

import { useState, useEffect, useCallback } from "react";
import type { EnhancedGuzzolineStats } from "@/lib/gastown";

export interface UseRigGuzzolineOptions {
  /** Rig name to filter stats by */
  rig: string;
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
}

export interface UseRigGuzzolineResult {
  data: EnhancedGuzzolineStats | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch rig-scoped guzzoline stats.
 * Returns enhanced stats filtered to only include workers from the specified rig.
 *
 * @param options - Options including required rig name and optional refresh interval
 * @returns Rig-filtered guzzoline stats with loading/error state
 */
export function useRigGuzzoline(
  options: UseRigGuzzolineOptions
): UseRigGuzzolineResult {
  const { rig, refreshInterval } = options;
  const [data, setData] = useState<EnhancedGuzzolineStats | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!rig) {
      setError(new Error("Rig name is required"));
      setIsLoading(false);
      return;
    }

    try {
      const url = `/api/gastown/guzzoline?enhanced=true&rig=${encodeURIComponent(rig)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
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
