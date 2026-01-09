"use client"

import { ErrorBoundary, ErrorPanel } from "@/components/ui"
import { type ReactNode } from "react"

interface ErrorWrapperProps {
  children: ReactNode
}

/**
 * Client-side error wrapper for the main layout.
 * Catches any unhandled React errors and displays an error panel.
 */
export function ErrorWrapper({ children }: ErrorWrapperProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="max-w-2xl mx-auto mt-8">
          <ErrorPanel
            title="Application Error"
            message="Something went wrong"
            details="An unexpected error occurred. Please try refreshing the page."
            onRetry={() => window.location.reload()}
          />
        </div>
      }
      onError={(error, errorInfo) => {
        // Log to console in development
        console.error("[ErrorWrapper] Caught error:", error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
