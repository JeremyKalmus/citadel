import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

export async function GET() {
  try {
    const convoys = await gastown.getConvoys();
    return NextResponse.json(convoys);
  } catch (error) {
    console.error("Failed to fetch convoys:", error);
    return NextResponse.json(
      { error: "Failed to fetch convoys" },
      { status: 500 }
    );
  }
}
