import { NextRequest, NextResponse } from "next/server";
import { restartLocalProcess, startLocalProcess, stopLocalProcess } from "@/lib/local-supervisor/manager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { action?: string };

  try {
    if (body.action === "start") {
      return NextResponse.json(await startLocalProcess(id));
    }
    if (body.action === "stop") {
      return NextResponse.json(await stopLocalProcess(id));
    }
    if (body.action === "restart") {
      return NextResponse.json(await restartLocalProcess(id));
    }
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Action failed" }, { status: 400 });
  }
}
