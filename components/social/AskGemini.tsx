"use client";

import { useState, useRef, useEffect } from "react";
import type { Match } from "@/lib/matches";

interface Message {
  role: "user" | "ai";
  text: string;
}

const SUGGESTED = [
  "Why did they bring on the spinner now?",
  "What's the ideal batting strategy here?",
  "Can they win from this position?",
];

export default function AskGemini({ match }: { match: Match }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (question: string) => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, match }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Sorry, couldn't get an answer right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
      <div className="h-0.5 bg-gradient-to-r from-violet-500 to-purple-400" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center flex-shrink-0">
            <span className="text-violet-400 text-[11px] font-black">G</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none mb-0.5">
              Ask anything about this match
            </p>
            <p className="text-[11px] text-violet-400/60">Powered by Google Gemini</p>
          </div>
        </div>

        {/* Chat area */}
        {messages.length === 0 && !loading ? (
          <div className="mb-4">
            <p className="text-[11px] text-zinc-600 mb-2.5 uppercase tracking-widest font-semibold">
              Try asking
            </p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 rounded-xl px-3.5 py-2.5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-violet-500/15 border border-violet-500/25 text-violet-100 rounded-tr-sm"
                      : "bg-zinc-800/70 border border-zinc-700/50 text-zinc-200 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800/70 border border-zinc-700/50 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about tactics, players, strategy…"
            className="flex-1 bg-zinc-800/60 border border-zinc-700/60 focus:border-violet-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-violet-500/15 border border-violet-500/35 text-violet-300 hover:bg-violet-500/25 hover:border-violet-500/50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
