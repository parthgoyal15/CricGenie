import { NextRequest, NextResponse } from "next/server";

export type RoomVibe = "ELECTRIC" | "TENSE" | "CELEBRATION" | "CALM" | "NERVOUS";

export interface RoomInsight {
  text: string;
  vibe: RoomVibe;
}

const FALLBACK_INSIGHTS: RoomInsight[] = [
  {
    text: "📊 At this run rate, the batting side needs one big over to shift the momentum completely.",
    vibe: "TENSE",
  },
  {
    text: "🎯 The bowler has been exceptional — only 2 boundaries conceded in the last 4 overs. Outstanding discipline.",
    vibe: "CALM",
  },
  {
    text: "💡 Historically, teams losing 2 wickets in the powerplay in T20s win only 34% of the time. High stakes here.",
    vibe: "NERVOUS",
  },
  {
    text: "🔥 The crowd energy is feeding the batting side — three boundaries in the last 8 balls. This is unstoppable cricket.",
    vibe: "ELECTRIC",
  },
  {
    text: "🏆 This partnership is now worth 60+ runs. The longer it goes, the more it shifts the balance decisively.",
    vibe: "ELECTRIC",
  },
];

function detectVibe(recentEvents: string[]): RoomVibe {
  const text = recentEvents.join(" ").toLowerCase();
  if (text.includes("wicket") || text.includes("out") || text.includes("lbw"))
    return "TENSE";
  if (text.includes("six") || text.includes("boundary") || text.includes("four"))
    return "ELECTRIC";
  if (text.includes("dot") || text.includes("maiden"))
    return "NERVOUS";
  return "CALM";
}

export async function POST(req: NextRequest) {
  try {
    const { teamA, teamB, scoreA, overs, recentEvents, recentMessages } =
      await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const insight =
        FALLBACK_INSIGHTS[Math.floor(Math.random() * FALLBACK_INSIGHTS.length)];
      return NextResponse.json({ ...insight, source: "fallback" });
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const recentChat =
      Array.isArray(recentMessages) && recentMessages.length > 0
        ? recentMessages.slice(-5).map((m: {author:string;text:string}) => `${m.author}: ${m.text}`).join("\n")
        : "No messages yet";

    const prompt = `You are CricGenie AI — a smart, enthusiastic cricket expert participating in a live fan chat room during a match.

LIVE MATCH:
${teamA} vs ${teamB} | Score: ${scoreA} | Overs: ${overs}
Recent events: ${Array.isArray(recentEvents) ? recentEvents.join("; ") : "Match in progress"}

RECENT FAN MESSAGES:
${recentChat}

Post ONE insight into the fan room. It should feel like a smart fan sharing a gem — a stat, a tactical observation, a prediction, or a reaction to recent events. Start with a relevant emoji.

Max 25 words. No generic phrases. Reference specific match details.

Return ONLY valid JSON:
{
  "text": "the message text",
  "vibe": "ELECTRIC" | "TENSE" | "CELEBRATION" | "CALM" | "NERVOUS"
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(text);

    return NextResponse.json({ ...parsed, source: "gemini" });
  } catch (err) {
    console.error("room-insight error:", err);
    const { recentEvents = [] } = await req.json().catch(() => ({}));
    const vibe = detectVibe(recentEvents);
    const insight = FALLBACK_INSIGHTS.find((i) => i.vibe === vibe)
      ?? FALLBACK_INSIGHTS[Math.floor(Math.random() * FALLBACK_INSIGHTS.length)];
    return NextResponse.json({ ...insight, source: "fallback" });
  }
}
