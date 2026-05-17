import { NextResponse } from "next/server";
import { getLiveMatches } from "@/lib/cricket-api";

export type { Match } from "@/lib/matches";

export async function GET() {
  const { currentMatches, pastMatches, isLive } = await getLiveMatches();
  return NextResponse.json({ matches: currentMatches, pastMatches, isLive });
}
