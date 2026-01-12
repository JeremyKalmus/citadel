"use client";

import { cn } from "@/lib/utils";

interface RefineryQueueIndicatorProps {
  position: number;
  queueLength: number;
  className?: string;
}

/**
 * RefineryQueueIndicator shows queue position as an inline badge.
 * Uses DS2 colors: fuel-yellow for waiting, acid-green for processing.
 */
export function RefineryQueueIndicator({
  position,
  queueLength,
  className,
}: RefineryQueueIndicatorProps) {
  const isProcessing = position === 1;

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono",
        isProcessing
          ? "bg-acid-green/20 text-acid-green"
          : "bg-fuel-yellow/20 text-fuel-yellow",
        className
      )}
    >
      #{position} of {queueLength}
    </span>
  );
}
