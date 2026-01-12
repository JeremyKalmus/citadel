"use client"

import { useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { BeadDetailPanel } from "./bead-detail-panel"
import { EpicDetailPanel } from "./epic-detail-panel"
import { useBeadDetail, useEpicChildren } from "@/hooks"
import { X } from "lucide-react"
import type { Bead } from "@/lib/gastown"

export interface BeadDetailModalProps {
  /** The bead to display (basic info from tree) */
  bead: Bead | null
  /** Whether the modal is open */
  open: boolean
  /** Callback when modal is closed */
  onClose: () => void
}

/**
 * Modal overlay for displaying bead details.
 * Fetches full bead details when opened.
 */
export function BeadDetailModal({
  bead,
  open,
  onClose,
}: BeadDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Check if this is an epic
  const isEpic = bead?.issue_type === "epic"

  // Fetch full bead details (only when modal is open with a bead)
  const { data: beadDetail, isLoading, error } = useBeadDetail({
    id: open && bead ? bead.id : "",
  })

  // Fetch epic children (only when displaying an epic)
  const {
    children: epicChildren,
    isLoading: childrenLoading,
    error: childrenError,
  } = useEpicChildren(open && isEpic && bead ? bead.id : "")

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      dialogRef.current?.focus()
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, handleKeyDown])

  if (!open || !bead) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bead-detail-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-carbon-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-4xl mx-4 rounded-sm",
          "bg-obsidian border-2 border-chrome-border",
          "shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-gunmetal border-b border-chrome-border">
          <div className="min-w-0 flex-1">
            <h2
              id="bead-detail-title"
              className="text-xl font-bold text-bone truncate"
            >
              {bead.title}
            </h2>
            <p className="text-sm text-ash font-mono">{bead.id}</p>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "ml-4 p-2 rounded-sm flex-shrink-0",
              "text-ash hover:text-bone hover:bg-carbon-black/50",
              "transition-colors"
            )}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {(isLoading || (isEpic && childrenLoading)) && (
            <div className="flex items-center justify-center py-12">
              <span className="text-ash">Loading {isEpic ? "epic" : "bead"} details...</span>
            </div>
          )}

          {(error || (isEpic && childrenError)) && (
            <div className="flex items-center justify-center py-12">
              <span className="text-status-dead">Failed to load {isEpic ? "epic" : "bead"} details</span>
            </div>
          )}

          {beadDetail && !isLoading && !error && (
            isEpic ? (
              <EpicDetailPanel
                epic={beadDetail}
                children={epicChildren}
                loading={childrenLoading}
                compact={false}
              />
            ) : (
              <BeadDetailPanel
                bead={beadDetail}
                loading={false}
                compact={false}
              />
            )
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 bg-gunmetal border-t border-chrome-border">
          <p className="text-xs text-ash text-center">
            Press <kbd className="px-1 py-0.5 bg-carbon-black rounded text-bone">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}
