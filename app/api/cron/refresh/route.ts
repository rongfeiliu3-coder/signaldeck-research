import { NextRequest, NextResponse } from "next/server";
import { refreshResearchWorkspace } from "@/lib/research/workspace";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const result = await refreshResearchWorkspace();
  return NextResponse.json(result);
}
