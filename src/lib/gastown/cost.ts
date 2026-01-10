/**
 * USD Cost Calculation for Token Usage
 *
 * Calculates costs based on Anthropic's Claude API pricing.
 * Prices are per 1 million tokens.
 */

import type {
  TokenCounts,
  ModelPricing,
  CostBreakdown,
  TokenUsageWithCost,
} from "./types";

// ============================================================================
// Anthropic Pricing (per 1M tokens, as of 2025)
// ============================================================================

/** Default pricing for Claude models */
export const CLAUDE_PRICING: Record<string, ModelPricing> = {
  // Claude Opus 4.5 / Opus 4
  "claude-opus-4-5-20251101": {
    model: "claude-opus-4-5-20251101",
    input_per_million: 15.0,
    output_per_million: 75.0,
    cache_read_per_million: 1.5, // 10% of input
    cache_write_per_million: 18.75, // 125% of input
  },
  "claude-opus-4-20250514": {
    model: "claude-opus-4-20250514",
    input_per_million: 15.0,
    output_per_million: 75.0,
    cache_read_per_million: 1.5,
    cache_write_per_million: 18.75,
  },
  // Claude Sonnet 4
  "claude-sonnet-4-20250514": {
    model: "claude-sonnet-4-20250514",
    input_per_million: 3.0,
    output_per_million: 15.0,
    cache_read_per_million: 0.3,
    cache_write_per_million: 3.75,
  },
  // Claude 3.5 Sonnet (legacy)
  "claude-3-5-sonnet-20241022": {
    model: "claude-3-5-sonnet-20241022",
    input_per_million: 3.0,
    output_per_million: 15.0,
    cache_read_per_million: 0.3,
    cache_write_per_million: 3.75,
  },
  // Claude Haiku
  "claude-3-5-haiku-20241022": {
    model: "claude-3-5-haiku-20241022",
    input_per_million: 0.8,
    output_per_million: 4.0,
    cache_read_per_million: 0.08,
    cache_write_per_million: 1.0,
  },
  "claude-3-haiku-20240307": {
    model: "claude-3-haiku-20240307",
    input_per_million: 0.25,
    output_per_million: 1.25,
    cache_read_per_million: 0.025,
    cache_write_per_million: 0.3125,
  },
};

/** Default model to use when model is unknown */
export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// ============================================================================
// Cost Calculation Functions
// ============================================================================

/**
 * Get pricing for a model, falling back to default if unknown.
 */
export function getModelPricing(model?: string): ModelPricing {
  if (model && CLAUDE_PRICING[model]) {
    return CLAUDE_PRICING[model];
  }

  // Try to match by prefix (e.g., "claude-opus" matches opus pricing)
  if (model) {
    const lowerModel = model.toLowerCase();
    if (lowerModel.includes("opus")) {
      return CLAUDE_PRICING["claude-opus-4-20250514"];
    }
    if (lowerModel.includes("haiku")) {
      return CLAUDE_PRICING["claude-3-5-haiku-20241022"];
    }
    if (lowerModel.includes("sonnet")) {
      return CLAUDE_PRICING["claude-sonnet-4-20250514"];
    }
  }

  return CLAUDE_PRICING[DEFAULT_MODEL];
}

/**
 * Calculate USD cost from token counts.
 *
 * @param tokens - Token counts (input, output, cache_read, cache_write)
 * @param model - Optional model name for pricing lookup
 * @returns Cost breakdown in USD
 */
export function calculateCost(
  tokens: TokenCounts,
  model?: string
): CostBreakdown {
  const pricing = getModelPricing(model);

  const inputCost = (tokens.input / 1_000_000) * pricing.input_per_million;
  const outputCost = (tokens.output / 1_000_000) * pricing.output_per_million;
  const cacheReadCost =
    (tokens.cache_read / 1_000_000) * pricing.cache_read_per_million;
  const cacheWriteCost =
    ((tokens.cache_write || 0) / 1_000_000) *
    (pricing.cache_write_per_million || 0);

  return {
    input_cost: roundCurrency(inputCost),
    output_cost: roundCurrency(outputCost),
    cache_read_cost: roundCurrency(cacheReadCost),
    cache_write_cost: roundCurrency(cacheWriteCost),
    total_cost: roundCurrency(
      inputCost + outputCost + cacheReadCost + cacheWriteCost
    ),
    currency: "USD",
  };
}

/**
 * Calculate cost and return with token data.
 */
export function calculateTokenUsageWithCost(
  tokens: TokenCounts,
  model?: string
): TokenUsageWithCost {
  return {
    tokens,
    cost: calculateCost(tokens, model),
    model: model || DEFAULT_MODEL,
  };
}

/**
 * Sum multiple token counts.
 */
export function sumTokenCounts(counts: TokenCounts[]): TokenCounts {
  return counts.reduce(
    (acc, curr) => ({
      input: acc.input + curr.input,
      output: acc.output + curr.output,
      cache_read: acc.cache_read + curr.cache_read,
      cache_write: (acc.cache_write || 0) + (curr.cache_write || 0),
      total: acc.total + curr.total,
    }),
    {
      input: 0,
      output: 0,
      cache_read: 0,
      cache_write: 0,
      total: 0,
    }
  );
}

/**
 * Sum multiple cost breakdowns.
 */
export function sumCostBreakdowns(costs: CostBreakdown[]): CostBreakdown {
  const sum = costs.reduce(
    (acc, curr) => ({
      input_cost: acc.input_cost + curr.input_cost,
      output_cost: acc.output_cost + curr.output_cost,
      cache_read_cost: acc.cache_read_cost + curr.cache_read_cost,
      cache_write_cost: acc.cache_write_cost + curr.cache_write_cost,
      total_cost: acc.total_cost + curr.total_cost,
      currency: "USD" as const,
    }),
    {
      input_cost: 0,
      output_cost: 0,
      cache_read_cost: 0,
      cache_write_cost: 0,
      total_cost: 0,
      currency: "USD" as const,
    }
  );

  // Round final sums
  return {
    input_cost: roundCurrency(sum.input_cost),
    output_cost: roundCurrency(sum.output_cost),
    cache_read_cost: roundCurrency(sum.cache_read_cost),
    cache_write_cost: roundCurrency(sum.cache_write_cost),
    total_cost: roundCurrency(sum.total_cost),
    currency: "USD",
  };
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Round to currency precision (2 decimal places for display, 4 for calculation).
 */
function roundCurrency(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/**
 * Format cost for display.
 *
 * @param cost - Cost in USD
 * @param options - Formatting options
 * @returns Formatted string like "$1.23" or "$0.0012"
 */
export function formatCost(
  cost: number,
  options: { compact?: boolean; showCents?: boolean } = {}
): string {
  const { compact = false, showCents = true } = options;

  if (compact) {
    if (cost >= 1000) {
      return `$${(cost / 1000).toFixed(1)}k`;
    }
    if (cost >= 1) {
      return `$${cost.toFixed(2)}`;
    }
    if (cost >= 0.01) {
      return `$${cost.toFixed(2)}`;
    }
    // Very small costs
    return `$${cost.toFixed(4)}`;
  }

  if (showCents && cost < 0.01 && cost > 0) {
    // Show fractional cents for very small costs
    return `$${cost.toFixed(4)}`;
  }

  return `$${cost.toFixed(2)}`;
}

/**
 * Format token count for display.
 *
 * @param tokens - Number of tokens
 * @returns Formatted string like "1.2M" or "45K" or "1,234"
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toLocaleString();
}

/**
 * Calculate cost per token (useful for efficiency metrics).
 */
export function costPerToken(cost: CostBreakdown, tokens: TokenCounts): number {
  if (tokens.total === 0) return 0;
  return cost.total_cost / tokens.total;
}

/**
 * Estimate cost for a given number of tokens using default pricing.
 * Assumes typical 3:1 output:input ratio.
 */
export function estimateCost(
  totalTokens: number,
  model?: string,
  outputRatio: number = 0.25
): number {
  const outputTokens = Math.round(totalTokens * outputRatio);
  const inputTokens = totalTokens - outputTokens;

  const cost = calculateCost(
    {
      input: inputTokens,
      output: outputTokens,
      cache_read: 0,
      total: totalTokens,
    },
    model
  );

  return cost.total_cost;
}
