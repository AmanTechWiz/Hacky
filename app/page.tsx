import { auth } from "@/auth";
import LandingClient from "@/components/landing-client";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    const role = session.user.role;
    if (role === "ORGANIZER") redirect("/organizer/dashboard");
    if (role === "JUDGE") redirect("/judge/dashboard");
    redirect("/dashboard");
  }

  const hackathonCount = await prisma.hackathon.count({ where: { status: "PUBLISHED" } });
  const teamCount = await prisma.hackathonParticipant.count();

  return <LandingClient hackathonCount={hackathonCount} teamCount={teamCount} />;
}
