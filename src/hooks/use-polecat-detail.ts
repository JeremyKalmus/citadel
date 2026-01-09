"use client";

import { useState, useEffect, useCallback } from "react";
import type { PolecatDetail } from "@/lib/gastown";

export interface UsePolecatDetailOptions {
  rig: string;
  name: string;
  refreshInterval?: number;
}

export interface UsePolecatDetailResult {
  data: PolecatDetail | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function usePolecatDetail(
  options: UsePolecatDetailOptions
): UsePolecatDetailResult {
  const { rig, name, refreshInterval } = options;
  const [data, setData] = useState<PolecatDetail | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const url = `/api/gastown/polecats/${encodeURIComponent(rig)}/${encodeURIComponent(name)}`;
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
  }, [rig, name]);

  useEffect(() => {
    fetchData();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, error, isLoading, refresh: fetchData };
}
