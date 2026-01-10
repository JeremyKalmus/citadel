"use client";

import { useState, useEffect, useCallback } from "react";
import type { BeadDetail } from "@/lib/gastown";

export interface UseBeadDetailOptions {
  id: string;
  refreshInterval?: number;
}

export interface UseBeadDetailResult {
  data: BeadDetail | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useBeadDetail(
  options: UseBeadDetailOptions
): UseBeadDetailResult {
  const { id, refreshInterval } = options;
  const [data, setData] = useState<BeadDetail | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const url = `/api/gastown/beads/${encodeURIComponent(id)}`;
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
