import { cn } from "@/lib/utils"
import { forwardRef, type ComponentPropsWithoutRef } from "react"

// Heroicons
import {
  PlayCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  LockClosedIcon,
  CpuChipIcon,
  CogIcon,
} from "@heroicons/react/24/outline"

// Lucide (already installed)
import {
  Activity,
  Brain,
  Container,
  Truck,
  Terminal,
  Settings,
  Fuel,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"

// React Icons (Font Awesome)
import { FaTruck, FaRoad } from "react-icons/fa"

/**
 * DS2 Icon System
 * Unified API for all icon sets with automatic styling based on context.
 *
 * Icon Sources:
 * - Heroicons: Status indicators (PlayCircle, CheckCircle, ExclamationTriangle)
 * - Lucide: UI elements (Activity, Brain, Container)
 * - Font Awesome: Domain icons (Truck, Road)
 */

export type IconName =
  // Status icons (Heroicons)
  | "play-circle"
  | "check-circle"
  | "exclamation-triangle"
  | "x-circle"
  | "clock"
  | "lock"
  | "cpu"
  | "cog"
  // Activity icons (Lucide)
  | "activity"
  | "brain"
  | "container"
  | "truck-lucide"
  | "terminal"
  | "settings"
  | "fuel"
  | "alert-triangle"
  // Domain icons (Font Awesome)
  | "truck"
  | "road"

export type IconVariant = "default" | "alert" | "active" | "ok" | "muted"

type HeroiconComponent = typeof PlayCircleIcon
type LucideComponent = LucideIcon
type ReactIconComponent = typeof FaTruck

type IconComponent = HeroiconComponent | LucideComponent | ReactIconComponent

const iconMap: Record<IconName, IconComponent> = {
  // Heroicons - Status
  "play-circle": PlayCircleIcon,
  "check-circle": CheckCircleIcon,
  "exclamation-triangle": ExclamationTriangleIcon,
  "x-circle": XCircleIcon,
  "clock": ClockIcon,
  "lock": LockClosedIcon,
  "cpu": CpuChipIcon,
  "cog": CogIcon,
  // Lucide - UI
  "activity": Activity,
  "brain": Brain,
  "container": Container,
  "truck-lucide": Truck,
  "terminal": Terminal,
  "settings": Settings,
  "fuel": Fuel,
  "alert-triangle": AlertTriangle,
  // Font Awesome - Domain
  "truck": FaTruck,
  "road": FaRoad,
}

const variantStyles: Record<IconVariant, string> = {
  default: "text-current",
  alert: "text-rust-orange",
  active: "text-fuel-yellow",
  ok: "text-acid-green",
  muted: "text-ash",
}

export interface IconProps extends ComponentPropsWithoutRef<"svg"> {
  /** Icon name from the unified icon set */
  name: IconName
  /** Accessibility label (required for screen readers) */
  "aria-label": string
  /** Visual variant for status indication */
  variant?: IconVariant
  /** Size preset or custom class */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}

const sizeStyles: Record<NonNullable<IconProps["size"]>, string> = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
}

/**
 * Unified Icon component with accessibility built-in.
 *
 * @example
 * ```tsx
 * <Icon name="check-circle" aria-label="Success" variant="ok" />
 * <Icon name="truck" aria-label="Rig" size="lg" />
 * <Icon name="exclamation-triangle" aria-label="Warning" variant="alert" />
 * ```
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, variant = "default", size = "md", className, ...props }, ref) => {
    const IconComponent = iconMap[name]

    if (!IconComponent) {
      console.warn(`[Icon] Unknown icon name: ${name}`)
      return null
    }

    return (
      <IconComponent
        ref={ref}
        className={cn(
          "icon shrink-0",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        aria-hidden={props["aria-label"] ? undefined : true}
        role={props["aria-label"] ? "img" : undefined}
        {...props}
      />
    )
  }
)

Icon.displayName = "Icon"

/**
 * Status icon mapping for StatusBadge integration
 */
export const statusIcons: Record<string, IconName> = {
  active: "play-circle",
  thinking: "brain",
  slow: "clock",
  unresponsive: "exclamation-triangle",
  dead: "x-circle",
  blocked: "lock",
  done: "check-circle",
}

/**
 * Navigation icon mapping
 */
export const navIcons: Record<string, IconName> = {
  rigs: "truck",
  convoys: "road",
  workers: "terminal",
  settings: "cog",
}
