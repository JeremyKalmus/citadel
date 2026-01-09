"use client";

import { useState, useCallback } from "react";

export interface UsePolecatActionsOptions {
  rig: string;
  name: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UsePolecatActionsResult {
  nudge: (message: string) => Promise<boolean>;
  kill: (force?: boolean) => Promise<boolean>;
  reassign: (targetRig: string, targetName: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

export function usePolecatActions(
  options: UsePolecatActionsOptions
): UsePolecatActionsResult {
  const { rig, name, onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const nudge = useCallback(
    async (message: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/gastown/actions/nudge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rig, name, message }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to nudge polecat");
        }

        onSuccess?.();
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [rig, name, onSuccess, onError]
  );

  const kill = useCallback(
    async (force: boolean = false): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/gastown/actions/kill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rig, name, force }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to kill polecat");
        }

        onSuccess?.();
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [rig, name, onSuccess, onError]
  );

  const reassign = useCallback(
    async (targetRig: string, targetName: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/gastown/actions/reassign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceRig: rig,
            sourceName: name,
            targetRig,
            targetName,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to reassign polecat");
        }

        onSuccess?.();
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [rig, name, onSuccess, onError]
  );

  return { nudge, kill, reassign, isLoading, error };
}
