import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";

interface RouteParams {
  params: Promise<{
    rig: string;
    name: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { rig, name } = await params;
    const { searchParams } = new URL(request.url);
    const baseBranch = searchParams.get("base") || "main";

    const gitActivity = await gastown.getWorkerGitActivity(rig, name, baseBranch);
    return NextResponse.json(gitActivity);
  } catch (error) {
    console.error("Failed to fetch worker git activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch worker git activity" },
      { status: 500 }
    );
  }
}
