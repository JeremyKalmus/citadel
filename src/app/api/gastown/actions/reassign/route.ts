import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceRig, sourceName, targetRig, targetName } = body;

    if (!sourceRig || !sourceName || !targetRig || !targetName) {
      return NextResponse.json(
        { error: "Missing required fields: sourceRig, sourceName, targetRig, targetName" },
        { status: 400 }
      );
    }

    await gastown.reassignPolecat(sourceRig, sourceName, targetRig, targetName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reassign polecat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reassign polecat" },
      { status: 500 }
    );
  }
}
