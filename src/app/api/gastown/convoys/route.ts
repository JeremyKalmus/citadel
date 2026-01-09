import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { gastown } from "@/lib/gastown";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rig = searchParams.get("rig");

    const convoys = rig
      ? await gastown.getRigConvoys(rig)
      : await gastown.getConvoys();

    return NextResponse.json(convoys);
  } catch (error) {
    console.error("Failed to fetch convoys:", error);
    return NextResponse.json(
      { error: "Failed to fetch convoys" },
      { status: 500 }
    );
  }
}
