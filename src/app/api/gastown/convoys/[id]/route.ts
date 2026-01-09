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
    const convoy = await gastown.getConvoyStatus(id);
    return NextResponse.json(convoy);
  } catch (error) {
    console.error("Failed to fetch convoy status:", error);
    return NextResponse.json(
      { error: "Failed to fetch convoy status" },
      { status: 500 }
    );
  }
}
