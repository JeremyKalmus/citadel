"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
      <Link
        href="/"
        className="text-chrome-rust hover:text-chrome-dust transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-chrome-shadow" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-chrome-dust hover:text-chrome-bright transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-chrome-bright font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
