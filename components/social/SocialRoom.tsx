"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Match } from "@/lib/matches";
import type { RoomVibe } from "@/app/api/ai/room-insight/route";

interface Message {
  id: number;
  author: string;
  text: string;
  type: "user" | "ai" | "reaction" | "system";
  timestamp: string;
}

const VIBE_CONFIG: Record<RoomVibe, { label: string; color: string; bg: string }> = {
  ELECTRIC:    { label: "⚡ Electric",     color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/25" },
  TENSE:       { label: "😰 Tense",        color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/25" },
  CELEBRATION: { label: "🎉 Celebration",  color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/25" },
  CALM:        { label: "😌 Calm",         color: "text-sky-400",     bg: "bg-sky-400/10 border-sky-400/25" },
  NERVOUS:     { label: "🫀 Nervous",      color: "text-rose-400",    bg: "bg-rose-400/10 border-rose-400/25" },
};

const QUICK_REACTIONS = [
  { emoji: "🔥", label: "Fire!" },
  { emoji: "💪", label: "Let's go!" },
  { emoji: "😱", label: "OMG!" },
  { emoji: "🎉", label: "YES!" },
  { emoji: "👏", label: "Class!" },
];

const FAN_NAMES = [
  "CricFan_7829", "RohitSharmaFan", "IPL_Addict", "T20_Maniac",
  "PitchPerfect22", "BoundaryKing", "SixMachine", "CricketNerd99",
  "WicketWatcher", "SixerKing", "DotBallDetective", "FreakingIPL",
];

// Simulated crowd messages that occasionally appear
const CROWD_MESSAGES = [
  "What a game! Can't stop watching 🔥",
  "That last over was insane 😱",
  "My team needs to step it up!",
  "The fielding today is top class 👏",
  "Come on! One more wicket needed!",
  "Watching this with my whole family 🏏",
  "This pitch is doing a lot! Spinners will dominate",
  "That six was absolutely massive!",
  "Best IPL season in years honestly",
  "Can't believe that dropped catch 🤦",
  "The atmosphere at the ground looks electric!",
  "This match is going to the wire for sure",
];

let msgCounter = 0;

function getOrCreateFanName(): string {
  if (typeof window === "undefined") return "You";
  let name = localStorage.getItem("cricgenie-fan-name");
  if (!name) {
    const idx = Math.floor(Math.random() * FAN_NAMES.length);
    name = FAN_NAMES[idx] + "_" + Math.floor(Math.random() * 100);
    localStorage.setItem("cricgenie-fan-name", name);
  }
  return name;
}

const STORAGE_KEY = (matchId: string) => `cricgenie-room-msgs-${matchId}`;

function loadPersistedMessages(matchId: string): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(matchId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistMessages(matchId: string, msgs: Message[]) {
  try {
    // Only persist user messages — keep last 30
    const toSave = msgs.filter((m) => m.type === "user" || m.type === "reaction").slice(-30);
    localStorage.setItem(STORAGE_KEY(matchId), JSON.stringify(toSave));
  } catch { /* silent */ }
}

function getWatchers(matchId: string): number {
  const base = matchId.charCodeAt(0) * 137;
  return 800 + (base % 1200);
}

export default function SocialRoom({ match }: { match: Match }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [vibe, setVibe] = useState<RoomVibe>("CALM");
  const [fanName] = useState(getOrCreateFanName);
  const [watchers, setWatchers] = useState(getWatchers(match.id));
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  // Seed with system message + persisted user messages + a few crowd messages
  useEffect(() => {
    const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const systemMsg: Message = {
      id: ++msgCounter,
      author: "CricGenie",
      text: `🏟️ Room open for ${match.teamA} vs ${match.teamB} — join the conversation!`,
      type: "system",
      timestamp: now(),
    };

    // Load persisted user messages
    const persisted = loadPersistedMessages(match.id);

    // Seed 3 random crowd messages to make room feel alive
    const crowdSeed: Message[] = [];
    const shuffled = [...CROWD_MESSAGES].sort(() => Math.random() - 0.5).slice(0, 3);
    shuffled.forEach((text, i) => {
      const name = FAN_NAMES[Math.floor(Math.random() * FAN_NAMES.length)];
      crowdSeed.push({
        id: ++msgCounter,
        author: name,
        text,
        type: "user",
        timestamp: now(),
      });
      void i;
    });

    setMessages([systemMsg, ...crowdSeed, ...persisted]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.id]);

  // Persist user messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 1) persistMessages(match.id, messages);
  }, [messages, match.id]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const id = setInterval(() => {
      setWatchers((w) => w + Math.floor(Math.random() * 21) - 10);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  // Simulate other fans occasionally sending messages
  useEffect(() => {
    const interval = setInterval(() => {
      const text = CROWD_MESSAGES[Math.floor(Math.random() * CROWD_MESSAGES.length)];
      const name = FAN_NAMES[Math.floor(Math.random() * FAN_NAMES.length)];
      const crowdMsg: Message = {
        id: ++msgCounter,
        author: name,
        text,
        type: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, crowdMsg]);
      if (!open) setUnread((u) => u + 1);
    }, 18000); // new fan message every 18s
    return () => clearInterval(interval);
  }, [open]);

  const fetchInsight = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/room-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamA: match.teamA,
          teamB: match.teamB,
          scoreA: match.scoreA,
          overs: match.overs,
          recentEvents: match.recentEvents,
          recentMessages: messagesRef.current
            .filter((m) => m.type === "user")
            .slice(-5)
            .map((m) => ({ author: m.author, text: m.text })),
        }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: ++msgCounter,
        author: "CricGenie AI",
        text: data.text,
        type: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setVibe(data.vibe ?? "CALM");
      if (!open) setUnread((u) => u + 1);
    } catch { /* silent */ }
  }, [match, open]);

  useEffect(() => {
    const id = setInterval(fetchInsight, 30000);
    const init = setTimeout(fetchInsight, 3000);
    return () => { clearInterval(id); clearTimeout(init); };
  }, [fetchInsight]);

  const sendMessage = (text: string, type: Message["type"] = "user") => {
    if (!text.trim()) return;
    const msg: Message = {
      id: ++msgCounter,
      author: fanName,
      text: text.trim(),
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);
    if (!open) setUnread((u) => u + 1);
  };

  const handleOpen = () => { setOpen(true); setUnread(0); };
  const vibeCfg = VIBE_CONFIG[vibe];

  return (
    <div className="mb-4">
      {!open ? (
        <button
          onClick={handleOpen}
          className="w-full bg-zinc-900 border border-zinc-800 hover:border-pink-500/30 rounded-2xl p-4 flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-pink-500/15 border border-pink-500/25 flex items-center justify-center flex-shrink-0">
              <span className="text-base">💬</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Fan Room</p>
              <p className="text-[11px] text-zinc-600">
                {watchers.toLocaleString()} fans watching
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${vibeCfg.bg} ${vibeCfg.color}`}>
              {vibeCfg.label}
            </span>
            {unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
            <span className="text-zinc-700 group-hover:text-zinc-500 transition-colors text-xs">▼</span>
          </div>
        </button>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-pink-500 to-rose-400" />

          {/* Room header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-500/15 border border-pink-500/25 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">💬</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none mb-0.5">Fan Room</p>
                <p className="text-[11px] text-zinc-600">
                  <span className="text-green-400 font-semibold">{watchers.toLocaleString()}</span> fans watching
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${vibeCfg.bg} ${vibeCfg.color}`}>
                {vibeCfg.label}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-700 hover:text-zinc-400 transition-colors text-sm w-7 h-7 flex items-center justify-center"
              >
                ▲
              </button>
            </div>
          </div>

          {/* Name badge */}
          <div className="px-5 py-2 border-b border-zinc-800/40 bg-zinc-800/20">
            <p className="text-[11px] text-zinc-600">
              Chatting as <span className="text-pink-400 font-semibold">{fanName}</span>
            </p>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto px-5 py-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === "system" ? (
                  <p className="text-center text-[11px] text-zinc-700 py-1">{msg.text}</p>
                ) : msg.type === "ai" ? (
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-indigo-400">AI</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-[11px] font-bold text-indigo-400">CricGenie AI</span>
                        <span className="text-[10px] text-zinc-700">{msg.timestamp}</span>
                      </div>
                      <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl rounded-tl-sm px-3 py-2">
                        <p className="text-xs text-zinc-300 leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`flex gap-2.5 ${msg.author === fanName ? "flex-row-reverse" : ""}`}>
                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] text-zinc-500">
                        {msg.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`flex-1 min-w-0 ${msg.author === fanName ? "items-end flex flex-col" : ""}`}>
                      <div className={`flex items-baseline gap-1.5 mb-0.5 ${msg.author === fanName ? "flex-row-reverse" : ""}`}>
                        <span className={`text-[11px] font-bold ${msg.author === fanName ? "text-pink-400" : "text-zinc-400"}`}>
                          {msg.author === fanName ? "You" : msg.author}
                        </span>
                        <span className="text-[10px] text-zinc-700">{msg.timestamp}</span>
                      </div>
                      <div className={`inline-block max-w-[85%] rounded-xl px-3 py-2 ${
                        msg.author === fanName
                          ? "bg-pink-500/12 border border-pink-500/20 rounded-tr-sm"
                          : "bg-zinc-800/60 border border-zinc-700/40 rounded-tl-sm"
                      }`}>
                        <p className="text-xs text-zinc-300 leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick reactions */}
          <div className="px-5 py-2.5 border-t border-zinc-800/40 flex gap-1.5 flex-wrap">
            {QUICK_REACTIONS.map((r) => (
              <button
                key={r.emoji}
                onClick={() => sendMessage(`${r.emoji} ${r.label}`)}
                className="text-xs bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 px-2.5 py-1.5 rounded-lg transition-all text-zinc-400 hover:text-zinc-200"
              >
                {r.emoji} {r.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 pb-4 pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
                setInput("");
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Say something to the room…"
                maxLength={140}
                className="flex-1 bg-zinc-800/50 border border-zinc-700/50 focus:border-pink-500/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-pink-500/15 border border-pink-500/30 text-pink-300 hover:bg-pink-500/25 hover:border-pink-500/45 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
