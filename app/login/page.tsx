import { auth, signIn } from "@/auth";
import { normalizeRole } from "@/lib/user-role";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    role?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect(
      session.user.role === "ORGANIZER" ? "/organizer/dashboard" : "/dashboard"
    );
  }

  const params = await searchParams;
  const roleParam = params.role === "organizer" ? "organizer" : "participant";
  const callbackUrl =
    params.callbackUrl ??
    (roleParam === "organizer" ? "/organizer/dashboard" : "/dashboard");
  const roleLabel = roleParam === "organizer" ? "Organizer" : "Participant";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_45%)]" />

      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-300">
          Hacky
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {roleLabel} Login
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Sign in with GitHub or Google to continue as a {roleParam}.
        </p>

        <form
          className="mt-8"
          action={async (formData) => {
            "use server";
            const provider = String(formData.get("provider") ?? "github");
            const cookieStore = await cookies();
            const normalizedRole = normalizeRole(roleParam);
            cookieStore.set(
              "selected_role",
              normalizedRole === "ORGANIZER" ? "organizer" : "participant",
              {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24,
              }
            );
            await signIn(provider, { redirectTo: callbackUrl });
          }}
        >
          <input type="hidden" name="provider" value="github" />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Continue with GitHub
          </button>
        </form>

        <form
          className="mt-3"
          action={async (formData) => {
            "use server";
            const provider = String(formData.get("provider") ?? "google");
            const cookieStore = await cookies();
            const normalizedRole = normalizeRole(roleParam);
            cookieStore.set(
              "selected_role",
              normalizedRole === "ORGANIZER" ? "organizer" : "participant",
              {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24,
              }
            );
            await signIn(provider, { redirectTo: callbackUrl });
          }}
        >
          <input type="hidden" name="provider" value="google" />
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Continue with Google
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-zinc-300">
          We only read basic GitHub profile information for authentication in
          Phase 1.
        </div>

        <Link
          href="/"
          className="mt-6 inline-block text-xs text-zinc-300 underline underline-offset-4 hover:text-white"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
