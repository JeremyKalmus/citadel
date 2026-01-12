"use client";

import { Icon, type IconName } from "@/components/ui/icon";

interface WorkflowNodeProps {
  icon: IconName;
  label: string;
  sublabel: string;
}

/**
 * Coordination layer node (larger, for User/Mayor/Convoy)
 */
export function WorkflowNode({ icon, label, sublabel }: WorkflowNodeProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-12 h-12 rounded-sm bg-gunmetal border border-chrome-border flex items-center justify-center">
        <Icon name={icon} aria-label={label} size="md" />
      </div>
      <span className="font-mono text-sm text-bone">{label}</span>
      <span className="text-xs text-ash">{sublabel}</span>
    </div>
  );
}
