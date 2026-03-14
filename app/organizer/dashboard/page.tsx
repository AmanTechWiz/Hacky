import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { syncUserRoleFromCookie } from "@/lib/user-role";
import { redirect } from "next/navigation";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default async function OrganizerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const activeRole = await syncUserRoleFromCookie(
    session.user.id,
    session.user.role
  );

  if (activeRole !== "ORGANIZER") {
    redirect("/dashboard");
  }

  const createdHackathons = await prisma.hackathon.findMany({
    where: {
      createdById: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
              Hacky
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Organizer Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-300">
              Create and publish hackathons for participants.
            </p>
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

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Create Hackathon</h2>
          <p className="mt-1 text-sm text-zinc-300">
            Placeholder fields are fine for now. You can refine validation in
            later iterations.
          </p>

          <form
            className="mt-5 grid gap-4 md:grid-cols-2"
            action={async (formData) => {
              "use server";
              const activeSession = await auth();
              if (!activeSession?.user) {
                redirect("/login");
              }

              const title = String(formData.get("title") ?? "").trim();
              const description = String(formData.get("description") ?? "").trim();
              const startAtInput = String(formData.get("startAt") ?? "");
              const endAtInput = String(formData.get("endAt") ?? "");
              const registrationClosesInput = String(
                formData.get("registrationCloses") ?? ""
              );

              if (!title || !startAtInput || !endAtInput || !registrationClosesInput) {
                return;
              }

              const startAt = new Date(startAtInput);
              const endAt = new Date(endAtInput);
              const registrationCloses = new Date(registrationClosesInput);

              const baseSlug = slugify(title) || "hackathon";
              const randomSuffix = Math.floor(1000 + Math.random() * 9000);
              const slug = `${baseSlug}-${randomSuffix}`;

              await prisma.hackathon.create({
                data: {
                  title,
                  slug,
                  description: description || null,
                  startAt,
                  endAt,
                  registrationCloses,
                  status: "PUBLISHED",
                  createdById: activeSession.user.id,
                },
              });
            }}
          >
            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-300">Title</span>
              <input
                name="title"
                required
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none ring-indigo-400/30 placeholder:text-zinc-500 focus:ring"
                placeholder="Hacky Spring Buildathon"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-300">Registration Closes</span>
              <input
                name="registrationCloses"
                type="datetime-local"
                required
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none ring-indigo-400/30 focus:ring"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-300">Start At</span>
              <input
                name="startAt"
                type="datetime-local"
                required
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none ring-indigo-400/30 focus:ring"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-zinc-300">End At</span>
              <input
                name="endAt"
                type="datetime-local"
                required
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none ring-indigo-400/30 focus:ring"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm text-zinc-300">Description</span>
              <textarea
                name="description"
                rows={4}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none ring-indigo-400/30 placeholder:text-zinc-500 focus:ring"
                placeholder="Mention tracks, expectations, and important instructions."
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-emerald-200"
              >
                Create hackathon
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Your Hackathons</h2>
          {createdHackathons.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-300">
              No hackathons created yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              {createdHackathons.map((hackathon) => (
                <article
                  key={hackathon.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <h3 className="font-semibold">{hackathon.title}</h3>
                  <p className="mt-1 text-xs text-zinc-300">
                    Starts: {hackathon.startAt.toLocaleString()} | Ends:{" "}
                    {hackathon.endAt.toLocaleString()}
                  </p>
                  {hackathon.description ? (
                    <p className="mt-2 text-sm text-zinc-200">{hackathon.description}</p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
