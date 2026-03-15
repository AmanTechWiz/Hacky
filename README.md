# Hacky

A **judge-first hackathon platform**: organizers create hackathons, participants register with teams and repos, judges evaluate via GitHub-style repo views and score on innovation & presentation, and the public leaderboard reveals results when the hackathon is marked complete.

---

## What it does

- **Organizers** (Google): Create hackathons, set dates, view registered teams, generate a short judge invite code, extend/delete hackathons, mark as completed.
- **Participants** (GitHub): Browse hackathons, register with team + repo + teammate GitHub URLs, submit deployed URL and presentation link, withdraw if needed.
- **Judges** (Google): Join with invite code, see teams, open GitHub-style repo view (commit heatmap, commits, languages), open deployed/presentation links and team GitHub profiles, score innovation & presentation.
- **Public**: Browse hackathons, view leaderboard (scores appear after organizer marks hackathon complete).

---

## Tech stack

| Layer      | Technology        |
|-----------|--------------------|
| Framework | Next.js 16 (App Router) |
| Language  | TypeScript 5      |
| Styling   | Tailwind CSS 4, shadcn/ui |
| Auth      | Auth.js v5 (GitHub + Google), database sessions |
| Database  | PostgreSQL (Supabase) |
| ORM       | Prisma 6          |

---

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- **PostgreSQL** (e.g. [Supabase](https://supabase.com))
- **GitHub OAuth App** (participant login)
- **Google OAuth client** (organizer & judge login)

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd hacky
npm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. For Supabase, use the **connection pooler** URL (port 6543, `?pgbouncer=true`). |
| `DIRECT_URL` | Same database, **direct** connection (e.g. Supabase pooler on port 5432). Required for Prisma migrations. |
| `AUTH_SECRET` | Random secret for session signing. Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev. |
| `AUTH_GITHUB_ID` | GitHub OAuth App Client ID. |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App Client secret. |
| `AUTH_GOOGLE_ID` | Google OAuth client ID. |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret. |
| `GITHUB_TOKEN` | *(Optional)* GitHub Personal Access Token for higher API rate limit when fetching repo commits/stats. |

**GitHub OAuth:** [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers). Set callback URL to `http://localhost:3000/api/auth/callback/github`.

**Google OAuth:** [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials). Create OAuth 2.0 Client ID (Web), add redirect URI `http://localhost:3000/api/auth/callback/google`.

### 3. Database

Generate the Prisma client and sync the schema (no existing migrations required):

```bash
npx prisma generate
npx prisma db push
```

If you use migrations instead:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run the app

```bash
npm run dev
```

Open **http://localhost:3000**. Use “Continue as participant” (GitHub), “Continue as organizer” (Google), or “Continue as judge” (Google). Organizers can create a hackathon and generate a judge invite code; judges enter that code at `/judge/join`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## Project structure

```
hacky/
├── app/
│   ├── api/                    # API routes (auth, hackathons, judge, evaluations, participations)
│   ├── dashboard/              # Participant dashboard
│   ├── hackathon/[slug]/       # Public leaderboard
│   ├── hackathons/             # Public hackathons list
│   ├── judge/                  # Judge invite, join, dashboard, hackathon teams & team detail
│   ├── login/
│   ├── organizer/               # Organizer dashboard, hackathon detail (teams + invite code)
│   └── page.tsx                # Landing
├── components/                 # UI (shadcn, repo-view, heatmap, forms, etc.)
├── lib/                        # Prisma, auth helpers, GitHub API, URL utils
├── prisma/
│   └── schema.prisma           # User, Hackathon, HackathonParticipant, HackathonJudge, Evaluation
├── auth.ts                     # Auth.js config
└── .env                        # Local env (not committed)
```

---

## License

Private. Not licensed for distribution.
