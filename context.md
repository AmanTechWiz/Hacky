# Hacky Session Context

This file is persistent handoff memory for future sessions and agents.

## Product Idea (North Star)

Hacky is a judge-first hackathon evaluation platform designed to make project assessment fair, transparent, and fast.

Long-term direction:
- students authenticate with GitHub and submit repos
- organizers define hackathons, timelines, and judges
- platform analyzes repository and commit timelines for suspicious patterns
- judges evaluate from one dashboard (code context + commit history + AI summaries + scoring)

Current implementation intentionally covers only **Phase 1**.

## Current Phase and Scope

### Phase 2 status
Phase 2 baseline is now implemented:
- role-first entry on homepage (`participant` vs `organizer`)
- login supports GitHub and Google
- organizers can create hackathons
- participants can see upcoming hackathons and quick-signup with placeholder fields

### Phase 1 goal
Only student authentication and persistence:
- GitHub OAuth login
- save user profile in DB
- persistent session
- protected dashboard
- minimal polished UI (`/login`, `/dashboard`)

### Explicitly out of scope
- no hackathon model
- no organizer/judge modules
- no repo selection flow yet
- no commit analysis/scoring yet

## What Was Done So Far

1. Initialized Next.js App Router project with TypeScript.
2. Added Auth.js v5 + Prisma + PostgreSQL (Supabase) stack.
3. Added Prisma schema with Auth.js-compatible models:
   - `User`, `Account`, `Session`, `VerificationToken`
4. Added migration artifacts and generated Prisma client.
5. Implemented Auth.js config in `auth.ts`:
   - GitHub provider
   - Prisma adapter
   - database sessions
   - session callback exposing `id`, `githubUserId`, `githubUsername`, `avatar`
6. Added route handler at `app/api/auth/[...nextauth]/route.ts`.
7. Added pages:
   - `/login` with server-action `signIn("github")`
   - `/dashboard` with server-side `auth()` guard + sign-out
8. Added `lib/prisma.ts` singleton and `types/next-auth.d.ts` augmentation.
9. Polished login/dashboard UI to a modern dark style.
10. Created this context handoff file.

## Critical Bugs Encountered and Final Fixes

### Bug A: `AccessDenied` after GitHub callback
Symptom:
- login returned Auth.js `AccessDenied`
- user data not saved reliably on first login

Root cause:
- updating user in `callbacks.signIn` sometimes ran before a stable persisted row context

Fix:
- moved GitHub field persistence to `events.signIn`
- resolve linked `Account` (`provider + providerAccountId`) -> `userId`
- update `User` by that `userId`
- keep `githubUserId` effectively immutable once set

### Bug B: app looked broken / auth loop / edge runtime errors
Symptom:
- repeated redirects
- `PrismaClientValidationError` mentioning edge runtime

Root cause:
- middleware called `auth()` which invoked Prisma adapter in Edge runtime

Fix:
- removed `auth()` usage from middleware
- middleware now pass-through
- protection remains server-side in `app/dashboard/page.tsx` using `auth()` + redirect

## Important Architectural Decisions (Do Not Accidentally Revert)

1. **Persist GitHub profile fields in `events.signIn`, not `callbacks.signIn`.**
2. **Do not use Prisma-backed `auth()` from middleware/edge runtime.**
3. **Keep dashboard protection server-side (`auth()` in page) as source of truth.**
4. **Use `githubUserId` as immutable identity anchor.**

## Current Data Model (Phase 1)

`User` includes:
- `id`
- `name`
- `email` (nullable/unique)
- `emailVerified`
- `image`
- `githubUserId` (nullable/unique but should be set post-login)
- `githubUsername`
- `avatar`
- `createdAt`

Auth.js tables:
- `Account`
- `Session`
- `VerificationToken`

## Current Project Structure

```text
hacky/
├── app/
│   ├── api/auth/[...nextauth]/route.ts
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── lib/
│   └── prisma.ts
├── types/
│   └── next-auth.d.ts
├── auth.ts
├── middleware.ts
├── .env.example
├── README.md
└── context.md
```

## Environment Requirements

Required env vars:
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `NEXTAUTH_URL`

Notes:
- GitHub callback URL must match exactly:
  - `http://localhost:3000/api/auth/callback/github`
- GitHub email may be null for privacy reasons.

## Runtime Verification Checklist (Phase 1)

1. Login works via `/login`.
2. Redirect to `/dashboard` after auth.
3. User row created/updated with required GitHub fields.
4. Account and Session rows exist.
5. Refresh keeps user logged in.
6. Sign out works and dashboard redirects when unauthenticated.

## Next Planned Work (Phase 2+)

1. Add hackathon and submission domain models.
2. Implement repo selection per submission (single repo per hackathon entry).
3. Start with public repo flow; add private repo scope (`repo`) only if required.
4. Add repo metadata ingestion and audit signals (commit windows, contributors, etc.).

## New Agent Instructions

When a new agent starts:

1. Read `context.md` first, then `README.md`.
2. Confirm these invariants before changes:
   - `events.signIn` handles GitHub field persistence
   - middleware does not call Prisma-backed `auth()`
   - dashboard remains server-protected
3. Avoid broad refactors unless requested.
4. Keep changes scoped to requested phase (do not add hackathon features unless asked).
5. Run lint/build checks after meaningful changes.
6. Update this file after major decisions or bug fixes.

## Quick Start Commands

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```
