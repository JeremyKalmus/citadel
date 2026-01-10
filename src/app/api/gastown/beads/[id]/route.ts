import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bead = await gastown.getBeadDetail(id);
    return NextResponse.json(bead);
  } catch (error) {
    console.error("Failed to fetch bead:", error);
    return NextResponse.json(
      { error: "Failed to fetch bead" },
      { status: 500 }
    );
  }
}
