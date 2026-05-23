import { NextResponse } from "next/server";

import { getServerRun } from "@/lib/run-storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const run = getServerRun(id);

  if (!run) {
    return NextResponse.json(
      {
        error: {
          code: "PARSE_FAILED",
          message: "Run not found. It may have expired or was created in another session.",
          stage: "api/runs/[id]",
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json(run);
}
