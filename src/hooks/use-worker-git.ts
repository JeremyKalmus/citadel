"use client";

import { useState, useEffect, useCallback } from "react";
import type { WorkerGitActivity } from "@/lib/gastown";

export interface UseWorkerGitOptions {
  rig: string;
  name: string;
  baseBranch?: string;
  refreshInterval?: number;
}

export interface UseWorkerGitResult {
  data: WorkerGitActivity | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useWorkerGit(options: UseWorkerGitOptions): UseWorkerGitResult {
  const { rig, name, baseBranch = "main", refreshInterval } = options;
  const [data, setData] = useState<WorkerGitActivity | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const url = `/api/gastown/workers/${encodeURIComponent(rig)}/${encodeURIComponent(name)}/git?base=${encodeURIComponent(baseBranch)}`;
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
  }, [rig, name, baseBranch]);

  useEffect(() => {
    fetchData();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, error, isLoading, refresh: fetchData };
}
