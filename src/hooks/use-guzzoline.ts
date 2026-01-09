"use client";

import { useState, useEffect, useCallback } from "react";
import type { GuzzolineStats } from "@/lib/gastown";

export interface UseGuzzolineOptions {
  refreshInterval?: number;
}

export interface UseGuzzolineResult {
  data: GuzzolineStats | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useGuzzoline(
  options: UseGuzzolineOptions = {}
): UseGuzzolineResult {
  const { refreshInterval } = options;
  const [data, setData] = useState<GuzzolineStats | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/gastown/guzzoline");
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
