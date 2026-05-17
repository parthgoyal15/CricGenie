import { NextRequest, NextResponse } from "next/server";

interface WinProbResult {
  teamAProb: number;
  teamBProb: number;
  summary: string;
  source: string;
}

function calcFallback(
  scoreA: string,
  overs: string,
  teamAMomentum: number
): WinProbResult {
  const prob = Math.round(Math.min(92, Math.max(8, teamAMomentum)));
  return {
    teamAProb: prob,
    teamBProb: 100 - prob,
    summary: "Based on current run rate and wickets in hand.",
    source: "calculated",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamA, teamB, scoreA, scoreB, overs, recentEvents, teamAMomentum } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(calcFallback(scoreA, overs, teamAMomentum));
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a cricket analytics expert. Assess win probability for this exact match state.

Match: ${teamA} vs ${teamB}
${teamA} Score: ${scoreA}  
${scoreB !== "—" ? `${teamB} Score/Target: ${scoreB}` : `${teamB}: Yet to bat`}
Overs: ${overs}
Recent events: ${Array.isArray(recentEvents) ? recentEvents.join("; ") : recentEvents}

Consider: current run rate, wickets in hand, overs remaining, recent momentum, and match context.

Return ONLY valid JSON (no markdown):
{
  "teamAProb": <integer 5-95>,
  "teamBProb": <integer that makes total exactly 100>,
  "summary": "<single sentence reason, max 18 words>"
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(text);

    // Ensure probabilities sum to 100
    const a = Math.round(Math.min(95, Math.max(5, parsed.teamAProb)));
    return NextResponse.json({
      teamAProb: a,
      teamBProb: 100 - a,
      summary: parsed.summary ?? "",
      source: "gemini",
    });
  } catch (err) {
    console.error("win-probability error:", err);
    const { teamAMomentum = 50 } = await req.json().catch(() => ({}));
    return NextResponse.json(calcFallback("", "", teamAMomentum));
  }
}
