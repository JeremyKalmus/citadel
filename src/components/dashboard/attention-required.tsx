"use client"

import Link from "next/link"
import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui"
import { Icon } from "@/components/ui/icon"
import type { Polecat, GuzzolineStats } from "@/lib/gastown"
import { AlertTriangle, Users, Fuel, Clock } from "lucide-react"

interface AttentionItem {
  id: string
  type: "worker" | "budget" | "stale" | "convoy"
  title: string
  description: string
  status: Status
  href?: string
  timestamp?: string
}

interface AttentionRequiredProps {
  polecats: Polecat[] | null
  guzzoline: GuzzolineStats | null
  loading?: boolean
}

function getWorkerAttentionItems(polecats: Polecat[] | null): AttentionItem[] {
  if (!polecats) return []

  const items: AttentionItem[] = []

  // Dead workers need immediate attention
  const deadWorkers = polecats.filter(p => p.state === "dead")
  for (const worker of deadWorkers) {
    items.push({
      id: `dead-${worker.rig}-${worker.name}`,
      type: "worker",
      title: `${worker.rig}/${worker.name}`,
      description: "Worker is dead - session crashed or terminated",
      status: "dead",
      href: `/worker/${encodeURIComponent(worker.rig)}/${encodeURIComponent(worker.name)}`,
    })
  }

  // Blocked workers may need intervention
  const blockedWorkers = polecats.filter(p => p.state === "blocked")
  for (const worker of blockedWorkers) {
    items.push({
      id: `blocked-${worker.rig}-${worker.name}`,
      type: "worker",
      title: `${worker.rig}/${worker.name}`,
      description: "Worker is blocked - waiting on dependency or approval",
      status: "blocked",
      href: `/worker/${encodeURIComponent(worker.rig)}/${encodeURIComponent(worker.name)}`,
    })
  }

  // Stalled workers (session not running but not dead)
  const stalledWorkers = polecats.filter(p => !p.session_running && p.state !== "dead" && p.state !== "done")
  for (const worker of stalledWorkers) {
    items.push({
      id: `stalled-${worker.rig}-${worker.name}`,
      type: "stale",
      title: `${worker.rig}/${worker.name}`,
      description: "Session not running - may need restart",
      status: "unresponsive",
      href: `/worker/${encodeURIComponent(worker.rig)}/${encodeURIComponent(worker.name)}`,
    })
  }

  return items
}

function getBudgetAttentionItems(guzzoline: GuzzolineStats | null): AttentionItem[] {
  if (!guzzoline || guzzoline.budget_warnings === 0) return []

  return [{
    id: "budget-warning",
    type: "budget",
    title: `${guzzoline.budget_warnings} Budget Warning${guzzoline.budget_warnings > 1 ? "s" : ""}`,
    description: "Token budget exceeded - review usage patterns",
    status: "slow",
  }]
}

function formatRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return ""
  }
}

interface AttentionItemRowProps {
  item: AttentionItem
}

function AttentionItemRow({ item }: AttentionItemRowProps) {
  const iconMap = {
    worker: "terminal" as const,
    budget: "fuel" as const,
    stale: "clock" as const,
    convoy: "road" as const,
  }

  const content = (
    <div className="flex items-center justify-between py-3 border-b border-chrome-border/30 last:border-0 -mx-4 px-4 transition-colors hover:bg-carbon-black/30">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-sm bg-rust-orange/10 text-rust-orange">
          <Icon name={iconMap[item.type]} aria-label="" size="sm" />
        </div>
        <div className="min-w-0">
          <p className="body-text font-medium truncate">{item.title}</p>
          <p className="caption text-ash truncate">{item.description}</p>
        </div>
      </div>
      <StatusBadge status={item.status} size="sm" />
    </div>
  )

  if (item.href) {
    return <Link href={item.href}>{content}</Link>
  }

  return content
}

export function AttentionRequired({ polecats, guzzoline, loading = false }: AttentionRequiredProps) {
  const workerItems = getWorkerAttentionItems(polecats)
  const budgetItems = getBudgetAttentionItems(guzzoline)
  const allItems = [...workerItems, ...budgetItems]

  // Sort by severity: dead/stopped > blocked > slow > unresponsive
  const severityOrder: Record<Status, number> = {
    dead: 0,
    stopped: 0,
    blocked: 1,
    slow: 2,
    unresponsive: 3,
    thinking: 4,
    active: 5,
    done: 6,
    refinery_queued: 7,
    refinery_rebasing: 7,
    refinery_testing: 7,
    refinery_merging: 7,
  }
  allItems.sort((a, b) => (severityOrder[a.status] ?? 5) - (severityOrder[b.status] ?? 5))

  const hasItems = allItems.length > 0

  return (
    <Panel className={hasItems ? "border-rust-orange/30" : ""}>
      <PanelHeader
        icon="alert-triangle"
        iconVariant={hasItems ? "alert" : "muted"}
        title="Attention Required"
        actions={
          <span className="caption text-ash">
            {loading ? "—" : `${allItems.length} item${allItems.length !== 1 ? "s" : ""}`}
          </span>
        }
      />
      <PanelBody className="p-0">
        {loading ? (
          <div className="p-4 text-center">
            <p className="caption text-ash">Checking status...</p>
          </div>
        ) : !hasItems ? (
          <div className="p-6 text-center">
            <div className="inline-flex p-3 rounded-sm bg-acid-green/10 text-acid-green mb-3">
              <Icon name="check-circle" aria-label="" size="lg" />
            </div>
            <p className="body-text text-bone">All systems nominal</p>
            <p className="caption text-ash mt-1">No items require attention</p>
          </div>
        ) : (
          <div className="px-4">
            {allItems.map((item) => (
              <AttentionItemRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
