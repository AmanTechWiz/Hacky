import { auth } from "@/auth";
import ModeToggle from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

function getDashboardPath(role: string) {
  if (role === "ORGANIZER") return "/organizer/dashboard";
  if (role === "JUDGE") return "/judge/dashboard";
  return "/dashboard";
}

type TeamScore = {
  rank: number;
  teamName: string;
  teamLeader: string;
  avgInnovation: number;
  avgPresentation: number;
  avgTotal: number;
  evalCount: number;
};

function medal(rank: number): string {
  if (rank === 1) return "\u{1F947}";
  if (rank === 2) return "\u{1F948}";
  if (rank === 3) return "\u{1F949}";
  return `#${rank}`;
}

export default async function PublicLeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const hackathon = await prisma.hackathon.findUnique({
    where: { slug },
    include: {
      participants: {
        include: { evaluations: true },
      },
      _count: { select: { judges: true } },
    },
  });

  if (!hackathon) notFound();

  const showScores = hackathon.status === "COMPLETED";

  const teams: TeamScore[] = hackathon.participants
    .map((p) => {
      const evals = p.evaluations;
      const count = evals.length;
      const avgInnovation = count > 0 ? evals.reduce((s, e) => s + e.innovation, 0) / count : 0;
      const avgPresentation = count > 0 ? evals.reduce((s, e) => s + e.presentation, 0) / count : 0;
      const avgTotal = (avgInnovation + avgPresentation) / 2;
      return { rank: 0, teamName: p.teamName, teamLeader: p.teamLeader, avgInnovation, avgPresentation, avgTotal, evalCount: count };
    })
    .sort((a, b) => b.avgTotal - a.avgTotal)
    .map((t, i) => ({ ...t, rank: i + 1 }));

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Hacky</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/hackathons" className="text-sm text-muted-foreground hover:text-foreground transition">
              Hackathons
            </Link>
            {isLoggedIn ? (
              <Link href={getDashboardPath(session.user.role)}>
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login?role=participant">
                <Button variant="outline" size="sm">Sign in</Button>
              </Link>
            )}
            <ModeToggle />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <Link href="/hackathons" className="text-xs text-muted-foreground hover:text-foreground transition">
            &larr; All hackathons
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Leaderboard</p>
              <h1 className="text-3xl font-bold tracking-tight">{hackathon.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {hackathon.startAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" — "}
                {hackathon.endAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" · "}
                {teams.length} team{teams.length !== 1 ? "s" : ""}
                {" · "}
                {hackathon._count.judges} judge{hackathon._count.judges !== 1 ? "s" : ""}
              </p>
            </div>
            <Badge variant={hackathon.status === "COMPLETED" ? "default" : "secondary"}>
              {hackathon.status}
            </Badge>
          </div>
        </div>

        {!showScores ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Results pending</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Scores will be revealed when the organizer marks this hackathon as completed.
              </p>
            </CardContent>
          </Card>
        ) : teams.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">No teams participated.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Top 3 podium */}
            {teams.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-2">
                {[teams[1], teams[0], teams[2]].map((team, i) => {
                  const heights = ["h-28", "h-36", "h-24"];
                  const gradients = [
                    "from-zinc-400/20 to-zinc-300/10",
                    "from-amber-500/20 to-yellow-400/10",
                    "from-orange-600/20 to-amber-500/10",
                  ];
                  return (
                    <div key={team.teamName} className="text-center">
                      <p className="text-sm font-semibold mb-1 truncate">{team.teamName}</p>
                      <p className="text-2xl mb-2">{medal(team.rank)}</p>
                      <div className={`${heights[i]} rounded-t-xl bg-gradient-to-b ${gradients[i]} border border-b-0 flex items-center justify-center`}>
                        <span className="text-2xl font-bold">{team.avgTotal.toFixed(1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Rankings</CardTitle>
                <CardDescription>Final scores based on all judge evaluations.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="pb-3 pr-4">Rank</th>
                        <th className="pb-3 pr-4">Team</th>
                        <th className="pb-3 pr-4 text-right">Innovation</th>
                        <th className="pb-3 pr-4 text-right">Presentation</th>
                        <th className="pb-3 text-right">Average</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {teams.map((team) => (
                        <tr key={team.teamName} className={team.rank <= 3 ? "bg-muted/30" : ""}>
                          <td className="py-4 pr-4 text-lg font-semibold">{medal(team.rank)}</td>
                          <td className="py-4 pr-4">
                            <p className="font-medium">{team.teamName}</p>
                            <p className="text-xs text-muted-foreground">
                              Led by {team.teamLeader}
                              {team.evalCount > 0 && ` · ${team.evalCount} eval${team.evalCount > 1 ? "s" : ""}`}
                            </p>
                          </td>
                          <td className="py-4 pr-4 text-right font-mono">{team.avgInnovation.toFixed(1)}</td>
                          <td className="py-4 pr-4 text-right font-mono">{team.avgPresentation.toFixed(1)}</td>
                          <td className="py-4 text-right font-mono font-bold">{team.avgTotal.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
