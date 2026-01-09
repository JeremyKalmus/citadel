import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { gastown } from "@/lib/gastown";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rig = searchParams.get("rig");

    const polecats = rig
      ? await gastown.getPolecats(rig)
      : await gastown.getAllPolecats();

    return NextResponse.json(polecats);
  } catch (error) {
    console.error("Failed to fetch polecats:", error);
    return NextResponse.json(
      { error: "Failed to fetch polecats" },
      { status: 500 }
    );
  }
}
