import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rig, name, message } = body;

    if (!rig || !name || !message) {
      return NextResponse.json(
        { error: "Missing required fields: rig, name, message" },
        { status: 400 }
      );
    }

    await gastown.nudgePolecat(rig, name, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to nudge polecat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to nudge polecat" },
      { status: 500 }
    );
  }
}
