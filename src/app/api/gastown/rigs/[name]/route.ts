import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

interface Params {
  params: Promise<{ name: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { name } = await params;
    const rig = await gastown.getRig(name);

    if (!rig) {
      return NextResponse.json(
        { error: `Rig '${name}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(rig);
  } catch (error) {
    console.error("Failed to fetch rig:", error);
    return NextResponse.json(
      { error: "Failed to fetch rig" },
      { status: 500 }
    );
  }
}
