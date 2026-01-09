"use client";

import { useState, useEffect, useCallback } from "react";
import type { Convoy } from "@/lib/gastown";

export interface UseConvoysOptions {
  refreshInterval?: number;
}

export interface UseConvoysResult {
  data: Convoy[] | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useConvoys(options: UseConvoysOptions = {}): UseConvoysResult {
  const { refreshInterval } = options;
  const [data, setData] = useState<Convoy[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/gastown/convoys");
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
