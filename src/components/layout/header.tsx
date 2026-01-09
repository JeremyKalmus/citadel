"use client"

import { Flame, RefreshCw } from "lucide-react"
import { Nav } from "./nav"
import { ActionButton } from "@/components/ui"

interface HeaderProps {
  onRefresh?: () => void
  loading?: boolean
}

export function Header({ onRefresh, loading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-iron bg-oil/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Flame className="w-6 h-6 text-chrome-bright" />
          <span className="text-lg font-bold tracking-tight text-chrome-bright">
            GAS TOWN
          </span>
        </div>

        {/* Navigation */}
        <Nav />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              loading={loading}
              icon={<RefreshCw className="w-4 h-4" />}
              aria-label="Refresh data"
            />
          )}
        </div>
      </div>
    </header>
  )
}
