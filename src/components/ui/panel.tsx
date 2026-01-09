import { cn } from "@/lib/utils"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'inset'
}

/**
 * DS2 Panel Component
 * Industrial control panel aesthetic - hard edges, visible borders, insets instead of shadows.
 * "Panels feel bolted on. Cards feel designed."
 */
export function Panel({ className, variant = 'default', ...props }: PanelProps) {
  return (
    <div
      className={cn(
        // DS2: Hard edges (minimal radius), visible borders
        "rounded-sm border-2 border-chrome-border",
        {
          // Default: gunmetal surface, visible border
          'bg-gunmetal': variant === 'default',
          // Elevated: slightly brighter surface, stronger border
          'bg-gunmetal border-chrome-border/80 shadow-[inset_0_1px_0_rgba(230,232,235,0.05)]': variant === 'elevated',
          // Inset: same as elevated (gunmetal), no border, inset shadow for depth
          'bg-gunmetal border-transparent shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]': variant === 'inset',
        },
        className
      )}
      {...props}
    />
  )
}
