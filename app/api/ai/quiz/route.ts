import { NextRequest, NextResponse } from "next/server";

const FALLBACK_QUIZZES = [
  {
    question: "Who holds the record for the fastest T20I century?",
    options: ["Rohit Sharma", "David Warner", "Hazratullah Zazai", "Chris Gayle"],
    answer: "Hazratullah Zazai",
    explanation:
      "Hazratullah Zazai scored 100 off just 40 balls for Afghanistan in 2019 — the fastest T20I century ever recorded.",
  },
  {
    question: "How many deliveries make up a standard cricket over?",
    options: ["4", "5", "6", "8"],
    answer: "6",
    explanation:
      "A cricket over consists of exactly 6 legal deliveries bowled consecutively by the same bowler.",
  },
  {
    question: "Which player has won the most FIFA World Cup Golden Boots?",
    options: ["Ronaldo", "Messi", "Müller", "Fontaine"],
    answer: "Müller",
    explanation:
      "Gerd Müller won 2 World Cup Golden Boots (1970 & shared 1974) with 14 total tournament goals — the most ever.",
  },
  {
    question: "What is the maximum runs possible off a single delivery?",
    options: ["4", "6", "7", "5"],
    answer: "7",
    explanation:
      "7 runs is possible — 6 for the hit plus 1 no-ball penalty. Extremely rare but technically permissible.",
  },
  {
    question: "Which team won the inaugural T20 Cricket World Cup in 2007?",
    options: ["Australia", "Pakistan", "India", "Sri Lanka"],
    answer: "India",
    explanation:
      "India beat Pakistan by 5 runs in the final held in Johannesburg, South Africa to win the first ever T20 World Cup.",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamA, teamB, sport, matchContext } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const quiz =
        FALLBACK_QUIZZES[Math.floor(Math.random() * FALLBACK_QUIZZES.length)];
      return NextResponse.json({ ...quiz, source: "fallback" });
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate a ${sport || "cricket"} trivia question specifically relevant to a live match between ${teamA} and ${teamB}. Match context: ${matchContext || "exciting live match"}.

Return ONLY a valid JSON object with exactly these fields (no markdown, no code blocks):
{
  "question": "the trivia question",
  "options": ["option1", "option2", "option3", "option4"],
  "answer": "the correct option (must exactly match one of the options)",
  "explanation": "brief 1-2 sentence explanation"
}

Make the question specific, interesting, and relevant to the teams or current match context.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const quiz = JSON.parse(text);

    return NextResponse.json({ ...quiz, source: "gemini" });
  } catch {
    const quiz =
      FALLBACK_QUIZZES[Math.floor(Math.random() * FALLBACK_QUIZZES.length)];
    return NextResponse.json({ ...quiz, source: "fallback" });
  }
}
