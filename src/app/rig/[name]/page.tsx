"use client";

import { use } from "react";
import Link from "next/link";
import { Panel, ActionButton, StatusBadge } from "@/components/ui";
import { WorkerGrid, ConvoyList, RefineryHealth, MergeQueueStats } from "@/components/rig";
import { useRig, usePolecats, useConvoys } from "@/hooks";
import { ArrowLeft, RefreshCw, Container, Users, Eye, Cog } from "lucide-react";

interface RigPageProps {
  params: Promise<{ name: string }>;
}

export default function RigPage({ params }: RigPageProps) {
  const { name } = use(params);
  const { data: rig, isLoading: rigLoading, refresh: refreshRig } = useRig(name, { refreshInterval: 30000 });
  const { data: polecats, isLoading: polecatsLoading, refresh: refreshPolecats } = usePolecats({ rig: name, refreshInterval: 30000 });
  const { data: convoys, isLoading: convoysLoading, refresh: refreshConvoys } = useConvoys({ rig: name, refreshInterval: 30000 });

  const isLoading = rigLoading || polecatsLoading || convoysLoading;

  const handleRefresh = () => {
    refreshRig();
    refreshPolecats();
    refreshConvoys();
  };

  if (rigLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-ash hover:text-bone transition-mechanical">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-bone">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!rig) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-ash hover:text-bone transition-mechanical">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-bone">Rig Not Found</h1>
            <p className="body-text-muted mt-1">
              The rig &quot;{name}&quot; does not exist or is not available.
            </p>
          </div>
        </div>
        <Link href="/">
          <ActionButton>
            Return to Town Overview
          </ActionButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-ash hover:text-bone transition-mechanical">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Container className="w-8 h-8 text-bone" />
              <h1 className="text-4xl font-bold text-bone">{rig.name}</h1>
            </div>
            <p className="body-text-muted mt-1">
              Rig Dashboard
            </p>
          </div>
        </div>
        <ActionButton
          variant="ghost"
          onClick={handleRefresh}
          loading={isLoading}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </ActionButton>
      </div>

      {/* Rig stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="label">Workers</p>
              <p className="data-value mt-1">{rig.polecat_count}</p>
            </div>
            <Users className="w-6 h-6 text-ash" />
          </div>
        </Panel>
        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="label">Crews</p>
              <p className="data-value mt-1">{rig.crew_count}</p>
            </div>
            <Users className="w-6 h-6 text-ash" />
          </div>
        </Panel>
        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="label">Witness</p>
              <p className="data-value mt-1">
                {rig.has_witness ? (
                  <StatusBadge status="active" size="sm" />
                ) : (
                  <StatusBadge status="dead" size="sm" />
                )}
              </p>
            </div>
            <Eye className="w-6 h-6 text-ash" />
          </div>
        </Panel>
        <Panel className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="label">Refinery</p>
              <p className="data-value mt-1">
                {rig.has_refinery ? (
                  <StatusBadge status="active" size="sm" />
                ) : (
                  <StatusBadge status="dead" size="sm" />
                )}
              </p>
            </div>
            <Cog className="w-6 h-6 text-ash" />
          </div>
        </Panel>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkerGrid polecats={polecats || []} isLoading={polecatsLoading} />
        <ConvoyList convoys={convoys || []} isLoading={convoysLoading} />
      </div>

      {/* Refinery Health & Merge Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RefineryHealth rig={rig} isLoading={rigLoading} />
        {rig.has_refinery && rig.mq && (
          <MergeQueueStats mergeQueue={rig.mq} isLoading={rigLoading} />
        )}
      </div>
    </div>
  );
}
