"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Plugin metadata from the API
 */
export interface PluginInfo {
  name: string;
  version: string;
  description: string;
  hasClaudeMd: boolean;
  effects: string[];
  enabled: boolean;
  scope?: string;
  type?: string;
}

/**
 * Response from GET /api/gastown/plugins
 */
export interface PluginsResponse {
  plugins: PluginInfo[];
}

export interface UsePluginsOptions {
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number;
}

export interface UsePluginsResult {
  /** Plugin data or null if loading/error */
  data: PluginsResponse | null;
  /** Error if fetch failed */
  error: Error | null;
  /** Loading state */
  isLoading: boolean;
  /** Manual refresh function */
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch installed plugins from the Gas Town API.
 *
 * @example
 * ```tsx
 * const { data, error, isLoading, refresh } = usePlugins();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 *
 * return <PluginPanel plugins={data?.plugins ?? []} />;
 * ```
 */
export function usePlugins(options: UsePluginsOptions = {}): UsePluginsResult {
  const { refreshInterval } = options;
  const [data, setData] = useState<PluginsResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/gastown/plugins");
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
