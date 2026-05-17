import type { Match } from "./matches";
import { MOCK_MATCHES, MOCK_PAST_MATCHES } from "./matches";

const CRICAPI_BASE = "https://api.cricapi.com/v1";
const CURRENT_YEAR = "2026";

// ─── IPL detection ────────────────────────────────────────────────────────────

const IPL_TEAM_NAMES = [
  "mumbai indians",
  "chennai super kings",
  "royal challengers bengaluru",
  "royal challengers bangalore",
  "kolkata knight riders",
  "rajasthan royals",
  "delhi capitals",
  "sunrisers hyderabad",
  "punjab kings",
  "kings xi punjab",
  "lucknow super giants",
  "gujarat titans",
];

function isIPLMatch(m: RawMatch): boolean {
  const name = (m.name ?? "").toLowerCase();
  if (name.includes("ipl") || name.includes("indian premier league")) return true;
  const t1 = (m.t1 ?? m.teams?.[0] ?? "").toLowerCase();
  const t2 = (m.t2 ?? m.teams?.[1] ?? "").toLowerCase();
  return IPL_TEAM_NAMES.some(
    (n) => t1 === n || t2 === n || t1.includes(n) || t2.includes(n)
  );
}

function isCompleted(m: RawMatch): boolean {
  return m.matchEnded === true || m.ms === "result";
}

function isLive(m: RawMatch): boolean {
  return m.ms === "live" || (m.matchStarted === true && !isCompleted(m) && m.matchEnded === false);
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchCricScore(apiKey: string): Promise<RawMatch[]> {
  const res = await fetch(`${CRICAPI_BASE}/cricScore?apikey=${apiKey}`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`cricScore ${res.status}`);
  const data = await res.json();
  if (data.status !== "success" || !Array.isArray(data.data)) return [];
  return data.data as RawMatch[];
}

async function fetchCurrentMatches(apiKey: string): Promise<RawMatch[]> {
  const res = await fetch(
    `${CRICAPI_BASE}/currentMatches?apikey=${apiKey}&offset=0`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (data.status !== "success" || !Array.isArray(data.data)) return [];
  return data.data as RawMatch[];
}

async function fetchMatchesList(apiKey: string, offset = 0): Promise<RawMatch[]> {
  const res = await fetch(
    `${CRICAPI_BASE}/matches?apikey=${apiKey}&offset=${offset}`,
    { next: { revalidate: 300 } }   // past results change slowly
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (data.status !== "success" || !Array.isArray(data.data)) return [];
  return data.data as RawMatch[];
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getLiveMatches(): Promise<{
  currentMatches: Match[];   // live + upcoming
  pastMatches: Match[];      // completed IPL 2026 results
  isLive: boolean;
}> {
  const apiKey = process.env.CRICAPI_KEY;
  if (!apiKey) {
    const mockCurrent = MOCK_MATCHES.filter((m) => m.status !== "Result").sort((a, b) => {
      const aLive = a.status.toUpperCase() === "LIVE" || a.status.toUpperCase() === "IN PROGRESS" ? 1 : 0;
      const bLive = b.status.toUpperCase() === "LIVE" || b.status.toUpperCase() === "IN PROGRESS" ? 1 : 0;
      return bLive - aLive; // live first, upcoming last
    });
    return {
      currentMatches: mockCurrent,
      pastMatches: MOCK_PAST_MATCHES,
      isLive: mockCurrent.some((m) => m.status.toUpperCase() === "LIVE"),
    };
  }

  try {
    // Fetch all sources in parallel — two pages of historical data for broader coverage
    const [scoreData, currentData, histData0, histData1] = await Promise.allSettled([
      fetchCricScore(apiKey),
      fetchCurrentMatches(apiKey),
      fetchMatchesList(apiKey, 0),
      fetchMatchesList(apiKey, 25),
    ]);

    const merge = (...lists: RawMatch[][]): RawMatch[] => {
      const seen = new Set<string>();
      const out: RawMatch[] = [];
      for (const m of lists.flat()) {
        if (!seen.has(m.id)) { seen.add(m.id); out.push(m); }
      }
      return out;
    };

    const scoreList   = scoreData.status   === "fulfilled" ? scoreData.value   : [];
    const currentList = currentData.status === "fulfilled" ? currentData.value : [];
    const histList0   = histData0.status   === "fulfilled" ? histData0.value   : [];
    const histList1   = histData1.status   === "fulfilled" ? histData1.value   : [];
    const histList    = [...histList0, ...histList1];

    const all = merge(scoreList, currentList, histList).filter(isIPLMatch);

    if (all.length === 0) {
      console.warn("No IPL matches from API — using mock data");
      return {
        currentMatches: MOCK_MATCHES.filter((m) => m.status !== "Result"),
        pastMatches: MOCK_PAST_MATCHES,
        isLive: false,
      };
    }

    const getTime = (m: RawMatch) =>
      new Date(m.dateTimeGMT ?? m.date ?? 0).getTime();

    // Current = live or not-yet-ended
    // Sort: live first, then upcoming by date ASCENDING (soonest next)
    const current = all
      .filter((m) => !isCompleted(m))
      .sort((a, b) => {
        const liveA = isLive(a) ? 1 : 0;
        const liveB = isLive(b) ? 1 : 0;
        if (liveA !== liveB) return liveB - liveA; // live first
        return getTime(a) - getTime(b);             // soonest upcoming first
      });

    // Past = completed, newest first
    const past = all
      .filter(isCompleted)
      .sort((a, b) => getTime(b) - getTime(a));

    // Always guarantee past data — fall back to mock when API returns none
    const pastResult = past.length > 0
      ? past.slice(0, 10).map(transform)
      : MOCK_PAST_MATCHES;

    return {
      currentMatches: current.slice(0, 6).map(transform),
      pastMatches:    pastResult,
      isLive:         current.some(isLive),
    };
  } catch (err) {
    console.error("CricAPI error:", err);
    return {
      currentMatches: MOCK_MATCHES.filter((m) => m.status !== "Result"),
      pastMatches: MOCK_PAST_MATCHES,
      isLive: false,
    };
  }
}

export async function getLiveMatch(id: string): Promise<Match | null> {
  const { currentMatches, pastMatches } = await getLiveMatches();
  return [...currentMatches, ...pastMatches].find((m) => m.id === id) ?? null;
}

// ─── Transform ───────────────────────────────────────────────────────────────

function formatScore(s: CricScore | undefined, fallback: string | undefined): string {
  if (fallback) return fallback; // t1s / t2s already formatted (e.g. "156/4 (15.3)")
  if (!s) return "Yet to bat";
  const oStr = s.o != null ? ` (${s.o} ov)` : "";
  return `${s.r}/${s.w}${oStr}`;
}

function transform(raw: RawMatch): Match {
  const teams = raw.teams ?? [];
  const teamA = teams[0] ?? raw.t1 ?? "Team A";
  const teamB = teams[1] ?? raw.t2 ?? "Team B";

  // ── Scores ────────────────────────────────────────────────────────────────
  let scoreA = "Yet to bat";
  let scoreB = "Yet to bat";
  let overs = "In Progress";

  if (raw.score?.length) {
    // Prefer the score[] array (more structured) but use t1s/t2s as override
    // if they look richer (contain parentheses with overs info)
    const s0 = raw.score[0];
    const s1 = raw.score[1];
    const t1Override = raw.t1s?.includes("(") ? raw.t1s : undefined;
    const t2Override = raw.t2s?.includes("(") ? raw.t2s : undefined;
    scoreA = formatScore(s0, t1Override);
    scoreB = formatScore(s1, t2Override);
    if (isCompleted(raw)) {
      const d = raw.dateTimeGMT ?? raw.date;
      const dateStr = d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
      overs = dateStr ? `Completed · ${dateStr}` : "Completed";
    } else {
      overs = s0?.o != null ? `Over ${s0.o} / 20` : "In Progress";
    }
  } else if (raw.t1s || raw.t2s) {
    scoreA = raw.t1s || "Yet to bat";
    scoreB = raw.t2s || "Yet to bat";
  }

  // ── Match context line (shown under scores on card) ───────────────────────
  // e.g. "MI need 47 runs in 34 balls" or "CSK won by 5 wickets"
  const matchContext = raw.status && raw.status.toLowerCase() !== "in progress"
    ? raw.status
    : "";

  // ── Status badge label ────────────────────────────────────────────────────
  let statusLabel = "LIVE";
  if (isCompleted(raw)) {
    statusLabel = "Result";
  } else if (!raw.matchStarted && raw.dateTimeGMT) {
    const matchDate = new Date(raw.dateTimeGMT);
    statusLabel = matchDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // recentEvents[0] = match context, rest = generic
  const recentEvents = matchContext
    ? [matchContext, `${teamA} vs ${teamB} — IPL 2026`]
    : [`${teamA} vs ${teamB} — Match in progress`];

  const momentumA = deriveMomentum(raw.score?.[0]);

  return {
    id: raw.id,
    teamA,
    teamB,
    sport: "Cricket",
    scoreA,
    scoreB,
    overs,
    status: statusLabel,
    matchContext,
    venue: raw.venue ?? "Venue TBD",
    recentEvents,
    teamAMomentum: momentumA,
    teamBMomentum: 100 - momentumA,
    prediction: {
      question: `Will ${teamA} score a boundary this over?`,
      yesVotes: 200 + ((raw.score?.[0]?.r ?? 0) % 300),
      noVotes: 80 + (raw.score?.[0]?.w ?? 0) * 15,
    },
  };
}

function deriveMomentum(s: CricScore | undefined): number {
  if (!s) return 50;
  const rr = s.o > 0 ? s.r / s.o : 0;
  const pressure = (s.w ?? 0) * 5;
  return Math.round(Math.min(90, Math.max(10, 50 + rr * 2 - pressure)));
}

// ─── CricAPI types ────────────────────────────────────────────────────────────

interface CricScore {
  r: number;
  w: number;
  o: number;
  inning: string;
}

interface RawMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date?: string;
  dateTimeGMT?: string;
  teams?: string[];
  // cricScore flat fields
  t1?: string;
  t2?: string;
  t1s?: string;
  t2s?: string;
  score?: CricScore[];
  ms?: "live" | "result" | "upcoming";
  matchStarted?: boolean;
  matchEnded?: boolean;
}

// suppress unused-var warning for CURRENT_YEAR (used as documentation)
void CURRENT_YEAR;
