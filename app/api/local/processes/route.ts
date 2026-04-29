import { NextResponse } from "next/server";
import { getLocalSupervisorState } from "@/lib/local-supervisor/manager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await getLocalSupervisorState());
}
