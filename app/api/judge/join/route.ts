import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { code?: string; inviteCode?: string } | null;
  const code = (payload?.code ?? payload?.inviteCode ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Missing invite code." }, { status: 400 });
  }

  const hackathon = await prisma.hackathon.findUnique({
    where: { inviteCode: code },
    select: { id: true, title: true },
  });
  if (!hackathon) {
    return NextResponse.json({ error: "Invalid invite code." }, { status: 404 });
  }

  const existing = await prisma.hackathonJudge.findUnique({
    where: { userId_hackathonId: { userId: session.user.id, hackathonId: hackathon.id } },
  });
  if (existing) {
    return NextResponse.json({ hackathonId: hackathon.id, title: hackathon.title, alreadyJoined: true });
  }

  await prisma.hackathonJudge.create({
    data: { userId: session.user.id, hackathonId: hackathon.id },
  });

  if (session.user.role !== "JUDGE") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "JUDGE" },
    });
  }

  return NextResponse.json({ hackathonId: hackathon.id, title: hackathon.title, alreadyJoined: false });
}
