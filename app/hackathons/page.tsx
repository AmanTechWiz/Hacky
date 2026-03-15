import { auth } from "@/auth";
import ModeToggle from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function getDashboardPath(role: string) {
  if (role === "ORGANIZER") return "/organizer/dashboard";
  if (role === "JUDGE") return "/judge/dashboard";
  return "/dashboard";
}

export default async function PublicHackathonsPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const hackathons = await prisma.hackathon.findMany({
    where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
    orderBy: { startAt: "desc" },
    include: {
      _count: { select: { participants: true, judges: true } },
    },
  });

  const now = new Date();

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Hacky</span>
          </Link>
          <div className="flex items-center gap-3">
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

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Hackathons</h1>
          <p className="text-muted-foreground">
            Browse all hackathons. Sign up as a participant to join one.
          </p>
        </div>

        {hackathons.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <p className="text-lg text-muted-foreground">No hackathons published yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {hackathons.map((h) => {
              const isUpcoming = h.startAt > now;
              const isLive = h.startAt <= now && h.endAt >= now && h.status === "PUBLISHED";
              const isCompleted = h.status === "COMPLETED";
              const regOpen = h.registrationCloses > now;

              return (
                <article key={h.id} className="group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold tracking-tight">{h.title}</h2>
                      <p className="text-xs text-muted-foreground">
                        {h.startAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {" — "}
                        {h.endAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    {isLive ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        Live
                      </Badge>
                    ) : isUpcoming ? (
                      <Badge variant="secondary">Upcoming</Badge>
                    ) : isCompleted ? (
                      <Badge variant="outline">Completed</Badge>
                    ) : null}
                  </div>

                  {h.description && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{h.description}</p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{h._count.participants} team{h._count.participants !== 1 ? "s" : ""}</span>
                    <span>{h._count.judges} judge{h._count.judges !== 1 ? "s" : ""}</span>
                    {regOpen && !isCompleted && (
                      <span className="text-emerald-500 font-medium">Registration open</span>
                    )}
                  </div>

                  <div className="mt-4">
                    <Link href={`/hackathon/${h.slug}`}>
                      <Button variant="outline" size="sm">View leaderboard</Button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
