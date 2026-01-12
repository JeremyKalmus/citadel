"use client";

import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/ui/icon";

interface StageNodeProps {
  icon: IconName;
  label: string;
  sublabel: string;
  active?: boolean;
}

/**
 * Execution stage node (compact, for pipeline stages)
 */
export function StageNode({ icon, label, sublabel, active }: StageNodeProps) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[60px]">
      <div
        className={cn(
          "w-10 h-10 rounded-sm border flex items-center justify-center",
          active
            ? "bg-fuel-yellow/10 border-fuel-yellow"
            : "bg-gunmetal border-chrome-border"
        )}
      >
        <Icon
          name={icon}
          aria-label={label}
          size="sm"
          variant={active ? "active" : "default"}
        />
      </div>
      <span className="font-mono text-xs text-bone">{label}</span>
      <span className="text-[10px] text-ash">{sublabel}</span>
    </div>
  );
}
