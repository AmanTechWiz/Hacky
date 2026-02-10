import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Hacky Auth MVP (Phase 1)
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Student login only. Sign in with GitHub to access your dashboard.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Go to login
        </Link>
      </section>
    </main>
  );
}
