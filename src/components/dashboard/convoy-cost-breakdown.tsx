"use client"

import Link from "next/link"
import { Panel, PanelHeader, PanelBody, StatusBadge, Skeleton, SkeletonRow } from "@/components/ui"
import { Icon } from "@/components/ui/icon"
import type { ConvoyTokenUsage, EnhancedGuzzolineStatsWithConvoys } from "@/lib/gastown"
import { Truck, TrendingUp, Users, Fuel } from "lucide-react"

interface ConvoyCostBreakdownProps {
  data: EnhancedGuzzolineStatsWithConvoys | null
  loading?: boolean
}

/**
 * Format token count for display (e.g., 12.4k, 1.2M)
 */
function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

/**
 * Get status based on convoy status string
 */
function getConvoyStatus(status: string): "active" | "done" | "blocked" | "thinking" {
  const lower = status.toLowerCase()
  if (lower === "active" || lower === "running") return "active"
  if (lower === "complete" || lower === "done" || lower === "finished") return "done"
  if (lower === "blocked" || lower === "paused") return "blocked"
  return "thinking"
}

interface ConvoyRowProps {
  convoy: ConvoyTokenUsage
  rank: number
}

function ConvoyRow({ convoy, rank }: ConvoyRowProps) {
  return (
    <Link
      href={`/convoy/${encodeURIComponent(convoy.convoyId)}`}
      className="flex items-center justify-between py-3 border-b border-chrome-border/30 last:border-0 -mx-4 px-4 transition-colors hover:bg-carbon-black/30"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="shrink-0 w-6 h-6 rounded-sm bg-gunmetal flex items-center justify-center text-ash text-xs font-mono">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <p className="body-text font-medium truncate">{convoy.title || convoy.convoyId}</p>
          <p className="caption text-ash truncate">
            {convoy.issues.length} issue{convoy.issues.length !== 1 ? "s" : ""} · {convoy.sessionCount} session{convoy.sessionCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="data-value text-bone">{formatTokens(convoy.totalTokens)}</p>
          <p className="caption text-ash">{convoy.actors.length} worker{convoy.actors.length !== 1 ? "s" : ""}</p>
        </div>
        <StatusBadge status={getConvoyStatus(convoy.status)} size="sm" />
      </div>
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  )
}

export function ConvoyCostBreakdown({ data, loading = false }: ConvoyCostBreakdownProps) {
  const convoys = data?.top_convoys ?? []
  const hasConvoys = convoys.length > 0

  // Calculate totals
  const totalConvoyTokens = convoys.reduce((sum, c) => sum + c.totalTokens, 0)
  const activeConvoys = convoys.filter(c => getConvoyStatus(c.status) === "active").length

  return (
    <Panel>
      <PanelHeader
        icon="road"
        title="Convoy Cost Breakdown"
        actions={
          <span className="caption text-ash">
            {loading ? "—" : `${convoys.length} convoy${convoys.length !== 1 ? "s" : ""}`}
          </span>
        }
      />
      <PanelBody>
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-chrome-border/30">
          <div>
            <p className="label text-ash">Total Convoy Tokens</p>
            {loading ? (
              <Skeleton variant="stat" className="h-6 w-14 mt-1" />
            ) : (
              <p className="data-value">{formatTokens(totalConvoyTokens)}</p>
            )}
          </div>
          <div>
            <p className="label text-ash">Active Convoys</p>
            {loading ? (
              <Skeleton variant="stat" className="h-6 w-8 mt-1" />
            ) : (
              <p className="data-value">{activeConvoys}</p>
            )}
          </div>
          <div>
            <p className="label text-ash">Tracked</p>
            {loading ? (
              <Skeleton variant="stat" className="h-6 w-8 mt-1" />
            ) : (
              <p className="data-value">{convoys.length}</p>
            )}
          </div>
        </div>

        {/* Convoy list */}
        {loading ? (
          <LoadingSkeleton />
        ) : !hasConvoys ? (
          <div className="py-6 text-center">
            <div className="inline-flex p-3 rounded-sm bg-gunmetal text-ash mb-3">
              <Icon name="road" aria-label="" size="lg" />
            </div>
            <p className="body-text text-bone">No convoy data</p>
            <p className="caption text-ash mt-1">Convoy cost tracking requires issue IDs in events</p>
          </div>
        ) : (
          <div>
            {convoys.map((convoy, index) => (
              <ConvoyRow key={convoy.convoyId} convoy={convoy} rank={index + 1} />
            ))}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
