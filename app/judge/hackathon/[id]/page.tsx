import { auth } from "@/auth";
import ModeToggle from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeUrl } from "@/lib/url";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function JudgeHackathonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: hackathonId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const judgeRecord = await prisma.hackathonJudge.findUnique({
    where: { userId_hackathonId: { userId: session.user.id, hackathonId } },
  });
  if (!judgeRecord) redirect("/judge/dashboard");

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
    select: { id: true, title: true, slug: true, startAt: true, endAt: true, status: true },
  });
  if (!hackathon) redirect("/judge/dashboard");

  const teams = await prisma.hackathonParticipant.findMany({
    where: { hackathonId },
    include: {
      user: { select: { name: true, githubUsername: true, avatar: true } },
      evaluations: {
        where: { judgeId: judgeRecord.id },
        select: { innovation: true, presentation: true },
      },
    },
    orderBy: { teamName: "asc" },
  });

  const totalTeams = teams.length;
  const evaluatedCount = teams.filter((t) => t.evaluations.length > 0).length;

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Hacky</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/judge/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
              Dashboard
            </Link>
            <ModeToggle />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <Link href="/judge/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition">
            &larr; Back to dashboard
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{hackathon.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {evaluatedCount}/{totalTeams} teams evaluated
              </p>
            </div>
            <Badge variant="secondary">{hackathon.status}</Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>Click a team to view their repo activity and evaluate.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {teams.map((team) => {
                const myEval = team.evaluations[0];
                const evaluated = !!myEval;

                return (
                  <article key={team.id} className="rounded-xl border p-5 hover:border-primary/20 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">{team.teamName}</h3>
                        <p className="text-xs text-muted-foreground">
                          Leader: {team.teamLeader} · {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {team.user.githubUsername ?? team.user.name ?? "—"}
                        </p>
                      </div>
                      {evaluated ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          Scored: {myEval.innovation + myEval.presentation}/20
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Not evaluated</Badge>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={`/judge/hackathon/${hackathonId}/team/${team.id}`}>
                        <Button variant="outline" size="sm">
                          View repo & evaluate
                        </Button>
                      </Link>
                      {team.deployedUrl && (
                        <a href={normalizeUrl(team.deployedUrl)} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                            Deployed URL
                          </Button>
                        </a>
                      )}
                      {team.presentationLink && (
                        <a href={normalizeUrl(team.presentationLink)} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                            Presentation
                          </Button>
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
