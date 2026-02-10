<div align="center">

# Hacky

**A hackathon management platform that aggregates and analyzes participants' GitHub activity.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-7c3aed?logo=auth0&logoColor=white)](https://authjs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## Overview

Hacky lets hackathon organizers authenticate students via GitHub OAuth and view their GitHub profiles through a clean dashboard. The platform is designed to eventually ingest repository data, pull requests, and commit history to evaluate participant activity.

> **Current Phase: Phase 1 — Auth & Dashboard MVP**
> Students can sign in with GitHub and view their profile on a protected dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Auth** | Auth.js v5 (GitHub OAuth) |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Prisma 6 |
| **Linting** | ESLint 9 (Next.js config) |
| **Runtime** | Node.js 20+ / npm |

---

## Features

### Completed

| Feature | Details |
|---------|---------|
| GitHub OAuth Login | Students sign in via GitHub using Auth.js v5 |
| Protected Dashboard | Session-gated page showing GitHub profile data |
| Landing Page | Minimal home page with login CTA |
| JWT Sessions | Stateless auth — no DB dependency for sessions |
| Prisma Schema | User, Account, Session, VerificationToken models |
| Database Migrations | Initial migration SQL ready for Supabase |
| Tailwind + Dark Mode | Global styles with dark mode support |
| ESLint | Code quality enforcement out of the box |

### Pending

| Feature | Priority |
|---------|----------|
| DB-backed session persistence | High |
| GitHub API data ingestion | High |
| Repository selection & sync | Medium |
| PR / commit analytics dashboard | Medium |
| Contributor leaderboard | Medium |
| Background sync jobs | Low |
| Search & filtering | Low |
| Unit / integration / e2e tests | Low |
| CI/CD pipeline | Low |

---

## Project Structure

```
hacky/
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts            # Auth.js API route handler
│   ├── dashboard/
│   │   └── page.tsx            # Protected dashboard (session-gated)
│   ├── login/
│   │   └── page.tsx            # GitHub OAuth login page
│   ├── favicon.ico
│   ├── globals.css             # Tailwind + global styles
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   └── page.tsx                # Landing / home page
├── lib/
│   └── prisma.ts               # Prisma client singleton
├── prisma/
│   ├── migrations/
│   │   └── 20260210120000_init/
│   │       └── migration.sql   # Initial DB migration
│   └── schema.prisma           # Data models
├── types/
│   └── next-auth.d.ts          # Auth.js type augmentations
├── auth.ts                     # Auth.js config (GitHub provider, JWT)
├── middleware.ts                # Route protection middleware
├── next.config.ts
├── tailwind / postcss configs
├── tsconfig.json
├── package.json
└── .env                        # Environment variables (not committed)
```

---

## Database Schema

Defined in `prisma/schema.prisma` and deployed via Prisma Migrate to Supabase (PostgreSQL).

```
┌──────────────────┐       ┌──────────────────────┐
│      User        │       │      Account          │
├──────────────────┤       ├──────────────────────┤
│ id          (pk) │◄──┐   │ provider        (pk) │
│ name             │   │   │ providerAccountId(pk)│
│ email     (uniq) │   │   │ userId          (fk) │──┐
│ emailVerified    │   │   │ access_token         │  │
│ image            │   │   │ refresh_token        │  │
│ githubUserId     │   │   │ expires_at           │  │
│ githubUsername   │   │   │ token_type           │  │
│ avatar           │   │   │ scope                │  │
│ createdAt        │   │   │ id_token             │  │
└──────────────────┘   │   │ session_state        │  │
        ▲              │   └──────────────────────┘  │
        │              │                              │
        │              └──────────────────────────────┘
        │
        │          ┌──────────────────────┐
        │          │      Session         │
        │          ├──────────────────────┤
        └──────────│ userId          (fk) │
                   │ sessionToken  (uniq) │
                   │ expires              │
                   └──────────────────────┘

┌─────────────────────────┐
│    VerificationToken    │
├─────────────────────────┤
│ identifier         (pk) │
│ token         (pk,uniq) │
│ expires                 │
└─────────────────────────┘
```

---

## GitHub Data Collection

### What we collect today

| Data Point | Source | Status |
|-----------|--------|--------|
| GitHub user ID | OAuth profile | Active |
| Username (login) | OAuth profile | Active |
| Avatar URL | OAuth profile | Active |
| Email | OAuth profile | Active |

### Planned collection (future phases)

| Data Point | Scope | Phase |
|-----------|-------|-------|
| Repository metadata | Stars, forks, language, push time | Phase 2 |
| Pull requests | State, author, timestamps, LOC changes | Phase 3 |
| Commits | SHA, author, message, commit time | Phase 3 |
| Contributor stats | Per-repo activity breakdown | Phase 4 |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** 10+
- A **Supabase** project (or any PostgreSQL instance)
- A **GitHub OAuth App** (for `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`)

### 1. Clone & install

```bash
git clone https://github.com/AmanTechWiz/Hacky.git
cd Hacky
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
AUTH_SECRET="your-random-secret-here"
AUTH_GITHUB_ID="your-github-oauth-app-id"
AUTH_GITHUB_SECRET="your-github-oauth-app-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up the database

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run the dev server

```bash
npm run dev
```

Open **http://localhost:3000** and click **Go to login** to sign in with GitHub.

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Create production build |
| `npm run start` | Serve production build locally |
| `npm run lint` | Run ESLint checks |

---

## Roadmap

```
Phase 1  ███████████████████████░░░░░  Current
Phase 2  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  Planned
Phase 3  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  Planned
Phase 4  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  Planned
Phase 5  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  Planned
```

| Phase | Focus | Key Deliverables |
|-------|-------|-----------------|
| **1** (current) | Auth & Dashboard MVP | GitHub OAuth, JWT sessions, protected dashboard |
| **2** | Database Integration | Prisma-backed sessions, user persistence in Supabase |
| **3** | GitHub Ingestion | Repo sync, PR/commit data collection, scheduled jobs |
| **4** | Analytics & Insights | Dashboards, contributor leaderboards, filtering |
| **5** | Production Readiness | Tests, CI/CD, deployment, error handling |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch and open a Pull Request

---

## License

This project is private and not yet licensed for distribution.

---

<div align="center">

**Built with Next.js, Auth.js, Prisma & Supabase**

</div>
