import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect(
      session.user.role === "ORGANIZER" ? "/organizer/dashboard" : "/dashboard"
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_45%)]" />

      <section className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300">
          Hacky
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Judge-first Hackathon Platform
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-300">
          Pick your role to continue. Participants can discover and join
          upcoming hackathons, while organizers can create and manage new
          hackathon events.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-semibold">I am a Participant</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Browse upcoming hackathons and sign up for participation.
            </p>
            <Link
              href="/login?role=participant"
              className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              Continue as participant
            </Link>
          </article>

          <article className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-semibold">I am an Organizer</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Create hackathons and publish schedules for participants.
            </p>
            <Link
              href="/login?role=organizer"
              className="mt-5 inline-flex rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-emerald-200"
            >
              Continue as organizer
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
