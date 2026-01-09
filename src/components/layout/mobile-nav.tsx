"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icon, navIcons, type IconName } from "@/components/ui/icon"
import { Menu, X } from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: IconName
}

const navItems: NavItem[] = [
  { label: "Town Overview", href: "/", icon: navIcons.rigs },
  { label: "Convoys", href: "/convoys", icon: navIcons.convoys },
  { label: "Workers", href: "/workers", icon: navIcons.workers },
  { label: "Settings", href: "/settings", icon: navIcons.settings },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="p-2 text-ash hover:text-bone transition-colors"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-carbon-black/80 backdrop-blur-sm z-40"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <nav
            className="fixed top-14 left-0 right-0 bg-gunmetal border-b border-chrome-border z-50 animate-in slide-in-from-top duration-200"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium",
                      "transition-colors",
                      isActive
                        ? "bg-carbon-black text-bone border border-chrome-border"
                        : "text-ash hover:text-bone hover:bg-carbon-black/50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      name={item.icon}
                      aria-label=""
                      size="md"
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
