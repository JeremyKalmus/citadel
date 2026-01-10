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
    const decodedId = decodeURIComponent(id);
    const beads = await gastown.getBeadsForConvoy(decodedId);
    return NextResponse.json(beads);
  } catch (error) {
    console.error("Failed to fetch convoy beads:", error);
    return NextResponse.json(
      { error: "Failed to fetch convoy beads" },
      { status: 500 }
    );
  }
}
