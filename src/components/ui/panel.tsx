import { cn } from "@/lib/utils"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'inset'
}

export function Panel({ className, variant = 'default', ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-chrome-shadow/50",
        {
          'bg-steel': variant === 'default',
          'bg-oil shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.4)]': variant === 'elevated',
          'bg-abyss border-iron': variant === 'inset',
        },
        className
      )}
      {...props}
    />
  )
}
