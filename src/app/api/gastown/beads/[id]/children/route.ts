import { NextResponse } from "next/server";
import { gastown } from "@/lib/gastown";
import { calculateEpicProgress } from "@/lib/gastown/types";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/gastown/beads/[id]/children
 *
 * Fetches children of an epic bead.
 * Uses `bd list --parent <epicId>` to find all issues with this epic as parent.
 *
 * @returns { children: Bead[], progress: EpicProgress }
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch children using the gastown client
    const children = await gastown.getEpicChildren(id);

    // Calculate progress stats from children
    const progress = calculateEpicProgress(children);

    return NextResponse.json({
      children,
      progress,
      epicId: id,
    });
  } catch (error) {
    console.error("Failed to fetch epic children:", error);

    // Return empty result rather than error for missing/no-children cases
    if (
      error instanceof Error &&
      error.message.includes("not found")
    ) {
      return NextResponse.json(
        {
          children: [],
          progress: {
            total: 0,
            open: 0,
            inProgress: 0,
            blocked: 0,
            deferred: 0,
            closed: 0,
            percentComplete: 0,
          },
          epicId: "",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch epic children" },
      { status: 500 }
    );
  }
}
