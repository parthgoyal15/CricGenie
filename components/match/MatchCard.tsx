"use client";

import Link from "next/link";
import type { Match } from "@/lib/matches";
import { BallIcon, PitchIcon } from "@/components/ui/CricketIcons";

function MatchStatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "LIVE" || s === "IN PROGRESS") {
    return (
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        <span className="text-red-400 text-[11px] font-bold tracking-widest">LIVE</span>
      </div>
    );
  }
  if (s === "RESULT" || s.includes("WON") || s.includes("WIN") || s.includes("BEAT")) {
    return (
      <span className="text-zinc-400 text-[11px] font-medium bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
        Result
      </span>
    );
  }
  return (
    <span className="text-sky-400 text-[11px] font-medium bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
      {status}
    </span>
  );
}

function ScoreRow({
  team,
  score,
  isBatting,
  highlight,
}: {
  team: string;
  score: string;
  isBatting: boolean;
  highlight: boolean;
}) {
  const noScore = score === "Yet to bat" || score === "—";
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {isBatting && (
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
        )}
        <span
          className={`font-bold leading-tight truncate text-base ${
            highlight ? "text-white" : "text-zinc-500"
          }`}
        >
          {team}
        </span>
      </div>
      <div className="text-right flex-shrink-0">
        {noScore ? (
          <span className="text-zinc-700 text-sm font-medium">{score}</span>
        ) : (
          (() => {
            // Split "156/4 (15.3 ov)" into score + overs
            const match = score.match(/^([\d/]+)\s*(\(.+\))?$/);
            const runs = match?.[1] ?? score;
            const overs = match?.[2] ?? "";
            return (
              <span className="flex items-baseline gap-1.5 justify-end">
                <span
                  className={`text-xl font-black tabular-nums tracking-tight ${
                    highlight ? "text-white" : "text-zinc-500"
                  }`}
                >
                  {runs}
                </span>
                {overs && (
                  <span className="text-zinc-600 text-xs font-medium">{overs}</span>
                )}
              </span>
            );
          })()
        )}
      </div>
    </div>
  );
}

export default function MatchCard({ match }: { match: Match }) {
  const isLive =
    match.status.toUpperCase() === "LIVE" ||
    match.status.toUpperCase() === "IN PROGRESS";

  const isResult =
    match.status.toUpperCase() === "RESULT" ||
    match.status.toUpperCase().includes("WON");

  // For completed matches, determine winner from matchContext
  const ctx = match.matchContext.toLowerCase();
  const teamAWon =
    isResult &&
    ctx.includes(match.teamA.toLowerCase().split(" ")[0]) &&
    (ctx.includes("won") || ctx.includes("win"));

  // For live: which team is currently batting
  const secondInningsStarted =
    match.scoreB !== "Yet to bat" && match.scoreB !== "—";
  const teamABatting = isLive && !secondInningsStarted;
  const teamBBatting = isLive && secondInningsStarted;

  // Highlight logic
  const highlightA = isResult ? teamAWon : (!secondInningsStarted);
  const highlightB = isResult ? !teamAWon : secondInningsStarted;

  const hoverBorder = isResult ? "hover:border-amber-500/30" : "hover:border-green-500/40";
  const hoverGlow   = isResult
    ? "from-amber-500/[0.04]"
    : "from-green-500/[0.03]";

  return (
    <Link href={`/match/${match.id}`}>
      <div className={`group relative bg-zinc-900 border border-zinc-800 ${hoverBorder} rounded-2xl p-5 transition-all duration-200 hover:bg-zinc-900/80 cursor-pointer overflow-hidden`}>
        {/* Hover glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${hoverGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <MatchStatusBadge status={match.status} />
          <div className="flex items-center gap-1.5 min-w-0">
            <PitchIcon size={12} className="opacity-50 flex-shrink-0 text-zinc-500" />
            <span className="truncate text-xs text-zinc-500 font-medium">{match.venue}</span>
          </div>
        </div>

        {/* Scores */}
        <div className="space-y-3 mb-4">
          <ScoreRow
            team={match.teamA}
            score={match.scoreA}
            isBatting={teamABatting}
            highlight={highlightA}
          />
          <ScoreRow
            team={match.teamB}
            score={match.scoreB}
            isBatting={teamBBatting}
            highlight={highlightB}
          />
        </div>

        {/* Match context / result line */}
        {match.matchContext ? (
          <div
            className={`text-xs font-medium px-3 py-2 rounded-xl mb-3 truncate ${
              isResult
                ? "bg-amber-500/8 border border-amber-500/20 text-amber-300"
                : isLive
                ? "bg-red-500/8 border border-red-500/20 text-red-300"
                : "bg-sky-500/8 border border-sky-500/20 text-sky-300"
            }`}
          >
            {match.matchContext}
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
          <span className="text-zinc-700 text-xs font-medium">{match.overs}</span>
          {isResult ? (
            <span className="text-amber-400 text-xs font-semibold group-hover:text-amber-300 transition-colors inline-flex items-center gap-1">
              View Summary
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
          ) : (
            <span className="text-green-400 text-xs font-semibold group-hover:text-green-300 transition-colors inline-flex items-center gap-1">
              Join to Engage
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
