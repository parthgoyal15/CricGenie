"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrophyIcon, BallIcon } from "@/components/ui/CricketIcons";

const MOCK_BOARD = [
  { rank: 1, name: "CricketFan99", predictions: 45, quizzes: 12, score: 810 },
  { rank: 2, name: "SportsPundit", predictions: 38, quizzes: 15, score: 760 },
  { rank: 3, name: "MatchGuru", predictions: 42, quizzes: 10, score: 720 },
  { rank: 4, name: "LiveScore_X", predictions: 30, quizzes: 18, score: 660 },
  { rank: 5, name: "FanZone2024", predictions: 35, quizzes: 14, score: 630 },
  { rank: 6, name: "GoalsAndMore", predictions: 28, quizzes: 11, score: 530 },
  { rank: 7, name: "PitchPerfect", predictions: 22, quizzes: 9, score: 400 },
  { rank: 8, name: "BoundaryKing", predictions: 18, quizzes: 7, score: 320 },
];

const MEDALS = ["🥇", "🥈", "🥉"];
const TOP_COLORS = ["text-yellow-400", "text-zinc-300", "text-orange-400"];
const TOP_BG = [
  "bg-yellow-400/10 border-yellow-400/20",
  "bg-zinc-300/10 border-zinc-300/20",
  "bg-orange-400/10 border-orange-400/20",
];

export default function LeaderboardPage() {
  const [myScore, setMyScore] = useState(0);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    const score = parseInt(localStorage.getItem("predictionScore") || "0");
    setMyScore(score);
    if (score > 0) {
      const idx = MOCK_BOARD.findIndex((e) => score > e.score);
      setMyRank(idx === -1 ? MOCK_BOARD.length + 1 : idx + 1);
    }
  }, []);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors mb-6"
      >
        ← Back to Live
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1.5">
          <TrophyIcon size={28} />
          <h1 className="text-3xl font-black">Leaderboard</h1>
        </div>
        <p className="text-zinc-500 text-sm">
          Top prediction &amp; quiz scorers this week
        </p>
      </div>

      {myScore > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-green-300">Your Score</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {myRank ? `Rank #${myRank} on the board` : "Keep playing to climb!"}
            </p>
          </div>
          <span className="text-4xl font-black text-green-400 tabular-nums">
            {myScore}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {MOCK_BOARD.map((entry, i) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-4 p-4 rounded-2xl border ${
              i < 3 ? TOP_BG[i] : "bg-zinc-900 border-zinc-800"
            }`}
          >
            <span
              className={`w-8 text-center flex-shrink-0 flex items-center justify-center ${
                i < 3 ? "text-xl" : "text-zinc-600 font-bold text-base"
              } ${i < 3 ? TOP_COLORS[i] : ""}`}
            >
              {i < 3 ? MEDALS[i] : (
                <span className="flex items-center gap-1">
                  <BallIcon size={12} className="opacity-40" />
                  <span>{entry.rank}</span>
                </span>
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold text-sm truncate ${
                  i < 3 ? TOP_COLORS[i] : "text-white"
                }`}
              >
                {entry.name}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {entry.predictions} predictions · {entry.quizzes} quizzes
              </p>
            </div>
            <span
              className={`text-xl font-black tabular-nums flex-shrink-0 ${
                i < 3 ? TOP_COLORS[i] : "text-zinc-300"
              }`}
            >
              {entry.score}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
        <p className="text-zinc-500 text-sm mb-3">
          Earn points by voting on predictions and answering quiz questions
        </p>
        <Link
          href="/"
          className="inline-block bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
        >
          Watch Live Matches →
        </Link>
      </div>
    </main>
  );
}
