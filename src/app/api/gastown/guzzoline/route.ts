import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const enhanced = searchParams.get("enhanced") === "true";
    const withConvoys = searchParams.get("convoys") === "true";

    // Convoy stats include enhanced stats
    if (withConvoys) {
      const stats = await gastown.getGuzzolineStatsWithConvoys();
      return NextResponse.json(stats);
    }

    const stats = enhanced
      ? await gastown.getEnhancedGuzzolineStats()
      : await gastown.getGuzzolineStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to get guzzoline stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch guzzoline stats" },
      { status: 500 }
    );
  }
}
