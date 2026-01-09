"use client"

import { Panel, ActionButton, ErrorPanel, Skeleton } from "@/components/ui"
import { HealthSummary, StatsGrid, WorkerList, AttentionRequired, type Stat } from "@/components/dashboard"
import { RigList } from "@/components/rig"
import { useTownStatus, useConvoys, usePolecats, useGuzzoline } from "@/hooks"
import { RefreshCw, Fuel, AlertTriangle } from "lucide-react"

export default function Home() {
  const { data: status, error: statusError, isLoading: statusLoading, refresh: refreshStatus } = useTownStatus({ refreshInterval: 30000 })
  const { data: convoys, error: convoysError, isLoading: convoysLoading, refresh: refreshConvoys } = useConvoys({ refreshInterval: 30000 })
  const { data: polecats, error: polecatsError, isLoading: polecatsLoading, refresh: refreshPolecats } = usePolecats({ refreshInterval: 30000 })
  const { data: guzzoline, error: guzzolineError, isLoading: guzzolineLoading, refresh: refreshGuzzoline } = useGuzzoline({ refreshInterval: 30000 })

  // Combined error state - show if any critical data fails to load
  const hasError = statusError || polecatsError
  const errorMessage = statusError?.message || polecatsError?.message || "Failed to load data"

  const isLoading = statusLoading || convoysLoading || polecatsLoading || guzzolineLoading

  const stats: Stat[] = [
    {
      label: "Active Rigs",
      value: status?.rigs.length ?? 0,
      icon: "container",
      loading: statusLoading
    },
    {
      label: "Running Convoys",
      value: convoys?.filter(c => c.status === "active").length ?? 0,
      icon: "road",
      loading: convoysLoading
    },
    {
      label: "Active Workers",
      value: polecats?.filter(p => p.session_running).length ?? 0,
      icon: "terminal",
      loading: polecatsLoading
    },
  ]

  const handleRefresh = () => {
    refreshStatus()
    refreshConvoys()
    refreshPolecats()
    refreshGuzzoline()
  }

  // Format token count for display (e.g., 12.4k, 1.2M)
  const formatTokens = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
    return n.toString()
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-bone truncate">Town Overview</h1>
          <p className="body-text-muted mt-1 hidden sm:block">
            Gas Town Command Center
          </p>
        </div>
        <ActionButton
          variant="ghost"
          onClick={handleRefresh}
          loading={isLoading}
          icon={<RefreshCw className="w-4 h-4" />}
          className="shrink-0"
        >
          <span className="hidden sm:inline">Refresh</span>
        </ActionButton>
      </div>

      {/* Error state - show if critical data fails */}
      {hasError && !isLoading && (
        <ErrorPanel
          title="Connection Error"
          message={errorMessage}
          details="Unable to connect to Gas Town API. Make sure the server is running."
          onRetry={handleRefresh}
        />
      )}

      {/* Stats grid */}
      <StatsGrid stats={stats} />

      {/* Attention Required - Shows items needing intervention */}
      <AttentionRequired
        polecats={polecats}
        guzzoline={guzzoline}
        loading={polecatsLoading || guzzolineLoading}
      />

      {/* Guzzoline Stats */}
      <Panel className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="section-header flex items-center gap-2">
            <Fuel className="w-5 h-5 text-chrome" />
            <span className="hidden sm:inline">Guzzoline — Token Efficiency</span>
            <span className="sm:hidden">Guzzoline</span>
          </h2>
          {guzzoline?.budget_warnings && guzzoline.budget_warnings > 0 && (
            <div className="flex items-center gap-1 text-rust">
              <AlertTriangle className="w-4 h-4" />
              <span className="label">{guzzoline.budget_warnings} warning{guzzoline.budget_warnings > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="label text-ash">Today</p>
            {guzzolineLoading ? (
              <Skeleton variant="stat" className="h-8 w-16 mt-1" />
            ) : (
              <>
                <p className="data-value">{formatTokens(guzzoline?.total_tokens_today ?? 0)}</p>
                <p className="label text-ash">{guzzoline?.sessions_today ?? 0} sessions</p>
              </>
            )}
          </div>
          <div>
            <p className="label text-ash">This Week</p>
            {guzzolineLoading ? (
              <Skeleton variant="stat" className="h-8 w-16 mt-1" />
            ) : (
              <p className="data-value">{formatTokens(guzzoline?.total_tokens_week ?? 0)}</p>
            )}
          </div>
          <div>
            <p className="label text-ash">Polecats</p>
            {guzzolineLoading ? (
              <Skeleton variant="stat" className="h-8 w-16 mt-1" />
            ) : (
              <p className="data-value">{formatTokens(guzzoline?.by_agent_type?.polecat ?? 0)}</p>
            )}
          </div>
          <div>
            <p className="label text-ash">Infrastructure</p>
            {guzzolineLoading ? (
              <Skeleton variant="stat" className="h-8 w-16 mt-1" />
            ) : (
              <p className="data-value">{formatTokens((guzzoline?.by_agent_type?.witness ?? 0) + (guzzoline?.by_agent_type?.refinery ?? 0))}</p>
            )}
          </div>
        </div>

        {guzzoline?.recent_sessions && guzzoline.recent_sessions.length > 0 && (
          <div>
            <p className="label text-ash mb-2">Recent Sessions</p>
            <div className="space-y-1">
              {guzzoline.recent_sessions.slice(0, 5).map((session, i) => (
                <div key={i} className="flex justify-between gap-2 text-sm">
                  <span className="text-bone font-mono truncate min-w-0">{session.actor}</span>
                  <span className="text-ash shrink-0">{formatTokens(session.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health summary */}
        <HealthSummary
          status={status}
          polecats={polecats}
          loading={isLoading}
        />

        {/* Rigs list with drill-down */}
        <RigList rigs={status?.rigs ?? []} isLoading={statusLoading} />
      </div>

      {/* Workers section */}
      <WorkerList
        polecats={polecats}
        loading={polecatsLoading}
      />
    </div>
  )
}
