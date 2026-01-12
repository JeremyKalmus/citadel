"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { EnhancedConvoyDetail } from "@/lib/gastown";

export interface UseEnhancedConvoyDetailOptions {
  /** Convoy ID to fetch */
  convoyId: string;
  /** Refresh interval in ms (default: 5000 for 5 seconds) */
  refreshInterval?: number;
  /** Whether to enable polling (default: true) */
  enabled?: boolean;
}

export interface UseEnhancedConvoyDetailResult {
  data: EnhancedConvoyDetail | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch enhanced convoy data with per-bead journey states.
 *
 * Features:
 * - Fetches convoy with bead states and refinery queue positions
 * - Polls every 5 seconds by default when visible
 * - Pauses polling when tab is hidden
 * - Calculates idle duration and needsNudge flags
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refresh } = useEnhancedConvoyDetail({
 *   convoyId: "hq-cv-abc123",
 *   refreshInterval: 5000,
 * });
 *
 * if (data) {
 *   console.log(data.summary.needsNudge); // Number of beads needing attention
 *   console.log(data.beadStates); // Per-bead journey states
 * }
 * ```
 */
export function useEnhancedConvoyDetail(
  options: UseEnhancedConvoyDetailOptions
): UseEnhancedConvoyDetailResult {
  const { convoyId, refreshInterval = 5000, enabled = true } = options;
  const [data, setData] = useState<EnhancedConvoyDetail | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isVisibleRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled || !convoyId) {
      setIsLoading(false);
      return;
    }

    try {
      const url = `/api/gastown/convoys/${encodeURIComponent(convoyId)}/enhanced`;
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
  }, [convoyId, enabled]);

  // Track page visibility to pause polling when hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchData();

    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        // Only fetch if page is visible
        if (isVisibleRef.current) {
          fetchData();
        }
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, error, isLoading, refresh: fetchData };
}
