import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type ParticipationPayload = {
  hackathonId?: string;
  teamName?: string;
  teamLeader?: string;
  teammateGithubUrls?: string[];
  memberCount?: number;
  trackedRepo?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "PARTICIPANT") {
    return NextResponse.json(
      { error: "Only participants can join hackathons." },
      { status: 403 }
    );
  }

  const payload = (await request.json()) as ParticipationPayload;
  const hackathonId = payload.hackathonId?.trim();
  const teamName = payload.teamName?.trim();
  const teamLeader = payload.teamLeader?.trim();
  const trackedRepo = payload.trackedRepo?.trim();
  const memberCount = Number(payload.memberCount ?? 0);
  const teammateGithubUrls = (payload.teammateGithubUrls ?? [])
    .map((url) => url.trim())
    .filter(Boolean);

  if (!hackathonId || !teamName || !teamLeader || !trackedRepo || !memberCount) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
    select: { id: true, status: true, registrationCloses: true },
  });

  if (!hackathon) {
    return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
  }

  if (hackathon.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "Hackathon is not open for participation." },
      { status: 400 }
    );
  }

  if (hackathon.registrationCloses < new Date()) {
    return NextResponse.json(
      { error: "Registration has already closed." },
      { status: 400 }
    );
  }

  await prisma.hackathonParticipant.upsert({
    where: {
      userId_hackathonId: {
        userId: session.user.id,
        hackathonId,
      },
    },
    update: {
      teamName,
      teamLeader,
      teammateGithubUrls,
      memberCount,
      trackedRepo,
    },
    create: {
      userId: session.user.id,
      hackathonId,
      teamName,
      teamLeader,
      teammateGithubUrls,
      memberCount,
      trackedRepo,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { hackathonId?: string }
    | null;
  const hackathonId = payload?.hackathonId?.trim();

  if (!hackathonId) {
    return NextResponse.json({ error: "Missing hackathonId." }, { status: 400 });
  }

  await prisma.hackathonParticipant.deleteMany({
    where: {
      userId: session.user.id,
      hackathonId,
    },
  });

  return NextResponse.json({ ok: true });
}
