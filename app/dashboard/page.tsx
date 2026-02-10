import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;
  const displayName = user.githubUsername ?? user.name ?? "Student";
  const email = user.email ?? "Not available";
  const avatar = user.avatar ?? "Not available";
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-lg font-semibold">
              {displayName[0]?.toUpperCase() ?? "S"}
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
          <h3 className="text-sm font-semibold text-emerald-200">
            Phase 1 Status
          </h3>
          <p className="mt-1 text-sm text-emerald-100/90">
            Authentication and user persistence are active. You can now move to
            repository selection in the next phase.
          </p>
        </section>
      </div>
    </main>
  );
}
