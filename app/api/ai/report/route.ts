import { NextRequest, NextResponse } from "next/server";

export interface MatchReport {
  headline: string;
  summary: string;
  keyMoments: string[];
  playerRatings: { name: string; team: string; rating: number; note: string }[];
  manOfMatch: string;
  manOfMatchReason: string;
  source: string;
}

function fallbackReport(
  teamA: string,
  teamB: string,
  scoreA: string
): MatchReport {
  return {
    headline: `${teamA} put up a commanding total against ${teamB}`,
    summary: `In a thrilling encounter, ${teamA} posted ${scoreA} on the board in their allotted overs. The innings was built on solid contributions throughout the batting order, with the lower middle-order providing crucial acceleration in the final overs.\n\n${teamB} will need to bat exceptionally well to chase this down. Their top-order will be key — a strong powerplay start is essential to keep the asking rate manageable.`,
    keyMoments: [
      "Solid opening partnership set the platform",
      "Key wicket in the middle overs shifted momentum",
      "Explosive last-over hitting boosted the total",
    ],
    playerRatings: [
      { name: `${teamA} Opener`, team: teamA, rating: 8.5, note: "Anchored the innings brilliantly" },
      { name: `${teamB} Pacer`, team: teamB, rating: 7.5, note: "Consistently hit good areas" },
      { name: `${teamA} Finisher`, team: teamA, rating: 8.0, note: "Provided the perfect launch at the death" },
    ],
    manOfMatch: `${teamA} Opener`,
    manOfMatchReason: "Controlled knock that set up the big total",
    source: "fallback",
  };
}

export async function POST(req: NextRequest) {
  try {
    const { match } = await req.json();
    const { teamA, teamB, scoreA, scoreB, overs, recentEvents, venue } =
      match ?? {};

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(fallbackReport(teamA, teamB, scoreA));
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate a detailed post-match cricket report for this match.

Match: ${teamA} vs ${teamB}
Venue: ${venue}
${teamA}: ${scoreA} in ${overs}
${scoreB !== "—" ? `${teamB}: ${scoreB}` : `${teamB}: Yet to bat`}
Key events: ${Array.isArray(recentEvents) ? recentEvents.join("; ") : recentEvents}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "headline": "Compelling 8-12 word match headline",
  "summary": "Two paragraphs (separated by \\n\\n) covering the match narrative, 80-100 words total",
  "keyMoments": ["moment 1", "moment 2", "moment 3", "moment 4"],
  "playerRatings": [
    {"name": "Player Name", "team": "Team Name", "rating": 8.5, "note": "10-12 word note"},
    {"name": "Player Name", "team": "Team Name", "rating": 7.0, "note": "10-12 word note"},
    {"name": "Player Name", "team": "Team Name", "rating": 9.0, "note": "10-12 word note"},
    {"name": "Player Name", "team": "Team Name", "rating": 6.5, "note": "10-12 word note"}
  ],
  "manOfMatch": "Player full name",
  "manOfMatchReason": "One sentence reason (max 20 words)"
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const report = JSON.parse(text);

    return NextResponse.json({ ...report, source: "gemini" });
  } catch (err) {
    console.error("report error:", err);
    const { match } = await req.json().catch(() => ({ match: {} }));
    return NextResponse.json(
      fallbackReport(match?.teamA ?? "Team A", match?.teamB ?? "Team B", match?.scoreA ?? "—")
    );
  }
}
