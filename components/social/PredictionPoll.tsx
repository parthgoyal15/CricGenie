"use client";

import { useState, useEffect } from "react";
import { recordPrediction } from "@/lib/user-stats";

interface PredictionPollProps {
  matchId: string;
  question: string;
  initialYesVotes: number;
  initialNoVotes: number;
}

export default function PredictionPoll({
  matchId,
  question,
  initialYesVotes,
  initialNoVotes,
}: PredictionPollProps) {
  const [yesVotes, setYesVotes] = useState(initialYesVotes);
  const [noVotes, setNoVotes] = useState(initialNoVotes);
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`poll-${matchId}`);
    if (saved) setVoted(saved as "yes" | "no");
  }, [matchId]);

  const handleVote = (choice: "yes" | "no") => {
    if (voted) return;
    if (choice === "yes") setYesVotes((v) => v + 1);
    else setNoVotes((v) => v + 1);
    setVoted(choice);
    localStorage.setItem(`poll-${matchId}`, choice);
    recordPrediction(10);
  };

  const total = yesVotes + noVotes;
  const yesPercent = Math.round((yesVotes / total) * 100);
  const noPercent = 100 - yesPercent;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
      <div className="h-0.5 bg-gradient-to-r from-amber-500 to-yellow-400" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-400 text-base leading-none">🗳️</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none mb-0.5">Fan Vote</p>
              <p className="text-[11px] text-amber-400/60">
                {total.toLocaleString()} fans voted
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-[11px] font-bold tracking-widest">LIVE</span>
          </div>
        </div>

        {/* Question */}
        <p className="text-white font-semibold text-[15px] mb-5 leading-snug">{question}</p>

        {/* Vote buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(["yes", "no"] as const).map((choice) => {
            const isChosen = voted === choice;
            const isOther = voted !== null && voted !== choice;
            const count = choice === "yes" ? yesVotes : noVotes;
            const pct = choice === "yes" ? yesPercent : noPercent;
            const isYes = choice === "yes";

            return (
              <button
                key={choice}
                onClick={() => handleVote(choice)}
                disabled={!!voted}
                className={`relative overflow-hidden rounded-2xl py-5 border-2 transition-all duration-200 text-center select-none ${
                  isChosen
                    ? isYes
                      ? "border-emerald-500 bg-emerald-500/15"
                      : "border-red-500 bg-red-500/15"
                    : isOther
                    ? "border-zinc-800 bg-zinc-800/40 opacity-40 cursor-not-allowed"
                    : isYes
                    ? "border-emerald-500/30 bg-emerald-500/8 hover:border-emerald-500/60 hover:bg-emerald-500/12 cursor-pointer"
                    : "border-red-500/30 bg-red-500/8 hover:border-red-500/60 hover:bg-red-500/12 cursor-pointer"
                }`}
              >
                {/* Fill bar */}
                {voted && (
                  <div
                    className={`absolute inset-0 ${isYes ? "bg-emerald-500/8" : "bg-red-500/8"} transition-all duration-700 rounded-2xl`}
                    style={{ width: `${pct}%` }}
                  />
                )}
                <div className="relative z-10">
                  <p className={`text-xl font-black mb-1 ${
                    isChosen
                      ? isYes ? "text-emerald-300" : "text-red-300"
                      : isYes ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {isYes ? "YES" : "NO"}
                  </p>
                  {voted ? (
                    <>
                      <p className={`text-2xl font-black tabular-nums ${
                        isChosen
                          ? isYes ? "text-emerald-200" : "text-red-200"
                          : "text-zinc-500"
                      }`}>{pct}%</p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {count.toLocaleString()} votes
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-zinc-600">Tap to vote</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Breakdown bar */}
        {voted && (
          <div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                style={{ width: `${yesPercent}%` }}
              />
              <div className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-700 flex-1" />
            </div>
            <p className="text-center text-[11px] text-zinc-600 mt-2">
              +10 pts added · {total.toLocaleString()} total votes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
