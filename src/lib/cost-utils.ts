// Cost utilities - safe for client-side use

export interface SparklinePoint {
  timestamp: string;
  value: number;
}

// Claude API pricing (per million tokens)
const PRICING = {
  input: 3.0,      // $3 per 1M input tokens
  output: 15.0,    // $15 per 1M output tokens
  cache_read: 0.30 // $0.30 per 1M cached tokens
};

export interface FormatCostOptions {
  compact?: boolean;
}

/**
 * Format a cost value as a USD string
 */
export function formatCost(cents: number, options: FormatCostOptions = {}): string {
  const { compact = false } = options;
  const dollars = cents / 100;

  if (compact) {
    if (dollars < 0.01) return "<$0.01";
    if (dollars < 1) return `$${dollars.toFixed(2)}`;
    if (dollars < 100) return `$${dollars.toFixed(1)}`;
    return `$${Math.round(dollars)}`;
  }

  return `$${dollars.toFixed(2)}`;
}

/**
 * Calculate USD cost from token counts
 */
export function calculateCost(tokens: {
  input?: number;
  output?: number;
  cache_read?: number;
}): number {
  const inputCost = ((tokens.input || 0) / 1_000_000) * PRICING.input;
  const outputCost = ((tokens.output || 0) / 1_000_000) * PRICING.output;
  const cacheCost = ((tokens.cache_read || 0) / 1_000_000) * PRICING.cache_read;

  // Return cost in cents
  return Math.round((inputCost + outputCost + cacheCost) * 100);
}
