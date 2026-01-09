import { cn } from "@/lib/utils"
import { Icon, type IconName, type IconVariant } from "./icon"

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
        // DS2 Phase 4: Mechanical transitions
        "rounded-sm border-2 border-chrome-border transition-mechanical",
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

interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional icon to display before the title */
  icon?: IconName
  /** Icon variant for status indication */
  iconVariant?: IconVariant
  /** Panel title text */
  title: string
  /** Optional action elements (buttons, badges, etc.) */
  actions?: React.ReactNode
}

/**
 * DS2 Panel Header
 * Section header with optional contextual icon - industrial signage style.
 */
export function PanelHeader({
  icon,
  iconVariant = "muted",
  title,
  actions,
  className,
  ...props
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3 border-b border-chrome-border/50",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <Icon
            name={icon}
            aria-label=""
            variant={iconVariant}
            size="sm"
          />
        )}
        <h3 className="section-header">{title}</h3>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

interface PanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * DS2 Panel Body
 * Content area with consistent padding.
 */
export function PanelBody({ className, ...props }: PanelBodyProps) {
  return (
    <div
      className={cn("p-4", className)}
      {...props}
    />
  )
}
