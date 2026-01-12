"use client"

import { ActionButton } from "@/components/ui"
import { RigList } from "@/components/rig"
import { useTownStatus } from "@/hooks"
import { RefreshCw } from "lucide-react"

export default function RigsPage() {
  const { data: status, isLoading, refresh } = useTownStatus({ refreshInterval: 30000 })

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-bone truncate">Rigs</h1>
          <p className="body-text-muted mt-1 hidden sm:block">
            Active development environments
          </p>
        </div>
        <ActionButton
          variant="ghost"
          onClick={() => refresh()}
          loading={isLoading}
          icon={<RefreshCw className="w-4 h-4" />}
          className="shrink-0"
        >
          <span className="hidden sm:inline">Refresh</span>
        </ActionButton>
      </div>

      {/* Rigs list */}
      <RigList rigs={status?.rigs ?? []} isLoading={isLoading} />
    </div>
  )
}
