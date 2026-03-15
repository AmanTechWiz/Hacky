"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

type Props = { hackathonCount: number; teamCount: number };

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const roles = [
  {
    title: "Participant",
    desc: "Discover hackathons, register your team, track your repo activity, and climb the leaderboard.",
    href: "/login?role=participant",
    gradient: "from-indigo-500 to-cyan-400",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: "Organizer",
    desc: "Create hackathons, manage timelines, invite judges, and view all registered teams in one place.",
    href: "/login?role=organizer",
    gradient: "from-emerald-500 to-teal-400",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
      </svg>
    ),
  },
  {
    title: "Judge",
    desc: "Evaluate teams with GitHub-style repo views, commit heatmaps, and score on innovation & presentation.",
    href: "/login?role=judge",
    gradient: "from-violet-500 to-purple-400",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
  },
];

const features = [
  { title: "GitHub Repo Tracking", desc: "Commit heatmaps and activity logs, scoped to the hackathon period." },
  { title: "Live Leaderboards", desc: "Aggregated scores from all judges, revealed when the hackathon ends." },
  { title: "Invite-Code Judging", desc: "Organizers generate short codes. Judges join in seconds." },
  { title: "Team Management", desc: "Register teams, submit deployed URLs and presentation links." },
];

export default function LandingClient({ hackathonCount, teamCount }: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[40%] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[128px]" />
        <div className="absolute -bottom-[20%] right-0 h-[600px] w-[600px] rounded-full bg-violet-600/15 blur-[128px]" />
        <div className="absolute bottom-[10%] left-[5%] h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Hacky</span>
        </span>
        <div className="flex items-center gap-4">
          <Link href="/hackathons" className="text-sm text-zinc-400 hover:text-white transition">
            Hackathons
          </Link>
          <Link href="/login?role=participant">
            <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Sign in
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-24 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {hackathonCount} active hackathon{hackathonCount !== 1 ? "s" : ""} · {teamCount} team{teamCount !== 1 ? "s" : ""} registered
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            The{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              judge-first
            </span>
            <br />
            hackathon platform
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} className="max-w-2xl text-lg text-zinc-400">
            Organize hackathons, track GitHub activity with commit heatmaps, score teams
            on innovation & presentation, and publish live leaderboards — all in one place.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex gap-3 pt-2">
            <Link href="/hackathons">
              <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 font-semibold">
                Explore hackathons
              </Button>
            </Link>
            <Link href="/login?role=organizer">
              <Button size="lg" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 font-semibold">
                Host a hackathon
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Role cards */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {roles.map((role, i) => (
            <motion.div key={role.title} custom={i} variants={fadeUp}>
              <Link href={role.href} className="group block">
                <div className="glass rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 glow">
                  <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${role.gradient} p-3 text-white`}>
                    {role.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{role.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{role.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-300 group-hover:text-white transition">
                    Get started
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 sm:grid-cols-2"
        >
          {features.map((f, i) => (
            <motion.div key={f.title} custom={i} variants={fadeUp} className="glass rounded-2xl p-6">
              <h4 className="font-semibold">{f.title}</h4>
              <p className="mt-1 text-sm text-zinc-400">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-zinc-500">
        Built with Next.js, Prisma, and the GitHub API.
      </footer>
    </main>
  );
}
