import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import type { Match } from "@/lib/matches";

export interface MatchPreview {
  headline: string;
  prediction: string;
  predictedWinner: string;
  confidence: number;
  keyPlayers: { name: string; team: string; reason: string }[];
  pitchReport: string;
  headToHead: string;
  source: "gemini" | "mock";
}

export async function POST(req: Request) {
  const { match }: { match: Match } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json(getMockPreview(match));

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a cricket expert analyst for IPL 2026. Generate an engaging pre-match preview.

Match: ${match.teamA} vs ${match.teamB}
Venue: ${match.venue}
Date/Time: ${match.status}

Return ONLY valid JSON (no markdown fences) with this exact structure:
{
  "headline": "one punchy, exciting headline for this match (max 12 words)",
  "prediction": "2-3 sentence prediction based on team strengths, recent form, and venue",
  "predictedWinner": "full team name — must be exactly '${match.teamA}' or '${match.teamB}'",
  "confidence": a number between 52 and 72,
  "keyPlayers": [
    {"name": "player full name", "team": "${match.teamA}", "reason": "specific reason why they are key today (1 sentence)"},
    {"name": "player full name", "team": "${match.teamB}", "reason": "specific reason why they are key today (1 sentence)"},
    {"name": "player full name", "team": "either team", "reason": "specific reason why they are key today (1 sentence)"}
  ],
  "pitchReport": "2 sentences about pitch conditions at ${match.venue} and how they affect batting and bowling",
  "headToHead": "1 concise sentence about recent IPL head-to-head record between these two teams",
  "source": "gemini"
}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(raw);
    return NextResponse.json({ ...data, source: "gemini" });
  } catch (err) {
    console.error("Gemini preview error:", err);
    return NextResponse.json(getMockPreview(match));
  }
}

function getMockPreview(match: Match): MatchPreview {
  const venue = match.venue.split(",")[0];
  return {
    headline: `${match.teamA} vs ${match.teamB} — IPL 2026 Showdown`,
    prediction: `${match.teamA} head into this fixture with strong recent form at ${venue}. The toss will be crucial — teams batting second have a slight edge at this venue. Expect a close contest with the outcome likely decided in the death overs.`,
    predictedWinner: match.teamA,
    confidence: 58,
    keyPlayers: [
      {
        name: "Rohit Sharma",
        team: match.teamA,
        reason: "His explosive starts set the tone for the entire innings and he loves batting at this venue.",
      },
      {
        name: "Jasprit Bumrah",
        team: match.teamB,
        reason: "Death-over specialist who can swing matches with his yorkers in the final four overs.",
      },
      {
        name: "Virat Kohli",
        team: match.teamA,
        reason: "In sublime form this season with three consecutive fifty-plus scores.",
      },
    ],
    pitchReport: `The ${venue} pitch typically offers good pace and bounce early, easing out by the second innings. Spinners will come into play in the middle overs, making a 170+ total the par score.`,
    headToHead: `These two sides have met 28 times in IPL history with ${match.teamA} winning 16 of those encounters.`,
    source: "mock",
  };
}
