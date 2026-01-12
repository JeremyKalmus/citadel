"use client";

import { useState, useEffect, useCallback } from "react";
import type { EnhancedConvoyDetail } from "@/lib/gastown";

export interface UseEnhancedConvoyDetailOptions {
  id: string;
  refreshInterval?: number;
}

export interface UseEnhancedConvoyDetailResult {
  data: EnhancedConvoyDetail | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch enhanced convoy data with per-bead journey states.
 * Polls every 5 seconds by default when visible.
 */
export function useEnhancedConvoyDetail(
  options: UseEnhancedConvoyDetailOptions
): UseEnhancedConvoyDetailResult {
  const { id, refreshInterval = 5000 } = options;
  const [data, setData] = useState<EnhancedConvoyDetail | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const url = `/api/gastown/convoys/${encodeURIComponent(id)}/enhanced`;
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
  }, [id]);

  useEffect(() => {
    fetchData();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, error, isLoading, refresh: fetchData };
}
