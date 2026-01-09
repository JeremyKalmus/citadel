"use client"

import { Panel, Skeleton } from "@/components/ui"
import { Icon, type IconName } from "@/components/ui/icon"

export interface Stat {
  label: string
  value: number | string
  icon: IconName
  loading?: boolean
}

interface StatsGridProps {
  stats: Stat[]
}

function StatCard({ stat }: { stat: Stat }) {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-header">{stat.label}</p>
          <div className="mt-2">
            {stat.loading ? (
              <Skeleton variant="stat" className="h-8 w-12" />
            ) : (
              <p className="data-value">{stat.value}</p>
            )}
          </div>
        </div>
        <Icon name={stat.icon} aria-label="" variant="muted" size="xl" />
      </div>
    </Panel>
  )
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  )
}
