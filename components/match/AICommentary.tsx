"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { Match } from "@/lib/matches";
import type { CommentaryEntry, CommentaryType } from "@/app/api/ai/commentary/route";
import {
  WicketIcon,
  SixIcon,
  FourIcon,
  DotBallIcon,
  AnalysisIcon,
  UpdateIcon,
} from "@/components/ui/CricketIcons";

interface FeedEntry extends CommentaryEntry {
  id: number;
  time: string;
}

const TYPE_CONFIG: Record<
  CommentaryType,
  {
    label: string;
    labelClass: string;
    textClass: string;
    icon: React.ReactNode;
  }
> = {
  WICKET: {
    label: "WICKET",
    labelClass: "bg-red-500/20 text-red-400 border-red-500/30",
    textClass: "text-red-100",
    icon: <WicketIcon size={14} />,
  },
  SIX: {
    label: "SIX!",
    labelClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    textClass: "text-emerald-100",
    icon: <SixIcon size={14} />,
  },
  FOUR: {
    label: "FOUR",
    labelClass: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    textClass: "text-sky-100",
    icon: <FourIcon size={14} />,
  },
  DOT: {
    label: "DOT",
    labelClass: "bg-zinc-700/60 text-zinc-500 border-zinc-600/40",
    textClass: "text-zinc-400",
    icon: <DotBallIcon size={14} />,
  },
  ANALYSIS: {
    label: "ANALYSIS",
    labelClass: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    textClass: "text-zinc-200",
    icon: <AnalysisIcon size={14} />,
  },
  UPDATE: {
    label: "UPDATE",
    labelClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    textClass: "text-zinc-200",
    icon: <UpdateIcon size={14} />,
  },
};

let entryCounter = 0;

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.05;
  utt.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("natural")) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null;
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

export default function AICommentary({ match }: { match: Match }) {
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [voiceOn, setVoiceOn] = useState(false);
  const [source, setSource] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestEntryId = useRef<number>(-1);

  const fetchEntry = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/commentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamA: match.teamA,
          teamB: match.teamB,
          scoreA: match.scoreA,
          overs: match.overs,
          recentEvents: match.recentEvents,
        }),
      });
      const data = await res.json();
      const newEntry: FeedEntry = {
        ...data.entry,
        id: ++entryCounter,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
      setFeed((prev) => [newEntry, ...prev].slice(0, 6));
      setSource(data.source);
      latestEntryId.current = newEntry.id;
    } catch {
      // keep existing feed
    } finally {
      setLoading(false);
    }
  }, [match, loading]);

  useEffect(() => {
    if (!voiceOn || feed.length === 0) return;
    const newest = feed[0];
    if (newest.id !== latestEntryId.current) return;
    speak(newest.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed, voiceOn]);

  useEffect(() => {
    fetchEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(fetchEntry, 10000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.speechSynthesis?.cancel();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, fetchEntry]);

  const toggleVoice = () => {
    if (voiceOn) window.speechSynthesis?.cancel();
    setVoiceOn((v) => !v);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
      {/* Colored top bar */}
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-blue-400 to-sky-500" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-indigo-400 text-[11px] font-black">AI</span>
              </div>
              {isLive && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-zinc-900 animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none mb-0.5">
                Live Commentary
              </p>
              <p className="text-[11px] text-indigo-400/60">
                {source === "gemini" ? "Google Gemini 1.5 Flash" : "AI Analysis"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {loading && (
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              </div>
            )}
            <button
              onClick={toggleVoice}
              title={voiceOn ? "Mute voice" : "Enable voice commentary"}
              className={`text-sm px-2.5 py-1.5 rounded-lg border transition-all ${
                voiceOn
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                  : "bg-zinc-800 border-zinc-700/60 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {voiceOn ? "🔊" : "🔇"}
            </button>
            <button
              onClick={() => setIsLive((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                isLive
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-zinc-800 border-zinc-700/60 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {isLive ? "● LIVE" : "⏸ Paused"}
            </button>
            <button
              onClick={fetchEntry}
              disabled={loading}
              className="text-zinc-600 hover:text-zinc-300 border border-zinc-700/60 hover:border-zinc-600 px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-30"
            >
              ↻
            </button>
          </div>
        </div>

        {/* Voice hint */}
        {voiceOn && (
          <div className="flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-3 py-2 mb-3">
            <span className="text-indigo-400 text-sm">🔊</span>
            <p className="text-xs text-indigo-300/80">
              Voice commentary active — new entries will be read aloud
            </p>
          </div>
        )}

        {/* Feed */}
        {feed.length === 0 ? (
          <div className="flex gap-1.5 py-8 justify-center">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
          </div>
        ) : (
          <div className="space-y-2">
            {feed.map((entry, idx) => {
              const cfg = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.UPDATE;
              const isNewest = idx === 0;
              return (
                <div
                  key={entry.id}
                  className={`rounded-xl px-3 py-2.5 border transition-all duration-300 ${
                    isNewest
                      ? "bg-zinc-800/60 border-zinc-700/60"
                      : "border-transparent bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex-shrink-0 opacity-80">{cfg.icon}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cfg.labelClass}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-zinc-700">{entry.time}</span>
                    {isNewest && (
                      <span className="text-[10px] text-green-400 font-bold animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                <p
                  className={`text-sm leading-snug ml-4 ${
                      isNewest ? cfg.textClass : "text-zinc-600"
                    }`}
                  >
                    {entry.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-zinc-700 text-[11px] mt-4 pt-3 border-t border-zinc-800/60">
          {isLive ? "Auto-updating every 10s" : "Updates paused"} · Tap LIVE to toggle
        </p>
      </div>
    </div>
  );
}
