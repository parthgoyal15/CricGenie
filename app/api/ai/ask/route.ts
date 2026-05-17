import { NextRequest, NextResponse } from "next/server";

const FALLBACK_ANSWERS = [
  "That's a great question! Based on the current match situation, the team with more wickets in hand has a significant advantage in the final overs.",
  "Cricket is a game of fine margins — the captain's field placement and bowling changes here could be the difference between victory and defeat.",
  "Historically, teams batting first at this venue average around 165-175 in T20s. This score puts the batting side in a strong position.",
];

export async function POST(req: NextRequest) {
  try {
    const { question, match } = await req.json();
    const { teamA, teamB, scoreA, scoreB, overs, recentEvents, sport, venue } =
      match ?? {};

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        answer:
          FALLBACK_ANSWERS[Math.floor(Math.random() * FALLBACK_ANSWERS.length)],
        source: "fallback",
      });
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert cricket analyst watching this live match. Answer the fan's question with specific, insightful knowledge.

LIVE MATCH CONTEXT:
- Match: ${teamA} vs ${teamB} (${sport ?? "Cricket"})
- Venue: ${venue ?? "Unknown"}
- Score: ${teamA} ${scoreA} | ${teamB} ${scoreB !== "—" ? scoreB : "yet to bat"}
- Overs: ${overs}
- Recent events: ${Array.isArray(recentEvents) ? recentEvents.join("; ") : recentEvents ?? "Match in progress"}

FAN QUESTION: "${question}"

Answer in 2-3 sentences. Be direct, specific, and reference the current match context where relevant. No bullet points, no markdown.`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    return NextResponse.json({ answer, source: "gemini" });
  } catch (err) {
    console.error("ask error:", err);
    return NextResponse.json({
      answer:
        FALLBACK_ANSWERS[Math.floor(Math.random() * FALLBACK_ANSWERS.length)],
      source: "fallback",
    });
  }
}
