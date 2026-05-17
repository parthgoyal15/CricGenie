import { notFound } from "next/navigation";
import Link from "next/link";
import { getLiveMatch } from "@/lib/cricket-api";
import { BallIcon, PitchIcon, TrophyIcon, StumpsIcon } from "@/components/ui/CricketIcons";
import AICommentary from "@/components/match/AICommentary";
import PredictionPoll from "@/components/social/PredictionPoll";
import FanQuiz from "@/components/social/FanQuiz";
import WinProbability from "@/components/match/WinProbability";
import AskGemini from "@/components/social/AskGemini";
import PostMatchReport from "@/components/match/PostMatchReport";
import SocialRoom from "@/components/social/SocialRoom";
import VisitTracker from "@/components/ui/VisitTracker";
import LiveTicker from "@/components/match/LiveTicker";
import PreMatchPreview from "@/components/match/PreMatchPreview";
import type { Match } from "@/lib/matches";

// ─── Shared score block ───────────────────────────────────────────────────────

function ScoreBlock({
  team, score, isWinner, accentClass,
}: {
  team: string; score: string; isWinner: boolean; accentClass: string;
}) {
  const noScore = score === "Yet to bat" || score === "—";
  const parts = score.match(/^([\d/]+)\s*(\(.+\))?$/);
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {isWinner && <TrophyIcon size={13} className="flex-shrink-0 opacity-80" />}
        <span className={`text-xl font-black leading-tight truncate ${isWinner ? "text-white" : "text-zinc-500"}`}>
          {team}
        </span>
      </div>
      {noScore ? (
        <span className="text-zinc-700 text-sm mt-1 flex-shrink-0">{score}</span>
      ) : (
        <div className="text-right flex-shrink-0">
          <span className={`text-3xl font-black tabular-nums tracking-tight ${isWinner ? accentClass : "text-zinc-500"}`}>
            {parts?.[1] ?? score}
          </span>
          {parts?.[2] && <p className="text-zinc-600 text-xs mt-0.5">{parts[2]}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Completed match (2-col) ──────────────────────────────────────────────────

function CompletedMatchPage({ match }: { match: Match }) {
  const ctx = match.matchContext.toLowerCase();
  const teamAKeyword = match.teamA.toLowerCase().split(" ").slice(-1)[0];
  const teamAWon = ctx.includes(teamAKeyword) && (ctx.includes("won") || ctx.includes("win"));
  const winnerName = teamAWon ? match.teamA : match.teamB;
  const loserName  = teamAWon ? match.teamB : match.teamA;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <VisitTracker matchId={match.id} />
      <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors mb-6">
        ← Back to Matches
      </Link>

      <div className="lg:grid lg:grid-cols-[420px_1fr] lg:gap-8 lg:items-start">

        {/* ── LEFT: Scorecard + Key Moments (sticky) ── */}
        <div className="lg:sticky lg:top-20 space-y-4 mb-6 lg:mb-0">

          {/* Final scorecard */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-amber-500 to-yellow-400" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-xs">
                  <BallIcon size={13} className="opacity-60 flex-shrink-0" />
                  <PitchIcon size={11} className="opacity-40 flex-shrink-0" />
                  <span className="text-zinc-600 truncate max-w-[200px]">{match.venue}</span>
                </div>
                <span className="text-amber-400 text-[11px] font-bold bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded-full">
                  FINAL
                </span>
              </div>
              <div className="space-y-4 mb-4">
                <ScoreBlock team={match.teamA} score={match.scoreA} isWinner={teamAWon}  accentClass="text-amber-400" />
                <ScoreBlock team={match.teamB} score={match.scoreB} isWinner={!teamAWon} accentClass="text-amber-400" />
              </div>
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2.5 flex items-center gap-3">
                <TrophyIcon size={18} />
                <div>
                  <p className="text-amber-300 text-sm font-bold">{winnerName}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{match.matchContext}</p>
                </div>
              </div>
              <p className="text-zinc-700 text-xs mt-3">{match.overs}</p>
            </div>
          </div>

          {/* Key Moments */}
          {match.recentEvents.length > 1 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-zinc-600 to-zinc-700" />
              <div className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                    <StumpsIcon size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-none mb-0.5">Key Moments</p>
                    <p className="text-[11px] text-zinc-600">Match highlights & turning points</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {match.recentEvents.slice(1).map((event, i) => (
                    <div key={i} className="flex items-start gap-2.5 py-1.5 border-b border-zinc-800/60 last:border-0">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-zinc-400 leading-snug">{event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-3 text-center">
            <p className="text-zinc-600 text-xs">
              <span className="text-zinc-400 font-semibold">{winnerName}</span>
              {" defeated "}
              <span className="text-zinc-400 font-semibold">{loserName}</span>
              {" · IPL 2026"}
            </p>
          </div>
        </div>

        {/* ── RIGHT: AI features ── */}
        <div className="space-y-4">
          <PostMatchReport match={match} autoGenerate />
          <AskGemini match={match} />
          <FanQuiz match={match} />
          <SocialRoom match={match} />
        </div>
      </div>
    </main>
  );
}

// ─── Live / upcoming match (2-col) ────────────────────────────────────────────

function LiveMatchPage({ match }: { match: Match }) {
  const isLiveMatch =
    match.status.toUpperCase() === "LIVE" ||
    match.status.toUpperCase() === "IN PROGRESS";

  const isUpcoming =
    !isLiveMatch && match.status.toUpperCase() !== "RESULT";

  const secondInningsStarted = match.scoreB !== "Yet to bat" && match.scoreB !== "—";

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <VisitTracker matchId={match.id} />
      <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors mb-6">
        ← Back to Live
      </Link>

      <div className="lg:grid lg:grid-cols-[420px_1fr] lg:gap-8 lg:items-start">

        {/* ── LEFT: Scorecard + Ticker/Preview + Win Probability (sticky) ── */}
        <div className="lg:sticky lg:top-20 space-y-4 mb-6 lg:mb-0">

          {/* Match Score Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-400" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-xs">
                  <BallIcon size={13} className="opacity-70 flex-shrink-0" />
                  <PitchIcon size={11} className="opacity-50 flex-shrink-0" />
                  <span className="text-zinc-600 truncate max-w-[180px]">{match.venue}</span>
                </div>
                {isLiveMatch ? (
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span className="text-red-400 text-xs font-bold tracking-widest">LIVE</span>
                  </div>
                ) : (
                  <span className="text-sky-400 text-xs font-medium bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                    {match.status}
                  </span>
                )}
              </div>

              <div className="space-y-4 mb-4">
                {[
                  { team: match.teamA, score: match.scoreA, batting: isLiveMatch && !secondInningsStarted },
                  { team: match.teamB, score: match.scoreB, batting: isLiveMatch && secondInningsStarted },
                ].map(({ team, score, batting }) => {
                  const noScore = score === "Yet to bat" || score === "—";
                  const parts = score.match(/^([\d/]+)\s*(\(.+\))?$/);
                  return (
                    <div key={team} className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        {batting && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />}
                        <span className={`text-xl font-black leading-tight truncate ${batting || !isLiveMatch ? "text-white" : "text-zinc-500"}`}>
                          {team}
                        </span>
                      </div>
                      {noScore ? (
                        <span className="text-zinc-700 text-sm mt-1 flex-shrink-0">{score}</span>
                      ) : (
                        <div className="text-right flex-shrink-0">
                          <span className={`text-3xl font-black tabular-nums tracking-tight ${batting ? "text-green-400" : "text-zinc-500"}`}>
                            {parts?.[1] ?? score}
                          </span>
                          {parts?.[2] && <p className="text-zinc-600 text-xs mt-0.5">{parts[2]}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {match.matchContext && (
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2 mb-3">
                  <p className="text-amber-300 text-xs font-medium">{match.matchContext}</p>
                </div>
              )}
              <div className="pt-3 border-t border-zinc-800">
                <span className="text-zinc-500 text-sm font-medium">{match.overs}</span>
              </div>
            </div>
          </div>

          {/* Live Ticker */}
          {isLiveMatch && <LiveTicker match={match} />}

          {/* Pre-Match Preview */}
          {isUpcoming && <PreMatchPreview match={match} />}

          {/* Win Probability */}
          <WinProbability match={match} />
        </div>

        {/* ── RIGHT: All engagement features ── */}
        <div className="space-y-4">
          <SocialRoom match={match} />
          <AICommentary match={match} />
          <AskGemini match={match} />
          <PredictionPoll
            matchId={match.id}
            question={match.prediction.question}
            initialYesVotes={match.prediction.yesVotes}
            initialNoVotes={match.prediction.noVotes}
          />
          <FanQuiz match={match} />
          <PostMatchReport match={match} />
        </div>
      </div>
    </main>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default async function MatchPage({ params }: { params: { id: string } }) {
  const match = await getLiveMatch(params.id);
  if (!match) notFound();
  return match.status === "Result"
    ? <CompletedMatchPage match={match} />
    : <LiveMatchPage match={match} />;
}
