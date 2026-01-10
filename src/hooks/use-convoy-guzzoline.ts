"use client";

import { useState, useEffect, useCallback } from "react";
import type { EnhancedGuzzolineStatsWithConvoys } from "@/lib/gastown";

export interface UseConvoyGuzzolineOptions {
  refreshInterval?: number;
}

export interface UseConvoyGuzzolineResult {
  data: EnhancedGuzzolineStatsWithConvoys | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch guzzoline stats with convoy cost breakdown.
 * Includes per-issue and per-convoy token usage aggregation.
 */
export function useConvoyGuzzoline(
  options: UseConvoyGuzzolineOptions = {}
): UseConvoyGuzzolineResult {
  const { refreshInterval } = options;
  const [data, setData] = useState<EnhancedGuzzolineStatsWithConvoys | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/gastown/guzzoline?convoys=true");
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
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, error, isLoading, refresh: fetchData };
}
