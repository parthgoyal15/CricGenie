"use client";

import { useState } from "react";
import type { Match } from "@/lib/matches";
import { recordQuizAnswer } from "@/lib/user-stats";

interface QuizData {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  source?: string;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function FanQuiz({ match }: { match: Match }) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [count, setCount] = useState(0);

  const fetchQuiz = async () => {
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamA: match.teamA,
          teamB: match.teamB,
          sport: match.sport,
          matchContext: match.recentEvents.join("; "),
        }),
      });
      const data = await res.json();
      setQuiz(data);
    } catch {
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option: string) => {
    if (selected || !quiz) return;
    setSelected(option);
    setCount((c) => c + 1);
    const correct = option === quiz.answer;
    if (correct) setSessionScore((s) => s + 20);
    recordQuizAnswer(correct);
  };

  const getOptionState = (option: string): "idle" | "correct" | "wrong" | "dim" => {
    if (!selected) return "idle";
    if (option === quiz?.answer) return "correct";
    if (option === selected) return "wrong";
    return "dim";
  };

  const stateClass: Record<ReturnType<typeof getOptionState>, string> = {
    idle: "bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 hover:text-white cursor-pointer",
    correct: "bg-emerald-500/15 border-2 border-emerald-500 text-emerald-200",
    wrong: "bg-red-500/15 border-2 border-red-500 text-red-200",
    dim: "bg-zinc-800/30 border border-zinc-800 text-zinc-700 opacity-50",
  };

  const labelClass: Record<ReturnType<typeof getOptionState>, string> = {
    idle: "bg-zinc-700 text-zinc-400",
    correct: "bg-emerald-500 text-white",
    wrong: "bg-red-500 text-white",
    dim: "bg-zinc-800 text-zinc-600",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
      <div className="h-0.5 bg-gradient-to-r from-purple-500 to-violet-400" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 text-xs font-black">Q</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none mb-0.5">Fan Quiz</p>
              <p className="text-[11px] text-purple-400/60">Google Gemini 1.5 Flash</p>
            </div>
          </div>
          {count > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
              <span className="text-xs text-zinc-400">
                Score <span className="text-purple-400 font-bold">{sessionScore}</span>
              </span>
            </div>
          )}
        </div>

        {/* Empty state */}
        {!quiz && !loading && (
          <div className="text-center py-7">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🧠</span>
            </div>
            <p className="text-zinc-500 text-sm mb-4">
              Test your cricket knowledge
            </p>
            <button
              onClick={fetchQuiz}
              className="bg-purple-500/15 border border-purple-500/35 text-purple-300 hover:bg-purple-500/25 hover:border-purple-500/50 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              Get a Question
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="flex justify-center gap-1.5 mb-3">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
            </div>
            <p className="text-zinc-600 text-xs">Gemini is crafting your question…</p>
          </div>
        )}

        {/* Quiz */}
        {quiz && !loading && (
          <>
            <p className="text-white font-semibold text-[15px] mb-4 leading-snug">
              {quiz.question}
            </p>

            <div className="space-y-2 mb-4">
              {quiz.options.map((option, i) => {
                const state = getOptionState(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left rounded-xl py-3 px-4 text-sm transition-all flex items-center gap-3 ${stateClass[state]}`}
                  >
                    <span className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-[11px] font-black transition-colors ${labelClass[state]}`}>
                      {OPTION_LABELS[i] ?? i + 1}
                    </span>
                    <span className="flex-1">{option}</span>
                    {state === "correct" && <span className="text-emerald-400 flex-shrink-0">✓</span>}
                    {state === "wrong" && <span className="text-red-400 flex-shrink-0">✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Result */}
            {selected && (
              <div className={`rounded-xl p-4 mb-4 border ${
                selected === quiz.answer
                  ? "bg-emerald-500/8 border-emerald-500/25"
                  : "bg-red-500/8 border-red-500/25"
              }`}>
                <p className={`text-sm font-bold mb-1.5 ${
                  selected === quiz.answer ? "text-emerald-400" : "text-red-400"
                }`}>
                  {selected === quiz.answer ? "Correct! +20 pts 🎉" : `Wrong — Answer: ${quiz.answer}`}
                </p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {quiz.explanation}
                </p>
              </div>
            )}

            {selected && (
              <button
                onClick={fetchQuiz}
                className="w-full bg-purple-500/10 border border-purple-500/25 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                Next Question →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
