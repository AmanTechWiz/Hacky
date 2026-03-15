import { auth, signOut } from "@/auth";
import ModeToggle from "@/components/mode-toggle";
import ParticipantHackathons from "@/components/participant-hackathons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { syncUserRoleFromCookie } from "@/lib/user-role";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const activeRole = await syncUserRoleFromCookie(
    session.user.id,
    session.user.role
  );

  if (activeRole === "ORGANIZER") {
    redirect("/organizer/dashboard");
  }

  const githubUsername = session.user.githubUsername;
  let publicRepos: Array<{
    id: number;
    name: string;
    fullName: string;
    url: string;
  }> = [];

  if (githubUsername) {
    const response = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?type=public&sort=updated&per_page=100`,
      {
        next: { revalidate: 300 },
      }
    );

    if (response.ok) {
      const data = (await response.json()) as Array<{
        id: number;
        name: string;
        full_name: string;
        html_url: string;
      }>;

      publicRepos = data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
      }));
    }
  }

  const upcomingHackathons = await prisma.hackathon.findMany({
    where: {
      status: "PUBLISHED",
      startAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      startAt: "asc",
    },
    include: {
      participants: {
        where: {
          userId: session.user.id,
        },
        select: {
          teamName: true,
          teamLeader: true,
          teammateGithubUrls: true,
          memberCount: true,
          trackedRepo: true,
          deployedUrl: true,
          presentationLink: true,
        },
      },
    },
  });

  const { user } = session;
  const displayName = user.name ?? user.githubUsername ?? "Participant";

  const hackathons = upcomingHackathons.map((hackathon) => ({
    id: hackathon.id,
    slug: hackathon.slug,
    title: hackathon.title,
    description: hackathon.description,
    startAt: hackathon.startAt.toISOString(),
    registrationCloses: hackathon.registrationCloses.toISOString(),
    participation: hackathon.participants[0] ?? null,
  }));

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Hacky</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/hackathons" className="text-sm text-muted-foreground hover:text-foreground transition">
              Hackathons
            </Link>
            <ModeToggle />
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
              <Button type="submit" variant="ghost" size="sm">Sign out</Button>
            </form>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-500">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Participant
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground">
            Join hackathons, submit your team details, and track your progress.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Hackathons</CardTitle>
            <CardDescription>
              Submit your team details and pick a public repository to track.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ParticipantHackathons hackathons={hackathons} publicRepos={publicRepos} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
