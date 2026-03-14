import { auth, signOut } from "@/auth";
import HackathonCountdown from "@/components/hackathon-countdown";
import { prisma } from "@/lib/prisma";
import { syncUserRoleFromCookie } from "@/lib/user-role";
import Image from "next/image";
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
          id: true,
        },
      },
    },
  });

  const { user } = session;
  const displayName = user.githubUsername ?? user.name ?? "Student";
  const email = user.email ?? "Not available";
  const avatarUrl = user.avatar ?? user.image ?? null;
  const avatar = avatarUrl ?? "Not available";
  const githubUserId = user.githubUserId ?? "Not available";

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
              Hacky
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-lg font-semibold">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  width={48}
                  height={48}
                  referrerPolicy="no-referrer"
                />
              ) : (
                displayName[0]?.toUpperCase() ?? "S"
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{displayName}</h2>
              <p className="text-sm text-zinc-300">{email}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-medium text-zinc-300">GitHub User ID</h3>
            <p className="mt-2 break-all text-sm text-white">{githubUserId}</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-medium text-zinc-300">GitHub Username</h3>
            <p className="mt-2 text-sm text-white">{displayName}</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 md:col-span-2">
            <h3 className="text-sm font-medium text-zinc-300">Avatar URL</h3>
            <p className="mt-2 break-all text-sm text-white">{avatar}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
          <h3 className="text-sm font-semibold text-emerald-200">Phase 2</h3>
          <p className="mt-1 text-sm text-emerald-100/90">
            Browse upcoming hackathons and complete a placeholder signup to
            reserve your participant slot.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Upcoming Hackathons</h3>
          <p className="mt-1 text-sm text-zinc-300">
            Use quick signup for now. Detailed participant form fields will be
            added in a later iteration.
          </p>

          {upcomingHackathons.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-300">
              No upcoming hackathons published yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {upcomingHackathons.map((hackathon) => {
                const hasJoined = hackathon.participants.length > 0;
                return (
                  <article
                    key={hackathon.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold">{hackathon.title}</h4>
                        <p className="mt-1 text-sm text-zinc-300">
                          Starts: {hackathon.startAt.toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Registration closes:{" "}
                          {hackathon.registrationCloses.toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
                        <HackathonCountdown
                          targetIso={hackathon.startAt.toISOString()}
                        />
                      </span>
                    </div>

                    {hackathon.description ? (
                      <p className="mt-3 text-sm text-zinc-200">{hackathon.description}</p>
                    ) : null}

                    <form
                      className="mt-4"
                      action={async (formData) => {
                        "use server";
                        const activeSession = await auth();
                        if (!activeSession?.user) {
                          redirect("/login");
                        }

                        const hackathonId = String(formData.get("hackathonId") ?? "");
                        if (!hackathonId) {
                          return;
                        }

                        await prisma.hackathonParticipant.upsert({
                          where: {
                            userId_hackathonId: {
                              userId: activeSession.user.id,
                              hackathonId,
                            },
                          },
                          update: {},
                          create: {
                            userId: activeSession.user.id,
                            hackathonId,
                            fullName:
                              activeSession.user.name ??
                              activeSession.user.githubUsername ??
                              "Participant Name",
                            college: "Placeholder College",
                            phone: "0000000000",
                          },
                        });
                      }}
                    >
                      <input type="hidden" name="hackathonId" value={hackathon.id} />
                      <button
                        type="submit"
                        disabled={hasJoined}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {hasJoined ? "Already signed up" : "Quick sign up"}
                      </button>
                    </form>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
