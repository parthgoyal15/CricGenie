"use client";

import { useState, useEffect } from "react";
import type { Match } from "@/lib/matches";
import type { MatchPreview } from "@/app/api/ai/preview/route";

function ConfidenceBar({ pct, winner }: { pct: number; winner: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1.5">
        <span className="text-sky-400 font-semibold">{winner}</span>
        <span className="text-zinc-500">{pct}% predicted win</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function PreMatchPreview({ match }: { match: Match }) {
  const [preview, setPreview] = useState<MatchPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ match }),
    })
      .then((r) => r.json())
      .then(setPreview)
      .catch(() => setPreview(null))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.id]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
      <div className="h-0.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500" />
      <div className="p-5">

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-sky-400 text-xs font-bold">AI</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none mb-0.5">AI Match Preview</p>
            <p className="text-xs text-sky-400/70">Powered by Google Gemini</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
              Pre-Match
            </span>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-5 bg-zinc-800 rounded-lg w-3/4" />
            <div className="h-3 bg-zinc-800 rounded w-full" />
            <div className="h-3 bg-zinc-800 rounded w-5/6" />
            <div className="h-2 bg-zinc-800 rounded-full mt-4" />
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-16 bg-zinc-800 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* Preview content */}
        {!loading && preview && (
          <div className="space-y-4">

            {/* Headline */}
            <h2 className="text-base font-black text-white leading-snug">
              {preview.headline}
            </h2>

            {/* Prediction paragraph */}
            <p className="text-zinc-400 text-sm leading-relaxed">
              {preview.prediction}
            </p>

            {/* Confidence bar */}
            <ConfidenceBar pct={preview.confidence} winner={preview.predictedWinner} />

            {/* Divider */}
            <div className="border-t border-zinc-800" />

            {/* Key Players */}
            <div>
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mb-3">
                Players to Watch
              </p>
              <div className="space-y-2">
                {preview.keyPlayers.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-zinc-800/50 rounded-xl px-3 py-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-indigo-300 text-[10px] font-black">{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white leading-none mb-0.5">{p.name}</p>
                      <p className="text-[11px] text-sky-400/80 mb-1">{p.team}</p>
                      <p className="text-xs text-zinc-500 leading-snug">{p.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch + H2H */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-1.5">
                  Pitch Report
                </p>
                <p className="text-xs text-zinc-400 leading-snug">{preview.pitchReport}</p>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-1.5">
                  Head to Head
                </p>
                <p className="text-xs text-zinc-400 leading-snug">{preview.headToHead}</p>
              </div>
            </div>

            {preview.source === "gemini" && (
              <p className="text-xs text-zinc-700 text-center">Generated by Google Gemini 1.5 Flash</p>
            )}
          </div>
        )}

        {/* Error state */}
        {!loading && !preview && (
          <p className="text-zinc-600 text-sm text-center py-4">
            Preview unavailable — check back closer to match time.
          </p>
        )}
      </div>
    </div>
  );
}
