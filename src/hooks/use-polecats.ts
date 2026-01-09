"use client";

import { useState, useEffect, useCallback } from "react";
import type { Polecat } from "@/lib/gastown";

export interface UsePolecatsOptions {
  rig?: string;
  refreshInterval?: number;
}

export interface UsePolecatsResult {
  data: Polecat[] | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function usePolecats(
  options: UsePolecatsOptions = {}
): UsePolecatsResult {
  const { rig, refreshInterval } = options;
  const [data, setData] = useState<Polecat[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const url = rig
        ? `/api/gastown/polecats?rig=${encodeURIComponent(rig)}`
        : "/api/gastown/polecats";
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
