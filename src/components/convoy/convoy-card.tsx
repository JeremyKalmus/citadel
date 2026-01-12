"use client";

import Link from "next/link";
import { StatusBadge, type Status } from "@/components/ui";
import type { Convoy, Bead } from "@/lib/gastown";
import { Circle, ChevronRight, Container } from "lucide-react";

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
}

function mapConvoyStatusToStatus(status: string): Status {
  switch (status.toLowerCase()) {
    case "active":
    case "running":
      return "active";
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

export function ConvoyCard({ convoy, beads, beadsLoading }: ConvoyCardProps) {
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
