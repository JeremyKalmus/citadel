"use client";

import { useState, useEffect, useCallback } from "react";
import type { Rig } from "@/lib/gastown";

export interface UseRigOptions {
  refreshInterval?: number;
}

export interface UseRigResult {
  data: Rig | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useRig(name: string, options: UseRigOptions = {}): UseRigResult {
  const { refreshInterval } = options;
  const [data, setData] = useState<Rig | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/gastown/rigs/${encodeURIComponent(name)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Rig '${name}' not found`);
        }
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
  }, [name]);

  useEffect(() => {
    fetchData();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, error, isLoading, refresh: fetchData };
}
