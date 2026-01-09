import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rig, name, force = false } = body;

    if (!rig || !name) {
      return NextResponse.json(
        { error: "Missing required fields: rig, name" },
        { status: 400 }
      );
    }

    await gastown.nukePolecat(rig, name, force);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to kill polecat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to kill polecat" },
      { status: 500 }
    );
  }
}
