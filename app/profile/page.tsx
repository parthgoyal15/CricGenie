"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getStats,
  getBadges,
  setFanName,
  avatarGradient,
  type UserStats,
  type Badge,
} from "@/lib/user-stats";

function Avatar({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const gradient = avatarGradient(name);
  const initial = name.charAt(0).toUpperCase() || "?";
  const dim = size === "lg" ? "w-20 h-20 text-3xl" : "w-10 h-10 text-base";
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-black text-white flex-shrink-0`}
    >
      {initial}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
      <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      <p className="text-xs text-zinc-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div
      className={`rounded-2xl border p-3 flex items-center gap-3 transition-all ${
        badge.earned
          ? "bg-zinc-900 border-zinc-700"
          : "bg-zinc-900/40 border-zinc-800/50 opacity-40"
      }`}
    >
      <span className={`text-2xl ${!badge.earned ? "grayscale" : ""}`}>
        {badge.icon}
      </span>
      <div className="min-w-0">
        <p
          className={`text-sm font-semibold truncate ${
            badge.earned ? "text-white" : "text-zinc-500"
          }`}
        >
          {badge.name}
        </p>
        <p className="text-xs text-zinc-600 truncate">{badge.desc}</p>
      </div>
      {badge.earned && (
        <span className="ml-auto text-green-400 text-xs font-bold flex-shrink-0">
          ✓
        </span>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const s = getStats();
    setStats(s);
    setBadges(getBadges(s));
    setNameInput(s.fanName);
  }, []);

  const saveName = () => {
    if (!nameInput.trim()) return;
    setFanName(nameInput.trim());
    const s = getStats();
    setStats(s);
    setBadges(getBadges(s));
    setEditing(false);
  };

  if (!stats) return null;

  const accuracy =
    stats.quizAnswered > 0
      ? Math.round((stats.quizCorrect / stats.quizAnswered) * 100)
      : 0;

  const joinDate = stats.joinDate
    ? new Date(stats.joinDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Today";

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors mb-6"
      >
        ← Back to Live
      </Link>

      {/* Hero */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-4">
        <div className="h-0.5 bg-gradient-to-r from-green-500 to-emerald-400" />
        <div className="p-6 flex items-center gap-4">
          <Avatar name={stats.fanName || "?"} size="lg" />
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  maxLength={20}
                  className="flex-1 bg-zinc-800 border border-zinc-600 focus:border-green-500/50 rounded-xl px-3 py-2 text-white text-sm outline-none"
                />
                <button
                  onClick={saveName}
                  className="bg-green-500/20 border border-green-500/40 text-green-400 px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-zinc-500 px-2 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-white truncate">
                  {stats.fanName || "Anonymous Fan"}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors text-xs flex-shrink-0"
                  title="Edit name"
                >
                  ✏️
                </button>
              </div>
            )}
            <p className="text-xs text-zinc-500">
              Joined {joinDate} · {earnedCount}/{badges.length} badges earned
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">
                CricGenie Fan
              </span>
              {stats.totalScore >= 500 && (
                <span className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                  Legend
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-4xl font-black text-green-400 tabular-nums">
              {stats.totalScore}
            </p>
            <p className="text-xs text-zinc-500">total pts</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
        <StatCard
          label="Predictions"
          value={stats.predictions}
          color="text-yellow-400"
        />
        <StatCard
          label="Quiz Answered"
          value={stats.quizAnswered}
          color="text-purple-400"
        />
        <StatCard
          label="Quiz Accuracy"
          value={`${accuracy}%`}
          sub={`${stats.quizCorrect} correct`}
          color="text-blue-400"
        />
        <StatCard
          label="Matches"
          value={stats.matchesVisited.length}
          sub="engaged"
          color="text-pink-400"
        />
      </div>

      {/* Score breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-3">
          Score Breakdown
        </p>
        <div className="space-y-3">
          {[
            {
              label: "Predictions",
              pts: stats.predictions * 10,
              color: "bg-yellow-400",
              max: Math.max(stats.predictions * 10, stats.quizCorrect * 20),
            },
            {
              label: "Quiz",
              pts: stats.quizCorrect * 20,
              color: "bg-purple-400",
              max: Math.max(stats.predictions * 10, stats.quizCorrect * 20),
            },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">{row.label}</span>
                <span className="text-zinc-300 font-semibold">
                  {row.pts} pts
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${row.color} rounded-full transition-all duration-700`}
                  style={{
                    width: row.max > 0 ? `${(row.pts / row.max) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="mb-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-3">
          Badges · {earnedCount}/{badges.length}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      <div className="text-center py-4">
        <Link
          href="/leaderboard"
          className="inline-block bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          View Leaderboard →
        </Link>
      </div>
    </main>
  );
}
