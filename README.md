# 🏏 CricGenie — AI-Powered Live Cricket Experience

> A real-time second-screen companion for IPL 2026, powered by **Google Gemini** and **live cricket data**.  
> Built for fans who want more than just a scoreboard.

### 🚀 [Live Demo → CricGenie](https://cricket-second-screen-agent-889533379107.us-central1.run.app)

---

## What is CricGenie?

CricGenie is a full-stack AI web application that transforms how cricket fans experience live IPL matches. Instead of passively watching scores update, CricGenie puts an intelligent co-commentator in your pocket — one that analyses every ball, predicts outcomes, quizzes you on cricket history, and lets you debate with other fans in a live AI-moderated room.

Every feature is powered by **Google Gemini 1.5 Flash**, with live match data streamed from the **CricAPI**. When no API key is configured, the app runs seamlessly on rich mock IPL 2026 data so you can explore the full experience instantly.

---

## Features

### 🎙️ AI Live Commentary
Gemini generates ball-by-ball commentary every 10 seconds — tagged as WICKET, SIX, FOUR, DOT, ANALYSIS, or UPDATE. Includes an optional voice mode that reads each entry aloud using the browser's speech synthesis API.

### 📊 Match Forecast (Win Probability)
A real-time gauge meter showing each team's win probability, calculated by Gemini from the current score, run rate, wickets, and overs remaining. Refreshes automatically every 30 seconds.

### 🗳️ Fan Vote
A live prediction poll on each match — fans vote YES or NO and see the community split in real time. Votes earn points that go on the leaderboard.

### 🧠 Fan Quiz
Gemini generates unique IPL trivia questions for each match — players, records, history, and tactics. Correct answers award 20 points; questions never repeat.

### 💬 Social Fan Room
A simulated live chat room per match, with AI-generated crowd messages, quick emoji reactions, and a Gemini AI moderator that drops contextual insights every 30 seconds. The room vibe (⚡ Electric, 😰 Tense, 🎉 Celebration, etc.) is updated by Gemini based on match state.

### 🤖 Ask Gemini
A full chat interface to ask anything about the current match — tactics, player form, strategy, historical context. Gemini responds with match-aware answers.

### 📰 AI Post-Match Report
After a match ends, Gemini writes a full editorial: headline, match narrative, key moments, Man of the Match, and player ratings with a 1–10 star scale. Shareable with one tap.

### 🔮 AI Pre-Match Preview
For upcoming fixtures, Gemini generates a preview: predicted winner, confidence percentage, key players to watch, pitch report, and head-to-head history.

### ⚡ Live Ball-by-Ball Ticker
A visual ball tracker that seeds from recent match events and simulates new deliveries — dots, boundaries, sixes, wickets — in real time with colour-coded balls.

### 🏆 Leaderboard & Profile
A fan profile tracking predictions made, quizzes answered, accuracy %, and matches engaged. Earn badges (First Vote, Cricket Brain, Match Watcher, Legend) and climb the weekly leaderboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) — App Router, Server Components, API Routes |
| AI | [Google Gemini 1.5 Flash](https://ai.google.dev) via `@google/generative-ai` |
| Live Data | [CricAPI](https://cricapi.com) — live scores, current matches, results |
| Styling | [Tailwind CSS v3](https://tailwindcss.com) — dark-first design system |
| Language | TypeScript — end to end |
| Deployment | Google Cloud Run (containerised) |

---

## Project Structure

```
CricGenie/
├── app/                          # Next.js App Router — routing only
│   ├── api/
│   │   ├── ai/                   # All Gemini-powered API routes
│   │   │   ├── ask/              # Chat Q&A with Gemini
│   │   │   ├── commentary/       # Live ball-by-ball commentary
│   │   │   ├── preview/          # Pre-match AI preview
│   │   │   ├── quiz/             # Fan trivia questions
│   │   │   ├── report/           # Post-match editorial report
│   │   │   ├── room-insight/     # Social room AI moderation
│   │   │   └── win-probability/  # Match forecast calculation
│   │   └── matches/              # CricAPI data endpoint
│   ├── leaderboard/page.tsx
│   ├── match/[id]/page.tsx       # Dynamic match detail page
│   ├── profile/page.tsx
│   ├── layout.tsx
│   └── page.tsx                  # Home — live & upcoming matches
│
├── components/                   # Shared React components
│   ├── match/                    # AICommentary, LiveTicker, MatchCard,
│   │                             # PostMatchReport, PreMatchPreview, WinProbability
│   ├── social/                   # AskGemini, FanQuiz, PredictionPoll, SocialRoom
│   └── ui/                       # CricketIcons, ThemeToggle, VisitTracker
│
└── lib/                          # Business logic & data utilities
    ├── cricket-api.ts            # CricAPI integration + mock fallback
    ├── matches.ts                # Match types + mock IPL 2026 data
    └── user-stats.ts             # Fan profile, badges, localStorage
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- A free [Google Gemini API key](https://makersuite.google.com/app/apikey)
- *(Optional)* A free [CricAPI key](https://cricapi.com) for live match data

### 1. Clone the repository

```bash
git clone https://github.com/your-username/cricgenie.git
cd cricgenie
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your keys:

```env
# Required — powers all AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — enables live IPL scores (falls back to mock data if not set)
CRICAPI_KEY=your_cricapi_key_here

# Leave as-is for local development
NEXT_PUBLIC_URL=http://localhost:3000
```

> **No keys?** The app runs fully in demo mode with realistic mock IPL 2026 data. All AI features work as long as `GEMINI_API_KEY` is set.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Keys

### Google Gemini (Required)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API key**
3. Copy the key into `GEMINI_API_KEY` in `.env.local`

The free tier includes generous usage limits — more than enough for development and demos.

### CricAPI (Optional)
1. Register at [cricapi.com](https://cricapi.com)
2. Copy your API key into `CRICAPI_KEY` in `.env.local`
3. Free tier: 100 calls/day

Without a CricAPI key, the app shows curated mock IPL 2026 matches with all AI features fully active.

---

## Deployment on Google Cloud Run

> **Already live:** [cricket-second-screen-agent-889533379107.us-central1.run.app](https://cricket-second-screen-agent-889533379107.us-central1.run.app)

### Build and push the Docker image

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

# Create Artifact Registry repo
gcloud artifacts repositories create cricgenie \
  --repository-format=docker \
  --location=us-central1

# Build and push
gcloud auth configure-docker us-central1-docker.pkg.dev
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cricgenie/app:latest .
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cricgenie/app:latest
```

### Deploy to Cloud Run

```bash
gcloud run deploy cricgenie \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cricgenie/app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars GEMINI_API_KEY=your_key,CRICAPI_KEY=your_key \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 5
```

---

## Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## How It Works

```
User opens a match
       │
       ▼
Next.js fetches live data from CricAPI (or mock fallback)
       │
       ▼
Match page renders with score, ticker, and AI widgets
       │
       ├─ AICommentary polls /api/ai/commentary every 10s
       │       └─ Gemini generates a typed entry (WICKET / SIX / FOUR / ...)
       │
       ├─ WinProbability polls /api/ai/win-probability every 30s
       │       └─ Gemini calculates probabilities from match state
       │
       ├─ SocialRoom polls /api/ai/room-insight every 30s
       │       └─ Gemini reads recent messages + match state → drops AI insight
       │
       └─ AskGemini, FanQuiz, PostMatchReport, PreMatchPreview
               └─ On-demand Gemini calls with full match context
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

[MIT](LICENSE)

---

<div align="center">
  Built with ❤️ for IPL 2026 · Powered by Google Gemini
</div>
