"use client";

import { use } from "react";
import Link from "next/link";
import { ActionButton, Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { Breadcrumb } from "@/components/layout";
import { ArrowLeft } from "lucide-react";

interface BeadPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Placeholder page - full implementation in ct-016 (2D-2: Detail View)
export default function BeadPage({ params }: BeadPageProps) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Beads", href: "/beads" },
          { label: decodedId },
        ]}
      />

      <div className="flex items-center gap-4">
        <Link href="/beads">
          <ActionButton variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </ActionButton>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-bone font-mono">{decodedId}</h1>
          <p className="text-sm text-ash mt-1">Bead Detail View</p>
        </div>
      </div>

      <Panel>
        <PanelHeader icon="activity" title="Issue Details" />
        <PanelBody>
          <div className="text-center py-8">
            <Icon name="cog" aria-label="Work in progress" size="xl" variant="muted" className="mx-auto mb-4" />
            <p className="text-bone">Detail view coming soon</p>
            <p className="text-xs text-ash mt-2">
              Full bead detail view is being implemented in Phase 2D-2
            </p>
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
