# Hacky

Hacky is a Next.js-based web app intended to aggregate and analyze GitHub activity.
The repository is currently in the foundation stage with the frontend scaffold and tooling in place.

## Project Phase

Current phase: **Phase 1 - Foundation/Scaffolding**

- Status: In progress
- Goal: Establish app shell, project conventions, and baseline tooling
- Next milestone: Add auth, persistence, and first GitHub data ingestion flow

## Tech Stack

- Framework: Next.js (App Router)
- UI: React + Tailwind CSS
- Language: TypeScript
- Linting: ESLint (Next.js config)
- Runtime/package manager: Node.js + npm

## Features

### Done

- Next.js app initialized with App Router
- TypeScript configuration added
- Tailwind CSS setup completed
- Base global styles and app layout configured
- Starter home page and static assets added
- ESLint setup for code quality

### Pending

- Authentication flow (GitHub OAuth integration in app logic)
- Database schema migration and ORM integration
- GitHub API ingestion service
- Dashboard screens for repos, pull requests, and contributors
- Filtering/search and analytics summaries
- Background sync and error handling
- Tests (unit/integration/e2e) and CI pipeline

## Project Structure

```text
hacky/
  app/
    favicon.ico
    globals.css
    layout.tsx
    page.tsx
  public/
    file.svg
    globe.svg
    next.svg
    vercel.svg
    window.svg
  .gitignore
  eslint.config.mjs
  next.config.ts
  package.json
  package-lock.json
  postcss.config.mjs
  tsconfig.json
  README.md
```

## Schema (Planned MVP Data Model)

The project has environment setup for a relational database, but core app schema is not yet implemented in code. Proposed MVP schema:

### `users`
- `id` (uuid, pk)
- `github_id` (text, unique)
- `username` (text, indexed)
- `avatar_url` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `repositories`
- `id` (uuid, pk)
- `github_repo_id` (bigint, unique)
- `owner_login` (text, indexed)
- `name` (text)
- `full_name` (text, indexed)
- `private` (boolean)
- `default_branch` (text)
- `language` (text)
- `stargazers_count` (int)
- `forks_count` (int)
- `open_issues_count` (int)
- `pushed_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `pull_requests`
- `id` (uuid, pk)
- `github_pr_id` (bigint, unique)
- `repo_id` (uuid, fk -> repositories.id)
- `number` (int)
- `title` (text)
- `state` (text)
- `author_login` (text, indexed)
- `created_at_github` (timestamp)
- `merged_at` (timestamp, nullable)
- `closed_at` (timestamp, nullable)
- `additions` (int)
- `deletions` (int)
- `changed_files` (int)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### `commits`
- `id` (uuid, pk)
- `github_commit_sha` (text, unique)
- `repo_id` (uuid, fk -> repositories.id)
- `author_login` (text, indexed)
- `message` (text)
- `committed_at` (timestamp)
- `created_at` (timestamp)

## GitHub Data We Are Collecting

### Current state

- No GitHub data is being collected in app code yet.
- OAuth credentials are present in environment config, but ingestion pipelines are not implemented.

### Planned collection scope (MVP)

- Account-level: authenticated user GitHub identity (`id`, `login`, avatar)
- Repository-level: metadata and activity summary (stars, forks, issue count, push time)
- Pull request-level: open/closed/merged state, author, timestamps, code change stats
- Commit-level: sha, author, message, commit time
- Contributor-level: per-repository contributor activity (planned)

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` with required values (example keys):
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_GITHUB_ID`
   - `AUTH_GITHUB_SECRET`
   - `NEXTAUTH_URL`
3. Run the app:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`

### Useful Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production build locally
- `npm run lint` - run ESLint

## Roadmap

- Phase 1 (current): Scaffold and tooling baseline
- Phase 2: Auth + database integration
- Phase 3: GitHub ingestion + scheduled sync
- Phase 4: Dashboard, insights, and filtering
- Phase 5: Testing, hardening, and deployment
