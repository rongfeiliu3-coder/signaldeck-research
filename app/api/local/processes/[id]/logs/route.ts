import { NextResponse } from "next/server";
import { readLocalProcessLogs } from "@/lib/local-supervisor/manager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    return NextResponse.json({ id, logs: readLocalProcessLogs(id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to read logs" }, { status: 404 });
  }
}
