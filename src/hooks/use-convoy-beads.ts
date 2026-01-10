"use client";

import { useState, useEffect, useCallback } from "react";
import type { Bead } from "@/lib/gastown";

export interface UseConvoyBeadsOptions {
  convoyId: string;
  refreshInterval?: number;
}

export interface UseConvoyBeadsResult {
  data: Bead[] | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useConvoyBeads(
  options: UseConvoyBeadsOptions
): UseConvoyBeadsResult {
  const { convoyId, refreshInterval } = options;
  const [data, setData] = useState<Bead[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const url = `/api/gastown/convoys/${encodeURIComponent(convoyId)}/beads`;
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
  }, [convoyId]);

  useEffect(() => {
    fetchData();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, error, isLoading, refresh: fetchData };
}
