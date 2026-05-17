export interface UserStats {
  fanName: string;
  totalScore: number;
  predictions: number;
  quizAnswered: number;
  quizCorrect: number;
  matchesVisited: string[];
  joinDate: string;
}

const DEFAULTS: UserStats = {
  fanName: "",
  totalScore: 0,
  predictions: 0,
  quizAnswered: 0,
  quizCorrect: 0,
  matchesVisited: [],
  joinDate: new Date().toISOString(),
};

export function getStats(): UserStats {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem("cricgenie-stats");
    const saved: Partial<UserStats> = raw ? JSON.parse(raw) : {};
    // Back-compat: merge legacy predictionScore key
    const legacyScore = parseInt(localStorage.getItem("predictionScore") ?? "0");
    const fanName =
      saved.fanName || localStorage.getItem("cricgenie-fan-name") || "";
    return {
      ...DEFAULTS,
      ...saved,
      fanName,
      totalScore: saved.totalScore ?? legacyScore,
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveStats(patch: Partial<UserStats>): UserStats {
  const current = getStats();
  const next = { ...current, ...patch };
  localStorage.setItem("cricgenie-stats", JSON.stringify(next));
  // Keep legacy key in sync for leaderboard
  localStorage.setItem("predictionScore", String(next.totalScore));
  return next;
}

export function recordPrediction(points = 10) {
  const s = getStats();
  saveStats({ totalScore: s.totalScore + points, predictions: s.predictions + 1 });
}

export function recordQuizAnswer(correct: boolean) {
  const s = getStats();
  saveStats({
    totalScore: correct ? s.totalScore + 20 : s.totalScore,
    quizAnswered: s.quizAnswered + 1,
    quizCorrect: correct ? s.quizCorrect + 1 : s.quizCorrect,
  });
}

export function recordMatchVisit(matchId: string) {
  const s = getStats();
  if (!s.matchesVisited.includes(matchId)) {
    saveStats({ matchesVisited: [...s.matchesVisited, matchId] });
  }
  // Ensure joinDate is set
  if (!s.joinDate) saveStats({ joinDate: new Date().toISOString() });
}

export function setFanName(name: string) {
  localStorage.setItem("cricgenie-fan-name", name);
  saveStats({ fanName: name });
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
}

export function getBadges(stats: UserStats): Badge[] {
  return [
    {
      id: "first-vote",
      icon: "🗳️",
      name: "First Vote",
      desc: "Cast your first prediction",
      earned: stats.predictions >= 1,
    },
    {
      id: "poll-pro",
      icon: "🔥",
      name: "Poll Pro",
      desc: "Cast 5 predictions",
      earned: stats.predictions >= 5,
    },
    {
      id: "cricket-brain",
      icon: "🧠",
      name: "Cricket Brain",
      desc: "Answer 3 quiz questions correctly",
      earned: stats.quizCorrect >= 3,
    },
    {
      id: "sharp-eye",
      icon: "🎯",
      name: "Sharp Eye",
      desc: "Answer 10 quiz questions",
      earned: stats.quizAnswered >= 10,
    },
    {
      id: "match-watcher",
      icon: "👁️",
      name: "Match Watcher",
      desc: "Engage with 3 different matches",
      earned: stats.matchesVisited.length >= 3,
    },
    {
      id: "rising-star",
      icon: "⭐",
      name: "Rising Star",
      desc: "Reach 100 points",
      earned: stats.totalScore >= 100,
    },
    {
      id: "legend",
      icon: "🏆",
      name: "Cricket Legend",
      desc: "Reach 500 points",
      earned: stats.totalScore >= 500,
    },
  ];
}

// ─── Avatar colour (deterministic from name) ─────────────────────────────────

const AVATAR_GRADIENTS = [
  "from-pink-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-600",
  "from-orange-500 to-amber-500",
  "from-red-500 to-rose-600",
  "from-violet-500 to-indigo-600",
];

export function avatarGradient(name: string): string {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length];
}
