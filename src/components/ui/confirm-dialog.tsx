"use client"

import { useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { ActionButton } from "./action-button"
import { X } from "lucide-react"

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "danger"
  loading?: boolean
  /** Child content (e.g., input fields) */
  children?: React.ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  children,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose()
      }
      // Enter to confirm (only if no children/inputs)
      if (e.key === "Enter" && !children && !loading) {
        e.preventDefault()
        onConfirm()
      }
    },
    [onClose, onConfirm, loading, children]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      // Focus the dialog
      dialogRef.current?.focus()
      // Prevent body scroll
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-carbon-black/80 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-md mx-4 p-6 rounded-sm",
          "bg-obsidian border-2 border-chrome-border",
          "shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className={cn(
            "absolute top-4 right-4 p-1 rounded-sm",
            "text-ash hover:text-bone hover:bg-gunmetal",
            "transition-colors disabled:opacity-50"
          )}
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <h2
          id="dialog-title"
          className={cn(
            "text-xl font-bold mb-2",
            variant === "danger" ? "text-status-dead" : "text-bone"
          )}
        >
          {title}
        </h2>

        {/* Description */}
        <p className="body-text-muted mb-4">{description}</p>

        {/* Optional children (e.g., input fields) */}
        {children && <div className="mb-4">{children}</div>}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <ActionButton
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </ActionButton>
          <ActionButton
            variant={variant === "danger" ? "danger" : "default"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </ActionButton>
        </div>

        {/* Keyboard hint */}
        <p className="mt-4 text-xs text-ash text-center">
          Press <kbd className="px-1 py-0.5 bg-gunmetal rounded text-bone">Esc</kbd> to cancel
          {!children && (
            <>, <kbd className="px-1 py-0.5 bg-gunmetal rounded text-bone">Enter</kbd> to confirm</>
          )}
        </p>
      </div>
    </div>
  )
}
