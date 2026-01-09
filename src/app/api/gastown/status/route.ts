import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

export async function GET() {
  try {
    const status = await gastown.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Failed to fetch town status:", error);
    return NextResponse.json(
      { error: "Failed to fetch town status" },
      { status: 500 }
    );
  }
}
