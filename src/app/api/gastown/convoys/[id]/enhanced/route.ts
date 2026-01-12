import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/gastown/convoys/[id]/enhanced
 *
 * Returns enhanced convoy status with per-bead journey states.
 * Includes:
 * - Bead journey stages (queued, hooked, in_progress, pr_ready, refinery, merged)
 * - Refinery queue positions
 * - Idle duration and needsNudge flags
 * - Summary counts by stage
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const enhancedConvoy = await gastown.getEnhancedConvoyStatus(id);
    return NextResponse.json(enhancedConvoy);
  } catch (error) {
    console.error("Failed to fetch enhanced convoy status:", error);
    return NextResponse.json(
      { error: "Failed to fetch enhanced convoy status" },
      { status: 500 }
    );
  }
}
