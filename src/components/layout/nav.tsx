"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icon, navIcons, type IconName } from "@/components/ui/icon"

interface NavItem {
  label: string
  href: string
  icon: IconName
}

const navItems: NavItem[] = [
  { label: "Rigs", href: "/", icon: navIcons.rigs },
  { label: "Convoys", href: "/convoys", icon: navIcons.convoys },
  { label: "Workers", href: "/workers", icon: navIcons.workers },
  { label: "Settings", href: "/settings", icon: navIcons.settings },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors",
              isActive
                ? "bg-gunmetal text-bone border border-chrome-border"
                : "text-ash hover:text-bone hover:bg-gunmetal/50"
            )}
          >
            <Icon
              name={item.icon}
              aria-label={item.label}
              size="sm"
            />
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
