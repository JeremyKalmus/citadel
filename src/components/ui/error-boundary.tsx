"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { Panel, PanelHeader, PanelBody, ActionButton } from "@/components/ui"
import { Icon } from "@/components/ui/icon"
import { RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional fallback UI to show when an error occurs */
  fallback?: ReactNode
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Title shown in the error panel */
  title?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * DS2 Error Boundary
 * Catches React errors and displays an industrial-style error panel.
 * Provides retry functionality and error details.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorPanel
          title={this.props.title ?? "Component Error"}
          message={this.state.error?.message ?? "An unexpected error occurred"}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorPanelProps {
  title?: string
  message: string
  details?: string
  onRetry?: () => void
  className?: string
}

/**
 * DS2 Error Panel
 * Standalone error display component for non-boundary errors (API failures, etc.)
 */
export function ErrorPanel({
  title = "Error",
  message,
  details,
  onRetry,
  className,
}: ErrorPanelProps) {
  return (
    <Panel className={`border-rust-orange/30 ${className ?? ""}`}>
      <PanelHeader
        icon="x-circle"
        iconVariant="alert"
        title={title}
      />
      <PanelBody>
        <div className="flex flex-col items-center text-center py-4">
          <div className="p-3 rounded-sm bg-rust-orange/10 text-rust-orange mb-4">
            <Icon name="x-circle" aria-label="" size="lg" />
          </div>
          <p className="body-text text-bone mb-1">{message}</p>
          {details && (
            <p className="caption text-ash font-mono mt-2 p-2 bg-carbon-black rounded-sm max-w-full overflow-x-auto">
              {details}
            </p>
          )}
          {onRetry && (
            <ActionButton
              variant="secondary"
              onClick={onRetry}
              icon={<RefreshCw className="w-4 h-4" />}
              className="mt-4"
            >
              Retry
            </ActionButton>
          )}
        </div>
      </PanelBody>
    </Panel>
  )
}

interface ErrorMessageProps {
  message: string
  className?: string
}

/**
 * DS2 Inline Error Message
 * For displaying errors within existing UI (form fields, inline alerts, etc.)
 */
export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div className={`flex items-center gap-2 text-rust-orange ${className ?? ""}`}>
      <Icon name="exclamation-triangle" aria-label="" size="sm" />
      <span className="caption">{message}</span>
    </div>
  )
}

interface EmptyStateProps {
  icon?: "container" | "terminal" | "road" | "activity"
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * DS2 Empty State
 * For displaying when a list or view has no content.
 */
export function EmptyState({
  icon = "container",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center py-8 ${className ?? ""}`}>
      <div className="p-3 rounded-sm bg-gunmetal text-ash mb-4">
        <Icon name={icon} aria-label="" size="lg" />
      </div>
      <p className="body-text text-bone">{title}</p>
      {description && (
        <p className="caption text-ash mt-1">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  )
}
