"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge, type Status } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import type { Convoy, Bead, EnhancedConvoyDetail } from "@/lib/gastown";
import { Circle, ChevronRight, ChevronDown, ChevronUp, Container } from "lucide-react";
import { BeadStatusRow } from "./bead-status-row";
import { useEnhancedConvoyDetail } from "@/hooks";

/**
 * Extract unique rigs from bead assignees.
 * Parses paths like "citadel/polecats/furiosa" to get "citadel".
 */
function extractRigsFromBeads(beads: Bead[]): string[] {
  const rigs = new Set<string>();

  for (const bead of beads) {
    if (bead.assignee) {
      const parts = bead.assignee.split("/");
      if (parts.length >= 2) {
        rigs.add(parts[0]);
      }
    }
  }

  return Array.from(rigs);
}

interface ConvoyCardProps {
  convoy: Convoy;
  beads?: Bead[];
  beadsLoading?: boolean;
  /** Enable expandable mode with enhanced data */
  expandable?: boolean;
}

function mapConvoyStatusToStatus(status: string): Status {
  switch (status.toLowerCase()) {
    case "active":
    case "running":
      return "active";
    case "open":
    case "pending":
    case "queued":
      return "thinking";
    case "blocked":
      return "blocked";
    case "completed":
    case "done":
      return "done";
    case "failed":
    case "error":
      return "dead";
    default:
      return "thinking";
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

interface BeadsSummary {
  total: number;
  active: number;
  blocked: number;
  done: number;
}

function calculateBeadsSummary(beads: Bead[]): BeadsSummary {
  const summary: BeadsSummary = {
    total: beads.length,
    active: 0,
    blocked: 0,
    done: 0,
  };

  for (const bead of beads) {
    switch (bead.status.toLowerCase()) {
      case "in_progress":
      case "hooked":
        summary.active++;
        break;
      case "blocked":
        summary.blocked++;
        break;
      case "closed":
      case "completed":
      case "done":
        summary.done++;
        break;
    }
  }

  return summary;
}

function BeadsSummaryBadges({ beads }: { beads: Bead[] }) {
  const summary = calculateBeadsSummary(beads);

  if (summary.total === 0) return null;

  return (
    <div className="flex items-center gap-2 text-[10px]">
      {summary.active > 0 && (
        <span className="flex items-center gap-0.5 text-status-active">
          <Circle className="w-1.5 h-1.5 fill-current" />
          {summary.active}
        </span>
      )}
      {summary.blocked > 0 && (
        <span className="flex items-center gap-0.5 text-status-blocked">
          <Circle className="w-1.5 h-1.5 fill-current" />
          {summary.blocked}
        </span>
      )}
      <span className="text-ash">
        {summary.done}/{summary.total}
      </span>
    </div>
  );
}

/**
 * RigIndicators - Shows which rigs are processing this convoy's work.
 * Helps users understand the convoy → rig relationship at a glance.
 */
function RigIndicators({ beads }: { beads: Bead[] }) {
  const rigs = extractRigsFromBeads(beads);

  if (rigs.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {rigs.map((rig) => (
        <span
          key={rig}
          className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-gunmetal text-[9px] text-ash font-mono"
          title={`Processed by rig: ${rig}`}
        >
          <Container className="w-2 h-2" />
          {rig}
        </span>
      ))}
    </div>
  );
}

/**
 * Enhanced summary text from EnhancedConvoyDetail.
 */
function EnhancedSummaryText({ data }: { data: EnhancedConvoyDetail }) {
  const parts: string[] = [];

  if (data.summary.working > 0) {
    parts.push(`${data.summary.working} working`);
  }
  if (data.summary.inRefinery > 0) {
    parts.push(`${data.summary.inRefinery} in refinery`);
  }
  if (data.summary.needsNudge > 0) {
    parts.push(`${data.summary.needsNudge} needs nudge`);
  }

  if (parts.length === 0) {
    if (data.summary.merged > 0) {
      return <span className="text-acid-green">{data.summary.merged} merged</span>;
    }
    if (data.summary.queued > 0) {
      return <span className="text-ash">{data.summary.queued} queued</span>;
    }
    return null;
  }

  return (
    <span className="text-xs">
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && " | "}
          {part.includes("nudge") ? (
            <span className="text-rust-orange">{part}</span>
          ) : part.includes("refinery") ? (
            <span className="text-fuel-yellow">{part}</span>
          ) : (
            <span className="text-ash">{part}</span>
          )}
        </span>
      ))}
    </span>
  );
}

export function ConvoyCard({ convoy, beads, beadsLoading, expandable = false }: ConvoyCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Only fetch enhanced data when expandable and expanded
  const { data: enhancedData, isLoading: enhancedLoading } = useEnhancedConvoyDetail({
    id: convoy.id,
    refreshInterval: expanded ? 5000 : 0, // Only poll when expanded
  });

  // Handle expand toggle
  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Non-expandable mode - original behavior with RigIndicators
  if (!expandable) {
    return (
      <Link
        href={`/convoy/${encodeURIComponent(convoy.id)}`}
        className="flex items-center justify-between px-4 py-3 hover:bg-carbon-black/30 transition-mechanical group"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-bone truncate group-hover:text-white transition-colors">
              {convoy.title || convoy.id}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-ash font-mono">{convoy.id}</span>
            <span className="text-xs text-ash">{formatDate(convoy.created_at)}</span>
            {beadsLoading ? (
              <span className="text-[10px] text-ash">loading beads...</span>
            ) : beads && beads.length > 0 ? (
              <>
                <BeadsSummaryBadges beads={beads} />
                <RigIndicators beads={beads} />
              </>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={mapConvoyStatusToStatus(convoy.status)} size="sm" />
          <ChevronRight className="w-4 h-4 text-ash opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    );
  }

  // Expandable mode
  return (
    <div className="border-b border-chrome-border/30 last:border-b-0">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 hover:bg-carbon-black/30 transition-mechanical group">
        {/* Expand button */}
        <button
          onClick={handleExpandClick}
          className="p-1 -ml-1 mr-2 rounded hover:bg-chrome-border/30 transition-colors"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-ash" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ash" />
          )}
        </button>

        {/* Main content - clickable link */}
        <Link
          href={`/convoy/${encodeURIComponent(convoy.id)}`}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-bone truncate group-hover:text-white transition-colors">
              {convoy.title || convoy.id}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-ash font-mono">{convoy.id}</span>
            <span className="text-xs text-ash">{formatDate(convoy.created_at)}</span>
            {/* Show enhanced summary when available */}
            {enhancedData ? (
              <EnhancedSummaryText data={enhancedData} />
            ) : beadsLoading ? (
              <span className="text-[10px] text-ash">loading beads...</span>
            ) : beads && beads.length > 0 ? (
              <BeadsSummaryBadges beads={beads} />
            ) : null}
          </div>
        </Link>

        {/* Status and refinery indicator */}
        <div className="flex items-center gap-2">
          {enhancedData && enhancedData.summary.inRefinery > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rust-orange/20 text-rust-orange">
              {enhancedData.summary.inRefinery} in MQ
            </span>
          )}
          <StatusBadge status={mapConvoyStatusToStatus(convoy.status)} size="sm" />
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-chrome-border/30 bg-carbon-black/20">
          {enhancedLoading ? (
            <div className="px-4 py-4 text-center text-ash text-sm">
              Loading bead details...
            </div>
          ) : enhancedData && enhancedData.beadStates.length > 0 ? (
            <div className="divide-y divide-chrome-border/20">
              {enhancedData.beadStates.map((bead) => (
                <BeadStatusRow key={bead.beadId} bead={bead} />
              ))}
            </div>
          ) : (
            <div className="px-4 py-4 text-center text-ash text-sm">
              No beads in this convoy
            </div>
          )}
        </div>
      )}
    </div>
  );
}
