"use client"

import { Panel, PanelHeader, PanelBody, StatusBadge, type Status } from "@/components/ui"
import { Icon } from "@/components/ui/icon"

interface StatusDetail {
  label: string
  value: string | React.ReactNode
}

interface StatusExplanationProps {
  status: Status
  title?: string
  details: StatusDetail[]
  explanation?: string
  loading?: boolean
}

const statusExplanations: Record<Status, string> = {
  active: "Worker is running and processing tasks. Session is active with ongoing work.",
  thinking: "Worker is processing a complex operation. This may take some time.",
  slow: "Worker is operational but running slower than expected. May be resource constrained.",
  unresponsive: "Worker session exists but is not responding. May need attention.",
  dead: "Worker session has terminated. Manual intervention may be required.",
  blocked: "Worker is waiting on a dependency or external condition to proceed.",
  done: "Worker has completed its assigned tasks successfully.",
}

function DetailRow({ label, value }: StatusDetail) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-chrome-border/30 last:border-0">
      <span className="label text-ash">{label}</span>
      <span className="body-text font-medium">
        {typeof value === "string" ? value : value}
      </span>
    </div>
  )
}

export function StatusExplanation({
  status,
  title = "Current Status",
  details,
  explanation,
  loading = false,
}: StatusExplanationProps) {
  const displayExplanation = explanation || statusExplanations[status]

  return (
    <Panel>
      <PanelHeader
        icon="activity"
        title={title}
        actions={<StatusBadge status={status} size="sm" />}
      />
      <PanelBody>
        {loading ? (
          <div className="text-center py-2">
            <p className="caption text-ash">Loading status...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status explanation */}
            <div className="p-3 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <div className="flex gap-2">
                <Icon name="brain" aria-label="" variant="muted" size="sm" className="flex-shrink-0 mt-0.5" />
                <p className="caption text-ash leading-relaxed">
                  {displayExplanation}
                </p>
              </div>
            </div>

            {/* Detail rows */}
            {details.length > 0 && (
              <div>
                {details.map((detail, index) => (
                  <DetailRow key={index} {...detail} />
                ))}
              </div>
            )}
          </div>
        )}
      </PanelBody>
    </Panel>
  )
}
