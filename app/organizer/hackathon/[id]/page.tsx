import { auth } from "@/auth";
import ModeToggle from "@/components/mode-toggle";
import OrganizerParticipantList from "@/components/organizer-participant-list";
import { prisma } from "@/lib/prisma";
import { syncUserRoleFromCookie } from "@/lib/user-role";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrganizerHackathonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const activeRole = await syncUserRoleFromCookie(session.user.id, session.user.role);
  if (activeRole !== "ORGANIZER") redirect("/dashboard");

  const hackathon = await prisma.hackathon.findFirst({
    where: { id, createdById: session.user.id },
    include: {
      participants: {
        include: { user: { select: { name: true, email: true, githubUsername: true, avatar: true } } },
        orderBy: { joinedAt: "desc" },
      },
      judges: {
        include: { user: { select: { name: true, email: true, avatar: true } } },
      },
    },
  });

  if (!hackathon) redirect("/organizer/dashboard");

  const teams = hackathon.participants.map((p) => ({
    id: p.id,
    teamName: p.teamName,
    teamLeader: p.teamLeader,
    memberCount: p.memberCount,
    teammateGithubUrls: p.teammateGithubUrls,
    trackedRepo: p.trackedRepo,
    deployedUrl: p.deployedUrl,
    presentationLink: p.presentationLink,
    joinedAt: p.joinedAt.toISOString(),
    user: p.user,
  }));

  const judges = hackathon.judges.map((j) => ({
    id: j.id,
    name: j.user.name,
    email: j.user.email,
    avatar: j.user.avatar,
    invitedAt: j.invitedAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Hacky</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/organizer/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
              Dashboard
            </Link>
            <ModeToggle />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <Link href="/organizer/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition">
            &larr; Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{hackathon.title}</h1>
          <p className="text-sm text-muted-foreground">
            {hackathon.participants.length} team{hackathon.participants.length !== 1 ? "s" : ""} registered
            {" · "}
            {hackathon.judges.length} judge{hackathon.judges.length !== 1 ? "s" : ""} assigned
          </p>
        </div>

        <div className="space-y-6">
          <OrganizerParticipantList
            hackathonId={hackathon.id}
            inviteCode={hackathon.inviteCode}
            teams={teams}
            judges={judges}
          />
        </div>
      </div>
    </main>
  );
}
