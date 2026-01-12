"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTownStatus } from "@/hooks";
import { MailStatsGrid, MailTree, type MailStats } from "@/components/mail";
import { BeadsFilterTabs, BeadDetailModal } from "@/components/beads";
import { Breadcrumb } from "@/components/layout";
import { Panel, PanelHeader, PanelBody } from "@/components/ui";
import type { BeadsFilter, Bead, BeadsData } from "@/lib/gastown";
import { COMMUNICATION_TYPES, isStale } from "@/lib/bead-types";

export default function TownMailPage() {
  const [filter, setFilter] = useState<BeadsFilter>("all");
  const [hqBeads, setHqBeads] = useState<BeadsData | null>(null);
  const [beadsLoading, setBeadsLoading] = useState(true);
  const [selectedMail, setSelectedMail] = useState<Bead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Handle mail selection - open modal
  const handleMailSelect = useCallback((bead: Bead) => {
    setSelectedMail(bead);
    setModalOpen(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setSelectedMail(null), 200);
  }, []);

  // Fetch town status
  const { data: townStatus, isLoading: statusLoading } = useTownStatus({
    refreshInterval: 30000,
  });

  // Fetch HQ beads (town-level only)
  const fetchHqBeads = useCallback(async () => {
    setBeadsLoading(true);
    try {
      const res = await fetch("/api/gastown/beads");
      if (res.ok) {
        const data = await res.json();
        setHqBeads(data);
      }
    } catch {
      // Ignore errors
    }
    setBeadsLoading(false);
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchHqBeads();
  }, [fetchHqBeads]);

  const isLoading = statusLoading || beadsLoading;

  // Filter to communication types only
  const communicationBeads = useMemo(() => {
    if (!hqBeads?.beads) return [];
    return hqBeads.beads.filter((b) =>
      COMMUNICATION_TYPES.includes(b.issue_type?.toLowerCase() as typeof COMMUNICATION_TYPES[number])
    );
  }, [hqBeads]);

  // Apply status filter
  const filteredBeads = useMemo(() => {
    let beads = communicationBeads;

    switch (filter) {
      case "open":
        beads = beads.filter((b) => b.status === "open");
        break;
      case "in_progress":
        beads = beads.filter(
          (b) => b.status === "in_progress" || b.status === "hooked"
        );
        break;
      case "ready":
        // Ready = open with no blocking dependencies
        beads = beads.filter(
          (b) => b.status === "open" && (!b.depends_on || b.depends_on.length === 0)
        );
        break;
      case "blocked":
        beads = beads.filter((b) => b.depends_on && b.depends_on.length > 0);
        break;
      case "closed":
        beads = beads.filter((b) => b.status === "closed");
        break;
    }

    return beads;
  }, [communicationBeads, filter]);

  // Calculate mail-specific stats
  const stats: MailStats | null = useMemo(() => {
    if (!communicationBeads.length) return null;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    let recent = 0;
    let pending = 0;
    let fromMayor = 0;
    let fromWitness = 0;
    let fromDeacon = 0;
    let stale = 0;

    for (const bead of communicationBeads) {
      const updated = new Date(bead.updated_at).getTime();
      const status = bead.status.toLowerCase();
      const createdBy = ((bead as unknown as { created_by?: string }).created_by || "").toLowerCase();

      // Recent = within 24 hours
      if (now - updated < oneDayMs) {
        recent++;
      }

      // Pending = open or hooked
      if (status === "open" || status === "hooked" || status === "in_progress") {
        pending++;
      }

      // Count by sender
      if (createdBy.includes("mayor")) {
        fromMayor++;
      } else if (createdBy.includes("witness")) {
        fromWitness++;
      } else if (createdBy.includes("deacon")) {
        fromDeacon++;
      }

      // Stale = older than 7 days
      if (isStale(bead.updated_at)) {
        stale++;
      }
    }

    return {
      total: communicationBeads.length,
      recent,
      pending,
      fromMayor,
      fromWitness,
      fromDeacon,
      stale,
    };
  }, [communicationBeads]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Town Mail", href: "/mail" }]} />
        <div className="flex items-center justify-center py-12">
          <span className="text-ash">Loading mail...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Town Mail", href: "/mail" }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-bone">Town Mail</h1>
        <BeadsFilterTabs value={filter} onChange={setFilter} />
      </div>

      <MailStatsGrid stats={stats} isLoading={isLoading} />

      {/* Town-level communications grouped by convoy */}
      <Panel>
        <PanelHeader
          icon="mail"
          title="Communications"
          actions={
            <span className="text-xs text-ash">
              {filteredBeads.length} items
              {stats?.stale ? ` (${stats.stale} stale)` : ""}
            </span>
          }
        />
        <PanelBody className="p-0">
          <MailTree
            beads={filteredBeads}
            onMailSelect={handleMailSelect}
            selectedMailId={selectedMail?.id}
          />
        </PanelBody>
      </Panel>

      {filteredBeads.length === 0 && (
        <Panel>
          <PanelBody>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-ash">No communications found matching filter</span>
              <span className="text-xs text-ash mt-1">
                Showing mail, handoffs, messages, and convoys
              </span>
            </div>
          </PanelBody>
        </Panel>
      )}

      {/* Detail Modal (reuse from beads) */}
      <BeadDetailModal
        bead={selectedMail}
        open={modalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}
