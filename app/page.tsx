import React from "react";
import Link from "next/link";
import MatchCard from "@/components/match/MatchCard";
import { getLiveMatches } from "@/lib/cricket-api";
import type { Match } from "@/lib/matches";
import {
  BallIcon,
  PitchIcon,
  StumpsIcon,
  HelmetIcon,
  FieldIcon,
  SixIcon,
  TrophyIcon,
} from "@/components/ui/CricketIcons";

export const revalidate = 60;

type FeatureItem = {
  icon: React.ReactNode;
  label: string;
  desc: string;
  from: string;
  to: string;
  border: string;
  text: string;
};

const FEATURES: FeatureItem[] = [
  {
    icon: <BallIcon size={22} />,
    label: "AI Commentary",
    desc: "Gemini generates live match insights every 10 seconds",
    from: "from-blue-500/15",
    to: "to-indigo-500/5",
    border: "border-blue-500/20",
    text: "text-blue-300",
  },
  {
    icon: <PitchIcon size={22} />,
    label: "Match Forecast",
    desc: "Gemini-powered win probability with gauge meter",
    from: "from-emerald-500/15",
    to: "to-green-500/5",
    border: "border-emerald-500/20",
    text: "text-emerald-300",
  },
  {
    icon: <StumpsIcon size={22} />,
    label: "Fan Vote",
    desc: "Vote on IPL moments — boundaries, wickets, super overs",
    from: "from-amber-500/15",
    to: "to-yellow-500/5",
    border: "border-amber-500/20",
    text: "text-amber-300",
  },
  {
    icon: <HelmetIcon size={22} />,
    label: "Fan Quiz",
    desc: "Gemini crafts IPL trivia — players, records & history",
    from: "from-purple-500/15",
    to: "to-violet-500/5",
    border: "border-purple-500/20",
    text: "text-purple-300",
  },
  {
    icon: <FieldIcon size={22} />,
    label: "Fan Rooms",
    desc: "Live AI-powered discussion rooms per IPL fixture",
    from: "from-pink-500/15",
    to: "to-rose-500/5",
    border: "border-pink-500/20",
    text: "text-pink-300",
  },
  {
    icon: <SixIcon size={22} />,
    label: "Ask Anything",
    desc: "Chat with Gemini about tactics, players & strategy",
    from: "from-violet-500/15",
    to: "to-purple-500/5",
    border: "border-violet-500/20",
    text: "text-violet-300",
  },
];

function PastMatchRow({ match }: { match: Match }) {
  const ctx = match.matchContext.toLowerCase();
  const teamAWon =
    ctx.includes(match.teamA.toLowerCase().split(" ")[0]) &&
    (ctx.includes("won") || ctx.includes("win"));

  // Extract date from overs field e.g. "Completed · 7 May 2026"
  const dateMatch = match.overs.match(/·\s*(.+)$/);
  const matchDate = dateMatch ? dateMatch[1].trim() : null;

  // Count key moments (events beyond the result headline)
  const moments = match.recentEvents.length > 1 ? match.recentEvents.length - 1 : 0;

  return (
    <Link href={`/match/${match.id}`}>
      <div className="group bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900 rounded-xl px-4 py-3.5 transition-all duration-150 cursor-pointer">
        <div className="flex items-center gap-3">
          {/* Teams + Scores */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-sm font-semibold truncate ${teamAWon ? "text-white" : "text-zinc-500"}`}>
                {match.teamA}
              </span>
              <span className={`text-sm font-black tabular-nums ml-2 flex-shrink-0 ${teamAWon ? "text-amber-300" : "text-zinc-600"}`}>
                {match.scoreA.replace(/\s*\(.*\)/, "")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold truncate ${!teamAWon ? "text-white" : "text-zinc-500"}`}>
                {match.teamB}
              </span>
              <span className={`text-sm font-black tabular-nums ml-2 flex-shrink-0 ${!teamAWon ? "text-amber-300" : "text-zinc-600"}`}>
                {match.scoreB.replace(/\s*\(.*\)/, "")}
              </span>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-shrink-0 text-right space-y-1 min-w-[120px] hidden sm:block">
            <p className="text-[11px] text-zinc-500 leading-tight line-clamp-2">
              {match.matchContext}
            </p>
            <div className="flex items-center justify-end gap-1">
              <PitchIcon size={10} className="opacity-40 flex-shrink-0" />
              <p className="text-[10px] text-zinc-600 truncate max-w-[110px]">{match.venue.split(",")[0]}</p>
            </div>
            {matchDate && (
              <p className="text-[10px] text-zinc-700">{matchDate}</p>
            )}
          </div>

          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            {moments > 0 && (
              <span className="text-[10px] text-zinc-600 group-hover:text-zinc-500 transition-colors whitespace-nowrap">
                {moments} highlights
              </span>
            )}
            <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors text-sm">→</span>
          </div>
        </div>

        {/* Venue + result on mobile */}
        <div className="sm:hidden flex items-center gap-1.5 mt-1.5">
          <PitchIcon size={10} className="opacity-40 flex-shrink-0" />
          <p className="text-[11px] text-zinc-600 truncate">
            {match.venue}
            {matchDate && <span className="text-zinc-700 ml-1.5">· {matchDate}</span>}
          </p>
        </div>
        <p className="sm:hidden text-[11px] text-zinc-500 mt-1 truncate">{match.matchContext}</p>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const { currentMatches, pastMatches, isLive } = await getLiveMatches();

  const liveMatches     = currentMatches.filter((m) => m.status.toUpperCase() === "LIVE" || m.status.toUpperCase() === "IN PROGRESS");
  const upcomingMatches = currentMatches.filter((m) => m.status.toUpperCase() !== "LIVE" && m.status.toUpperCase() !== "IN PROGRESS");
  const hasLive         = liveMatches.length > 0;

  // Smart order: live → next upcoming → recent results → remaining upcoming
  const orderedMatches = hasLive
    ? [...liveMatches, ...pastMatches.slice(0, 3), ...upcomingMatches]
    : [...upcomingMatches.slice(0, 1), ...pastMatches.slice(0, 3), ...upcomingMatches.slice(1)];

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero — full width */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1.5">
          <h1 className="text-3xl font-black tracking-tight text-white">Live Cricket</h1>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              CricAPI Live
            </span>
          ) : (
            <span className="bg-zinc-800 border border-zinc-700 text-zinc-500 text-xs font-medium px-2.5 py-1 rounded-full">
              Demo Mode
            </span>
          )}
        </div>
        <p className="text-zinc-500 text-sm">
          IPL 2026 · AI predictions, quizzes &amp; live Gemini insights
        </p>
      </div>

      {/* ── 2-column grid on desktop ──────────────────────── */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start">

        {/* ── LEFT: Match list ─────────────────────────────── */}
        <div>
          <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-bold mb-3">
            IPL 2026 Matches
          </p>
          <div className="space-y-3 mb-6">
            {orderedMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>

          {/* Older results — compact list */}
          {pastMatches.length > 3 && (
            <div>
              <p className="text-[11px] text-zinc-700 uppercase tracking-widest font-bold mb-2">
                More Results
              </p>
              <div className="space-y-2">
                {pastMatches.slice(3).map((match) => (
                  <PastMatchRow key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: How it works + Feature grid (sticky) ──── */}
        <div className="lg:sticky lg:top-20 mt-8 lg:mt-0 space-y-4">

          {/* How it works */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.04] to-indigo-500/[0.03] pointer-events-none" />
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-3">
              How it works
            </p>
            <div className="space-y-2">
              {[
                { icon: <BallIcon size={15} />, title: "Pick a match", desc: "Live, upcoming or recent result", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                { icon: <StumpsIcon size={15} />, title: "Get AI insights", desc: "Gemini analyses every moment", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
                { icon: <HelmetIcon size={15} />, title: "Vote & predict", desc: "Fan polls, quiz & social room", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                { icon: <SixIcon size={15} />, title: "Earn badges", desc: "Score points, climb leaderboard", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
              ].map(({ icon, title, desc, color, bg }, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/40 transition-colors">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${bg} ${color}`}>
                    {icon}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-none mb-0.5 ${color}`}>{title}</p>
                    <p className="text-[11px] text-zinc-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature grid */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-3">
              AI Features
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className={`bg-gradient-to-br ${f.from} ${f.to} border ${f.border} rounded-xl p-3`}
                >
                  <span className="block mb-1.5">{f.icon}</span>
                  <p className={`text-xs font-bold mb-0.5 ${f.text}`}>{f.label}</p>
                  <p className="text-[10px] text-zinc-500 leading-snug">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick link to leaderboard */}
          <Link
            href="/leaderboard"
            className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-2xl p-4 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
                <TrophyIcon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Leaderboard</p>
                <p className="text-[11px] text-zinc-600">Top fans this week</p>
              </div>
            </div>
            <span className="text-zinc-700 group-hover:text-amber-400 transition-colors text-sm">→</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
