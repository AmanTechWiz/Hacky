import { auth, signOut } from "@/auth";
import ModeToggle from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
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

export default async function JudgeDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await syncUserRoleFromCookie(session.user.id, session.user.role);

  const assignments = await prisma.hackathonJudge.findMany({
    where: { userId: session.user.id },
    include: {
      hackathon: {
        select: {
          id: true,
          title: true,
          slug: true,
          startAt: true,
          endAt: true,
          status: true,
          _count: { select: { participants: true } },
        },
      },
      _count: { select: { evaluations: true } },
    },
    orderBy: { invitedAt: "desc" },
  });

  const displayName = session.user.name ?? session.user.githubUsername ?? "Judge";

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Hacky</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/judge/join" className="text-sm text-muted-foreground hover:text-foreground transition">
              Join hackathon
            </Link>
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

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-500">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Judge
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="text-muted-foreground">
            Evaluate hackathon submissions assigned to you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Assignments</CardTitle>
            <CardDescription>Hackathons you have been invited to judge.</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center space-y-3">
                <p className="text-muted-foreground">No assignments yet.</p>
                <Link href="/judge/join">
                  <Button variant="outline" size="sm">Enter invite code</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {assignments.map((a) => {
                  const teamCount = a.hackathon._count.participants;
                  const evalCount = a._count.evaluations;
                  const progress = teamCount > 0 ? Math.round((evalCount / teamCount) * 100) : 0;

                  return (
                    <article key={a.id} className="rounded-xl border p-5 hover:border-primary/20 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold">{a.hackathon.title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(a.hackathon.startAt).toLocaleDateString()} — {new Date(a.hackathon.endAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">{a.hackathon.status}</Badge>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{evalCount}/{teamCount} evaluated</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={`/judge/hackathon/${a.hackathon.id}`}>
                          <Button variant="outline" size="sm">View teams & evaluate</Button>
                        </Link>
                        <Link href={`/hackathon/${a.hackathon.slug}`}>
                          <Button variant="ghost" size="sm">Leaderboard</Button>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
