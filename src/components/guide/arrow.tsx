"use client";

import { ChevronRight } from "lucide-react";

/**
 * Horizontal connector arrow between workflow nodes
 */
export function Arrow() {
  return (
    <div className="flex items-center text-chrome-border">
      <div className="w-4 h-px bg-current" />
      <ChevronRight className="w-3 h-3 -ml-1" />
    </div>
  );
}
