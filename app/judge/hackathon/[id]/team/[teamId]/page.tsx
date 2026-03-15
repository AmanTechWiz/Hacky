import { auth } from "@/auth";
import EvaluationForm from "@/components/evaluation-form";
import ModeToggle from "@/components/mode-toggle";
import RepoView from "@/components/repo-view";
import { prisma } from "@/lib/prisma";
import {
  buildCommitHeatmap,
  getRepoCommits,
  getRepoStats,
} from "@/lib/github";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function JudgeTeamPage({
  params,
}: {
  params: Promise<{ id: string; teamId: string }>;
}) {
  const { id: hackathonId, teamId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const judgeRecord = await prisma.hackathonJudge.findUnique({
    where: { userId_hackathonId: { userId: session.user.id, hackathonId } },
  });
  if (!judgeRecord) redirect("/judge/dashboard");

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
    select: { id: true, title: true, startAt: true, endAt: true, status: true },
  });
  if (!hackathon) redirect("/judge/dashboard");

  const team = await prisma.hackathonParticipant.findFirst({
    where: { id: teamId, hackathonId },
    include: {
      user: { select: { name: true, githubUsername: true, avatar: true } },
      evaluations: {
        where: { judgeId: judgeRecord.id },
        select: { innovation: true, presentation: true, feedback: true },
      },
    },
  });
  if (!team) redirect(`/judge/hackathon/${hackathonId}`);

  const [stats, commits] = await Promise.all([
    getRepoStats(team.trackedRepo),
    getRepoCommits(
      team.trackedRepo,
      hackathon.startAt.toISOString(),
      hackathon.endAt.toISOString()
    ),
  ]);

  const heatmapData = buildCommitHeatmap(
    commits,
    hackathon.startAt.toISOString(),
    hackathon.endAt.toISOString()
  );

  const existingEval = team.evaluations[0] ?? null;

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Hacky</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/judge/hackathon/${hackathonId}`} className="text-sm text-muted-foreground hover:text-foreground transition">
              Teams
            </Link>
            <Link href="/judge/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
              Dashboard
            </Link>
            <ModeToggle />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <Link href={`/judge/hackathon/${hackathonId}`} className="text-xs text-muted-foreground hover:text-foreground transition">
            &larr; Back to teams
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{team.teamName}</h1>
          <p className="text-sm text-muted-foreground">{hackathon.title}</p>
        </div>

        <div className="space-y-6">
          <RepoView
            stats={stats}
            commits={commits}
            heatmapData={heatmapData}
            repoUrl={team.trackedRepo}
            deployedUrl={team.deployedUrl}
            presentationLink={team.presentationLink}
            registrantGitHubUsername={team.user.githubUsername}
            teammateGithubUrls={team.teammateGithubUrls}
          />

          <EvaluationForm
            hackathonId={hackathonId}
            participantId={team.id}
            teamName={team.teamName}
            existing={existingEval}
            locked={hackathon.status === "COMPLETED"}
          />
        </div>
      </div>
    </main>
  );
}
