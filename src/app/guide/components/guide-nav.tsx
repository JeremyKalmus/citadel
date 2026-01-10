"use client"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/components/ui/icon"

/**
 * Guide section definition for navigation
 */
export interface GuideSection {
  /** Unique section identifier */
  id: string
  /** Display label for the section */
  label: string
  /** Icon name from the DS2 icon system */
  icon: IconName
  /** Optional badge text (e.g., "3 plugins") */
  badge?: string
}

export interface GuideNavProps {
  /** Array of sections to display */
  sections: GuideSection[]
  /** Currently active section ID */
  activeSection: string
  /** Callback when section changes */
  onSectionChange: (sectionId: string) => void
  /** Optional additional className */
  className?: string
}

/**
 * GuideNav - Vertical Navigation for Guide Tab Sections
 *
 * DS2 Component following spec section 4.1:
 * - Uses Panel inset pattern for navigation items
 * - Highlights active section with DS2 accent color (acid-green)
 * - Uses Icon component for section icons
 *
 * @example
 * ```tsx
 * <GuideNav
 *   sections={[
 *     { id: "overview", label: "Overview", icon: "compass" },
 *     { id: "entities", label: "Entities", icon: "layers" },
 *     { id: "plugins", label: "Plugins", icon: "puzzle", badge: "3" },
 *   ]}
 *   activeSection="overview"
 *   onSectionChange={(id) => setActiveSection(id)}
 * />
 * ```
 */
export function GuideNav({
  sections,
  activeSection,
  onSectionChange,
  className,
}: GuideNavProps) {
  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      role="navigation"
      aria-label="Guide sections"
    >
      {sections.map((section) => {
        const isActive = section.id === activeSection

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              // Base styles - Panel inset pattern
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-sm text-left",
              // DS2 Phase 4: Mechanical transitions
              "transition-mechanical",
              // Accessibility: Clear focus states
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-carbon-black",
              isActive
                ? // Active state - DS2 accent color with inset pattern
                  "bg-gunmetal shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] border-l-2 border-acid-green"
                : // Inactive state - subtle hover effect
                  "border-l-2 border-transparent hover:bg-gunmetal/50 hover:border-chrome-border"
            )}
            aria-current={isActive ? "true" : undefined}
          >
            <Icon
              name={section.icon}
              aria-label=""
              size="sm"
              className={cn(
                "shrink-0",
                isActive ? "text-acid-green" : "text-ash"
              )}
            />
            <span
              className={cn(
                "flex-1 text-sm font-medium",
                isActive ? "text-bone" : "text-ash"
              )}
            >
              {section.label}
            </span>
            {section.badge && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-xs rounded-sm",
                  isActive
                    ? "bg-acid-green/20 text-acid-green"
                    : "bg-chrome-border/50 text-ash"
                )}
              >
                {section.badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
