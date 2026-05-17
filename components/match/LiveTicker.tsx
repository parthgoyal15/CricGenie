"use client";

import { useState, useEffect, useRef } from "react";
import type { Match } from "@/lib/matches";

type BallType = "dot" | "1" | "2" | "3" | "4" | "6" | "W" | "WD" | "NB";

interface BallEvent {
  id: number;
  type: BallType;
}

function ballStyle(type: BallType): string {
  switch (type) {
    case "W":
      return "bg-red-500/25 border-red-500/50 text-red-400 font-black ring-1 ring-red-500/20";
    case "6":
      return "bg-green-500/25 border-green-500/50 text-green-400 font-black";
    case "4":
      return "bg-sky-500/25 border-sky-500/50 text-sky-400 font-bold";
    case "WD":
      return "bg-yellow-500/20 border-yellow-500/40 text-yellow-400";
    case "NB":
      return "bg-orange-500/20 border-orange-500/40 text-orange-400";
    case "dot":
      return "bg-zinc-800 border-zinc-700 text-zinc-600";
    default:
      return "bg-zinc-800/70 border-zinc-700 text-zinc-400";
  }
}

function ballLabel(type: BallType): string {
  return type === "dot" ? "•" : type;
}

function randomBall(id: number): BallEvent {
  const r = Math.random();
  let type: BallType;
  if (r < 0.36)      type = "dot";
  else if (r < 0.53) type = "1";
  else if (r < 0.63) type = "2";
  else if (r < 0.65) type = "3";
  else if (r < 0.77) type = "4";
  else if (r < 0.86) type = "6";
  else if (r < 0.93) type = "W";
  else if (r < 0.97) type = "WD";
  else               type = "NB";
  return { id, type };
}

function seedFromEvents(events: string[]): BallEvent[] {
  const balls: BallEvent[] = [];
  let id = 0;
  for (const e of events) {
    const lo = e.toLowerCase();
    if (lo.includes("six") || lo.includes(" 6 "))           balls.push({ id: id++, type: "6" });
    else if (lo.includes("four") || lo.includes(" 4 "))     balls.push({ id: id++, type: "4" });
    else if (
      lo.includes("wicket") || lo.includes("caught") ||
      lo.includes("bowled") || lo.includes("stumped") ||
      lo.includes("lbw") || lo.includes("run out")
    )                                                        balls.push({ id: id++, type: "W" });
    else if (lo.includes("wide"))                            balls.push({ id: id++, type: "WD" });
    else if (lo.includes("no ball"))                         balls.push({ id: id++, type: "NB" });
    else                                                     balls.push({ id: id++, type: "dot" });
  }
  while (balls.length < 10) balls.unshift(randomBall(id++));
  return balls.slice(-18);
}

const LEGEND: { type: BallType; label: string }[] = [
  { type: "W",   label: "Wicket" },
  { type: "6",   label: "Six"    },
  { type: "4",   label: "Four"   },
  { type: "dot", label: "Dot"    },
  { type: "WD",  label: "Wide"   },
];

export default function LiveTicker({ match }: { match: Match }) {
  const [balls, setBalls] = useState<BallEvent[]>(() =>
    seedFromEvents(match.recentEvents)
  );
  const [newId, setNewId] = useState<number | null>(null);
  const counter  = useRef(200);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const ball = randomBall(counter.current++);
      setNewId(ball.id);
      setBalls((prev) => [...prev.slice(-17), ball]);
      setTimeout(() => {
        stripRef.current?.scrollTo({ left: 9999, behavior: "smooth" });
      }, 60);
      setTimeout(() => setNewId(null), 700);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const totalBalls = balls.length;
  const currentOver = Math.floor(totalBalls / 6);
  const ballInOver  = totalBalls % 6;

  // Last ball for "last action" tag
  const lastBall = balls[balls.length - 1];
  const lastAction =
    lastBall?.type === "W"  ? "WICKET!" :
    lastBall?.type === "6"  ? "SIX!"    :
    lastBall?.type === "4"  ? "FOUR!"   :
    lastBall?.type === "WD" ? "Wide"    :
    lastBall?.type === "NB" ? "No Ball" : null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
      <div className="h-0.5 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400" />

      <div className="px-4 pt-3 pb-4">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-sm font-bold text-white">Live Ball-by-Ball</span>
          </div>
          <div className="flex items-center gap-2">
            {lastAction && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border animate-pulse ${
                lastAction === "WICKET!" ? "bg-red-500/20 border-red-500/40 text-red-400" :
                lastAction === "SIX!"   ? "bg-green-500/20 border-green-500/40 text-green-400" :
                lastAction === "FOUR!"  ? "bg-sky-500/20 border-sky-500/40 text-sky-400" :
                "bg-zinc-800 border-zinc-700 text-zinc-400"
              }`}>
                {lastAction}
              </span>
            )}
            <span className="text-zinc-600 text-xs tabular-nums">
              Over {currentOver}.{ballInOver}
            </span>
          </div>
        </div>

        {/* Ball strip */}
        <div
          ref={stripRef}
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-none"
        >
          {balls.map((ball) => (
            <div
              key={ball.id}
              className={`
                flex-shrink-0 w-8 h-8 rounded-full border
                flex items-center justify-center text-xs
                transition-all duration-300 ease-out
                ${ballStyle(ball.type)}
                ${newId === ball.id ? "scale-125" : "scale-100"}
              `}
            >
              {ballLabel(ball.type)}
            </div>
          ))}

          {/* Next-ball placeholder */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 animate-pulse" />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {LEGEND.map(({ type, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] ${ballStyle(type)}`}>
                {ballLabel(type)}
              </div>
              <span className="text-zinc-700 text-[10px]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
