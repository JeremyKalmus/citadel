import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

interface RouteParams {
  params: Promise<{
    rig: string;
    name: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { rig, name } = await params;
    const polecat = await gastown.getPolecatStatus(rig, name);
    return NextResponse.json(polecat);
  } catch (error) {
    console.error("Failed to fetch polecat status:", error);
    return NextResponse.json(
      { error: "Failed to fetch polecat status" },
      { status: 500 }
    );
  }
}
