export type GitHubCommit = {
  sha: string;
  message: string;
  authorName: string;
  authorAvatar: string;
  authorLogin: string;
  date: string;
  url: string;
};

export type GitHubRepoStats = {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  languages: Record<string, number>;
  contributors: Array<{ login: string; avatar: string; contributions: number }>;
  defaultBranch: string;
};

function parseRepoUrl(repoUrl: string): { owner: string; repo: string } | null {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function ghFetch(path: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "hacky-platform",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`https://api.github.com${path}`, {
    headers,
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function getRepoStats(repoUrl: string): Promise<GitHubRepoStats | null> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) return null;

  const [repo, langs, contribs] = await Promise.all([
    ghFetch(`/repos/${parsed.owner}/${parsed.repo}`),
    ghFetch(`/repos/${parsed.owner}/${parsed.repo}/languages`),
    ghFetch(`/repos/${parsed.owner}/${parsed.repo}/contributors?per_page=10`),
  ]);

  if (!repo) return null;

  return {
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
    languages: (langs as Record<string, number>) ?? {},
    contributors: Array.isArray(contribs)
      ? contribs.map((c: { login: string; avatar_url: string; contributions: number }) => ({
          login: c.login,
          avatar: c.avatar_url,
          contributions: c.contributions,
        }))
      : [],
    defaultBranch: repo.default_branch,
  };
}

export async function getRepoCommits(
  repoUrl: string,
  since?: string,
  until?: string
): Promise<GitHubCommit[]> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) return [];

  const params = new URLSearchParams({ per_page: "100" });
  if (since) params.set("since", since);
  if (until) params.set("until", until);

  const data = await ghFetch(
    `/repos/${parsed.owner}/${parsed.repo}/commits?${params.toString()}`
  );

  if (!Array.isArray(data)) return [];

  return data.map(
    (c: {
      sha: string;
      commit: { message: string; author: { name: string; date: string } };
      author?: { login: string; avatar_url: string };
      html_url: string;
    }) => ({
      sha: c.sha,
      message: c.commit.message.split("\n")[0],
      authorName: c.commit.author.name,
      authorAvatar: c.author?.avatar_url ?? "",
      authorLogin: c.author?.login ?? c.commit.author.name,
      date: c.commit.author.date,
      url: c.html_url,
    })
  );
}

export function buildCommitHeatmap(
  commits: GitHubCommit[],
  startDate: string,
  endDate: string
): { date: string; count: number }[] {
  const counts: Record<string, number> = {};

  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);

  let end = new Date(endDate);
  const now = new Date();
  if (end > now) end = now;
  end.setUTCHours(23, 59, 59, 999);

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    counts[d.toISOString().slice(0, 10)] = 0;
  }

  for (const commit of commits) {
    const day = new Date(commit.date).toISOString().slice(0, 10);
    if (counts[day] !== undefined) {
      counts[day]++;
    }
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}
