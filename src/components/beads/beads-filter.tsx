"use client";

import { cn } from "@/lib/utils";
import type { BeadsFilter } from "@/lib/gastown";

interface BeadsFilterProps {
  value: BeadsFilter;
  onChange: (filter: BeadsFilter) => void;
  className?: string;
}

const filters: { value: BeadsFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "ready", label: "Ready" },
  { value: "blocked", label: "Blocked" },
  { value: "closed", label: "Closed" },
];

export function BeadsFilterTabs({ value, onChange, className }: BeadsFilterProps) {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-carbon-black/50 rounded-sm", className)}>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-sm transition-mechanical",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-bone focus-visible:ring-offset-1 focus-visible:ring-offset-carbon-black",
            value === filter.value
              ? "bg-gunmetal text-bone border border-chrome-border"
              : "text-ash hover:text-bone hover:bg-gunmetal/50"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
