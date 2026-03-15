"use client";

import CommitHeatmap from "@/components/commit-heatmap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { normalizeUrl } from "@/lib/url";
import Image from "next/image";

type GitHubCommit = {
  sha: string;
  message: string;
  authorName: string;
  authorAvatar: string;
  authorLogin: string;
  date: string;
  url: string;
};

type Contributor = {
  login: string;
  avatar: string;
  contributions: number;
};

type RepoStats = {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  languages: Record<string, number>;
  contributors: Contributor[];
  defaultBranch: string;
};

type HeatmapDay = { date: string; count: number };

type Props = {
  stats: RepoStats | null;
  commits: GitHubCommit[];
  heatmapData: HeatmapDay[];
  repoUrl: string;
  deployedUrl: string | null;
  presentationLink: string | null;
  /** GitHub username of the participant who registered (team leader). */
  registrantGitHubUsername?: string | null;
  /** GitHub profile URLs for teammates (e.g. https://github.com/username). */
  teammateGithubUrls?: string[];
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Rust: "#dea584",
  Go: "#00add8",
  Java: "#b07219",
  Ruby: "#701516",
  CSS: "#563d7c",
  HTML: "#e34c26",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051",
  PHP: "#4f5d95",
  Dart: "#00b4ab",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Svelte: "#ff3e00",
  Vue: "#41b883",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeSince(d: string) {
  const seconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function githubUrlToLabel(url: string): string {
  const match = url.match(/github\.com\/([^/]+)\/?$/);
  return match ? match[1] : url.replace(/^https?:\/\//, "").replace(/\/$/, "") || "GitHub";
}

export default function RepoView({
  stats,
  commits,
  heatmapData,
  repoUrl,
  deployedUrl,
  presentationLink,
  registrantGitHubUsername,
  teammateGithubUrls = [],
}: Props) {
  const totalLangBytes = stats
    ? Object.values(stats.languages).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
            </svg>
            {stats?.fullName ?? repoUrl.replace("https://github.com/", "")}
          </h2>
          {stats?.description && (
            <p className="text-sm text-muted-foreground">{stats.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {stats && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
                {stats.stars}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>
                {stats.forks}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <a href={repoUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <svg className="mr-1.5 h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>
            View on GitHub
          </Button>
        </a>
        {deployedUrl && (
          <a href={normalizeUrl(deployedUrl)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <svg className="mr-1.5 h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M4.75 0h6.5a4.75 4.75 0 0 1 4.75 4.75v6.5A4.75 4.75 0 0 1 11.25 16h-6.5A4.75 4.75 0 0 1 0 11.25v-6.5A4.75 4.75 0 0 1 4.75 0Zm6.5 1.5h-6.5a3.25 3.25 0 0 0-3.25 3.25v6.5a3.25 3.25 0 0 0 3.25 3.25h6.5a3.25 3.25 0 0 0 3.25-3.25v-6.5a3.25 3.25 0 0 0-3.25-3.25ZM8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/></svg>
              Deployed URL
            </Button>
          </a>
        )}
        {presentationLink && (
          <a href={normalizeUrl(presentationLink)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <svg className="mr-1.5 h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25Zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25ZM3.5 6.25a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75Zm.75 2.25h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1 0-1.5Z"/></svg>
              Presentation
            </Button>
          </a>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Heatmap */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">
              {commits.length} commit{commits.length !== 1 ? "s" : ""} during hackathon period
            </h3>
            <CommitHeatmap data={heatmapData} />
          </div>

          {/* Commit list */}
          <div className="rounded-lg border">
            <div className="border-b bg-muted/50 px-4 py-2">
              <h3 className="text-sm font-medium">Commits</h3>
            </div>
            {commits.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No commits found in the hackathon period.
              </div>
            ) : (
              <div className="divide-y">
                {commits.map((commit) => (
                  <div key={commit.sha} className="flex items-start gap-3 px-4 py-3">
                    {commit.authorAvatar ? (
                      <Image
                        src={commit.authorAvatar}
                        alt={commit.authorLogin}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:text-blue-500 hover:underline"
                      >
                        {commit.message}
                      </a>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-medium">{commit.authorLogin}</span>{" "}
                        committed {timeSince(commit.date)}
                      </p>
                    </div>
                    <a
                      href={commit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline-block shrink-0 rounded-md border bg-muted px-2 py-0.5 font-mono text-xs hover:bg-accent"
                    >
                      {commit.sha.slice(0, 7)}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team members */}
          {(registrantGitHubUsername || teammateGithubUrls.length > 0) && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">Team members</h3>
              <ul className="space-y-2 text-sm">
                {registrantGitHubUsername && (
                  <li>
                    <a
                      href={`https://github.com/${registrantGitHubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                      </svg>
                      <span className="font-medium">{registrantGitHubUsername}</span>
                      <span className="text-xs">(registrant)</span>
                    </a>
                  </li>
                )}
                {teammateGithubUrls.map((url, i) => (
                  <li key={i}>
                    <a
                      href={normalizeUrl(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:underline"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                      </svg>
                      {githubUrlToLabel(url)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {stats && totalLangBytes > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">Languages</h3>
              <div className="mb-2 flex h-2 overflow-hidden rounded-full">
                {Object.entries(stats.languages).map(([lang, bytes]) => (
                  <div
                    key={lang}
                    style={{
                      width: `${(bytes / totalLangBytes) * 100}%`,
                      backgroundColor: LANG_COLORS[lang] ?? "#8b949e",
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {Object.entries(stats.languages).map(([lang, bytes]) => (
                  <span key={lang} className="flex items-center gap-1">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: LANG_COLORS[lang] ?? "#8b949e" }}
                    />
                    {lang}{" "}
                    <span className="text-muted-foreground">
                      {((bytes / totalLangBytes) * 100).toFixed(1)}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contributors */}
          {stats && stats.contributors.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">
                Contributors ({stats.contributors.length})
              </h3>
              <div className="flex flex-wrap gap-1">
                {stats.contributors.map((c) => (
                  <a
                    key={c.login}
                    href={`https://github.com/${c.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${c.login} (${c.contributions} commits)`}
                  >
                    <Image
                      src={c.avatar}
                      alt={c.login}
                      width={32}
                      height={32}
                      className="rounded-full hover:ring-2 hover:ring-primary"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Quick stats */}
          {stats && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 text-sm font-medium">About</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Default branch: <span className="font-mono">{stats.defaultBranch}</span></p>
                <p>{stats.stars} star{stats.stars !== 1 ? "s" : ""}</p>
                <p>{stats.forks} fork{stats.forks !== 1 ? "s" : ""}</p>
                <p>{stats.watchers} watcher{stats.watchers !== 1 ? "s" : ""}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
