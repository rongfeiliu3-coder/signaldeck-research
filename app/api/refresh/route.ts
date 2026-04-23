import { NextResponse } from "next/server";
import { refreshResearchWorkspace } from "@/lib/research/workspace";

export async function POST() {
  const result = await refreshResearchWorkspace();
  return NextResponse.json(result);
}
