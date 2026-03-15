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
    const role = session.user.role;
    if (role === "ORGANIZER") redirect("/organizer/dashboard");
    if (role === "JUDGE") redirect("/judge/dashboard");
    redirect("/dashboard");
  }

  const params = await searchParams;
  const roleParam =
    params.role === "organizer"
      ? "organizer"
      : params.role === "judge"
        ? "judge"
        : "participant";

  const callbackUrl =
    params.callbackUrl ??
    (roleParam === "organizer"
      ? "/organizer/dashboard"
      : roleParam === "judge"
        ? "/judge/dashboard"
        : "/dashboard");

  const config: Record<string, { label: string; accent: string; providers: Array<{ id: string; label: string; icon: React.ReactNode }> }> = {
    participant: {
      label: "Participant",
      accent: "from-indigo-500 to-cyan-400",
      providers: [
        { id: "github", label: "Continue with GitHub", icon: <GithubIcon /> },
      ],
    },
    organizer: {
      label: "Organizer",
      accent: "from-emerald-500 to-teal-400",
      providers: [
        { id: "google", label: "Continue with Google", icon: <GoogleIcon /> },
      ],
    },
    judge: {
      label: "Judge",
      accent: "from-violet-500 to-purple-400",
      providers: [
        { id: "google", label: "Continue with Google", icon: <GoogleIcon /> },
      ],
    },
  };

  const { label, accent, providers } = config[roleParam];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[30%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="absolute -bottom-[15%] right-[10%] h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[100px]" />
      </div>

      <section className="glass relative w-full max-w-md rounded-2xl p-8 text-white shadow-2xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition">
          &larr; Back
        </Link>

        <div className={`mt-4 inline-flex rounded-full bg-gradient-to-r ${accent} px-3 py-1 text-xs font-semibold text-white`}>
          {label}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {roleParam === "participant"
            ? "Sign in with GitHub to join hackathons and track your repos."
            : roleParam === "organizer"
              ? "Sign in with Google to create and manage hackathons."
              : "Sign in to evaluate hackathon submissions."}
        </p>

        <div className="mt-8 space-y-3">
          {providers.map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                "use server";
                const cookieStore = await cookies();
                const normalizedRole = normalizeRole(roleParam);
                cookieStore.set(
                  "selected_role",
                  normalizedRole === "ORGANIZER"
                    ? "organizer"
                    : normalizedRole === "JUDGE"
                      ? "judge"
                      : "participant",
                  {
                    httpOnly: true,
                    sameSite: "lax",
                    secure: process.env.NODE_ENV === "production",
                    path: "/",
                    maxAge: 60 * 60 * 24,
                  }
                );
                await signIn(provider.id, { redirectTo: callbackUrl });
              }}
            >
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {provider.icon}
                {provider.label}
              </button>
            </form>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3 text-xs text-zinc-500">
          <div className="h-px flex-1 bg-white/10" />
          or continue as
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {roleParam !== "participant" && (
            <Link href="/login?role=participant" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition">
              Participant
            </Link>
          )}
          {roleParam !== "organizer" && (
            <Link href="/login?role=organizer" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition">
              Organizer
            </Link>
          )}
          {roleParam !== "judge" && (
            <Link href="/login?role=judge" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition">
              Judge
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

function GithubIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
    </svg>
  );
}
