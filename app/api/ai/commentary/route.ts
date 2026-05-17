import { NextRequest, NextResponse } from "next/server";

export type CommentaryType =
  | "WICKET"
  | "SIX"
  | "FOUR"
  | "DOT"
  | "ANALYSIS"
  | "UPDATE";

export interface CommentaryEntry {
  type: CommentaryType;
  text: string;
  highlight: boolean;
}

// Seeded fallbacks tied to specific event types so they feel contextual
const FALLBACK_BY_EVENT: Record<string, CommentaryEntry> = {
  SIX: {
    type: "SIX",
    text: "What a strike! The ball sails high over deep mid-wicket and lands well into the stands. The crowd erupts.",
    highlight: true,
  },
  FOUR: {
    type: "FOUR",
    text: "Crisp timing through the covers — the fielder barely moved. That's pure class from the batsman.",
    highlight: false,
  },
  Wicket: {
    type: "WICKET",
    text: "Gone! The bowler strikes at a crucial moment — that wicket could completely change the complexion of this innings.",
    highlight: true,
  },
  wicket: {
    type: "WICKET",
    text: "Huge wicket! The pressure of that dismissal will be felt for the rest of this innings.",
    highlight: true,
  },
};

const FALLBACK_GENERIC: CommentaryEntry[] = [
  {
    type: "ANALYSIS",
    text: "The captain's tactical shift is working — tighter lines, better economy, and the pressure is building visibly.",
    highlight: false,
  },
  {
    type: "UPDATE",
    text: "Every dot ball here is gold. The fielding side is executing the plan to perfection in these crucial overs.",
    highlight: false,
  },
  {
    type: "ANALYSIS",
    text: "The run rate is creeping up — the batting side needs a boundary in the next two overs or the asking rate becomes dangerous.",
    highlight: false,
  },
  {
    type: "UPDATE",
    text: "The partnership is building steadily. Rotating strike, not taking risks — exactly what this situation demands.",
    highlight: false,
  },
];

function pickFallback(recentEvents: string[]): CommentaryEntry {
  for (const event of recentEvents) {
    for (const keyword of Object.keys(FALLBACK_BY_EVENT)) {
      if (event.includes(keyword)) return FALLBACK_BY_EVENT[keyword];
    }
  }
  return FALLBACK_GENERIC[Math.floor(Math.random() * FALLBACK_GENERIC.length)];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamA, teamB, scoreA, overs, recentEvents } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        entry: pickFallback(recentEvents ?? []),
        source: "fallback",
      });
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const eventsText = Array.isArray(recentEvents)
      ? recentEvents.join("; ")
      : "Match in progress";

    const prompt = `You are a live cricket broadcaster narrating a T20 match ball-by-ball.

MATCH STATE:
${teamA} vs ${teamB} | Score: ${scoreA} | Overs: ${overs}
Most recent events: ${eventsText}

Generate ONE commentary entry for the MOST RECENT event listed above.

Rules:
- Be vivid, specific, and broadcast-quality (think: Harsha Bhogle, Ravi Shastri)
- Reference player names and match situation directly
- Max 40 words — punchy and immediate
- No emojis

Return ONLY valid JSON (no markdown):
{
  "type": "WICKET" | "SIX" | "FOUR" | "DOT" | "ANALYSIS" | "UPDATE",
  "text": "the commentary line",
  "highlight": true or false
}

Use "highlight: true" for WICKET and SIX only.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const entry: CommentaryEntry = JSON.parse(text);

    return NextResponse.json({ entry, source: "gemini" });
  } catch {
    const { recentEvents = [] } = await req.json().catch(() => ({}));
    return NextResponse.json({
      entry: pickFallback(recentEvents),
      source: "fallback",
    });
  }
}
