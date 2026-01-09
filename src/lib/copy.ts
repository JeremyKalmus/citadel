/**
 * Gas Town Copy Constants
 * DS2: Firm, grounded language. No jokes needed.
 *
 * "Reinforces theme without harming clarity."
 */

// ═══════════════════════════════════════════════════════════════════════════
// STATE MESSAGES
// Standard UI states translated to Gas Town vernacular
// ═══════════════════════════════════════════════════════════════════════════

export const COPY = {
  // Loading states
  LOADING: 'Awaiting signal',
  LOADING_DATA: 'Awaiting signal...',
  REFRESHING: 'Refreshing fuel lines',

  // Empty states
  NO_DATA: 'No active convoys',
  EMPTY: 'System idle',
  NO_RESULTS: 'Nothing on the horizon',
  NO_ITEMS: 'Bay empty',

  // Error states
  ERROR: 'Blocked by Keeper',
  ERROR_GENERIC: 'Signal lost',
  ERROR_NETWORK: 'Fuel line severed',
  ERROR_TIMEOUT: 'Signal timed out',
  ERROR_PERMISSION: 'Access denied by Keeper',

  // Success states
  SUCCESS: 'Mission complete',
  SAVED: 'Locked in',
  CREATED: 'Forged',
  UPDATED: 'Recalibrated',
  DELETED: 'Scrapped',

  // Action labels
  SUBMIT: 'Engage',
  CANCEL: 'Abort',
  RETRY: 'Retry signal',
  CONFIRM: 'Confirm',
  DELETE: 'Scrap',
  SAVE: 'Lock in',

  // Navigation
  BACK: 'Return',
  NEXT: 'Proceed',
  HOME: 'Command',

  // Status
  ONLINE: 'Operational',
  OFFLINE: 'Dark',
  ACTIVE: 'Running',
  INACTIVE: 'Idle',
  PENDING: 'Queued',
  BLOCKED: 'Blocked',
  COMPLETE: 'Complete',

  // Time
  JUST_NOW: 'Just now',
  MOMENTS_AGO: 'Moments ago',
  RECENTLY: 'Recently',
  NEVER: 'Never engaged',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get a loading message, optionally with a subject
 */
export function loadingMessage(subject?: string): string {
  if (subject) {
    return `Awaiting ${subject} signal`
  }
  return COPY.LOADING
}

/**
 * Get an empty state message for a specific entity
 */
export function emptyMessage(entity: string): string {
  return `No ${entity} in the bay`
}

/**
 * Get an error message with optional details
 */
export function errorMessage(details?: string): string {
  if (details) {
    return `${COPY.ERROR}: ${details}`
  }
  return COPY.ERROR
}

// Type for copy keys
export type CopyKey = keyof typeof COPY
