import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { gastown } from "@/lib/gastown";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rig = searchParams.get("rig") || undefined;

    const beadsData = await gastown.getBeads(rig);

    return NextResponse.json(beadsData);
  } catch (error) {
    console.error("Failed to fetch beads:", error);
    return NextResponse.json(
      { error: "Failed to fetch beads" },
      { status: 500 }
    );
  }
}
