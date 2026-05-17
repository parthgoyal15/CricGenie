"use client";

import { useState, useEffect, useCallback } from "react";
import type { Match } from "@/lib/matches";

interface GaugeProps {
  probA: number;
  teamA: string;
  teamB: string;
}

function GaugeMeter({ probA, teamA, teamB }: GaugeProps) {
  const r = 72;
  const cx = 110;
  const cy = 88;
  const totalArc = Math.PI * r;

  const dashA = (probA / 100) * totalArc;
  const dashB = totalArc - dashA;

  const needleRad = Math.PI - (probA / 100) * Math.PI;
  const needleX = cx + r * Math.cos(needleRad);
  const needleY = cy - r * Math.sin(needleRad);

  return (
    <svg viewBox="0 0 220 105" className="w-full max-w-[260px] mx-auto">
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#1c1c1f" strokeWidth="14" strokeLinecap="round"
      />
      {/* Team A (emerald) */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#34d399" strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${dashA} ${totalArc}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
      {/* Team B (orange) */}
      <path
        d={`M ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${cx - r} ${cy}`}
        fill="none" stroke="#fb923c" strokeWidth="14" strokeLinecap="round"
        strokeDasharray={`${dashB} ${totalArc}`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
      {/* Needle */}
      <line
        x1={cx} y1={cy} x2={needleX} y2={needleY}
        stroke="#f4f4f5" strokeWidth="2" strokeLinecap="round"
        style={{ transition: "x2 1.2s cubic-bezier(.4,0,.2,1), y2 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
      <circle cx={cx} cy={cy} r="5" fill="#f4f4f5" />
      <circle cx={cx} cy={cy} r="2.5" fill="#09090b" />

      {/* Labels */}
      <text x={cx - r - 2} y={cy + 17} textAnchor="middle"
        fill="#34d399" fontSize="9" fontWeight="800">
        {teamA.split(" ")[0]}
      </text>
      <text x={cx + r + 2} y={cy + 17} textAnchor="middle"
        fill="#fb923c" fontSize="9" fontWeight="800">
        {teamB.split(" ")[0]}
      </text>
    </svg>
  );
}

export default function WinProbability({ match }: { match: Match }) {
  const [probA, setProbA] = useState(match.teamAMomentum);
  const [probB, setProbB] = useState(match.teamBMomentum);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const fetchProb = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/win-probability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(match),
      });
      const data = await res.json();
      setProbA(data.teamAProb);
      setProbB(data.teamBProb);
      setSummary(data.summary);
      setSource(data.source);
      setUpdatedAt(new Date());
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  }, [match]);

  useEffect(() => {
    fetchProb();
    const id = setInterval(fetchProb, 30000);
    return () => clearInterval(id);
  }, [fetchProb]);

  const aLeading = probA >= probB;
  const leadTeam = aLeading ? match.teamA : match.teamB;
  const leadProb = Math.max(probA, probB);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
      <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-green-400" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 text-[11px] font-black">AI</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none mb-0.5">
                Match Forecast
              </p>
              <p className="text-[11px] text-emerald-400/60">
                {source === "gemini" ? "Google Gemini Analysis" : "Live Calculation"}
              </p>
            </div>
          </div>
          {loading && (
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
            </div>
          )}
        </div>

        {/* Gauge */}
        <GaugeMeter probA={probA} teamA={match.teamA} teamB={match.teamB} />

        {/* Numbers */}
        <div className="flex items-end justify-between px-1 -mt-1 mb-4">
          <div>
            <p className={`text-3xl font-black tabular-nums transition-all duration-700 ${aLeading ? "text-emerald-400" : "text-zinc-600"}`}>
              {probA}%
            </p>
            <p className="text-[11px] text-zinc-600 truncate max-w-[90px]">{match.teamA}</p>
          </div>
          <div className="text-center pb-1">
            <p className="text-[10px] text-zinc-700 uppercase tracking-widest">win chance</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-black tabular-nums transition-all duration-700 ${!aLeading ? "text-orange-400" : "text-zinc-600"}`}>
              {probB}%
            </p>
            <p className="text-[11px] text-zinc-600 truncate max-w-[90px] text-right">{match.teamB}</p>
          </div>
        </div>

        {/* Gemini summary */}
        {summary && (
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-3.5 py-2.5">
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="font-semibold text-emerald-400">{leadTeam}</span> favoured at{" "}
              <span className="font-semibold text-emerald-300">{leadProb}%</span> — {summary}
            </p>
          </div>
        )}

        {updatedAt && (
          <p className="text-zinc-700 text-[11px] mt-3">
            Updated {updatedAt.toLocaleTimeString()} · Refreshes every 30s
          </p>
        )}
      </div>
    </div>
  );
}
