"use client";

import { useState, useEffect, useCallback } from "react";
import type { EnhancedGuzzolineStats } from "@/lib/gastown";

export interface UseEnhancedGuzzolineOptions {
  refreshInterval?: number;
}

export interface UseEnhancedGuzzolineResult {
  data: EnhancedGuzzolineStats | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch enhanced guzzoline stats including per-issue token breakdown.
 * Use this when you need detailed per-issue token usage data.
 */
export function useEnhancedGuzzoline(
  options: UseEnhancedGuzzolineOptions = {}
): UseEnhancedGuzzolineResult {
  const { refreshInterval } = options;
  const [data, setData] = useState<EnhancedGuzzolineStats | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/gastown/guzzoline?enhanced=true");
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
