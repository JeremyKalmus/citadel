import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

export async function GET() {
  try {
    const stats = await gastown.getGuzzolineStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to get guzzoline stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch guzzoline stats" },
      { status: 500 }
    );
  }
}
