import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can complete hackathons." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as { hackathonId?: string } | null;
  const hackathonId = payload?.hackathonId?.trim();
  if (!hackathonId) {
    return NextResponse.json({ error: "Missing hackathonId." }, { status: 400 });
  }

  const hackathon = await prisma.hackathon.findFirst({
    where: { id: hackathonId, createdById: session.user.id },
    select: { id: true, status: true },
  });
  if (!hackathon) {
    return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
  }
  if (hackathon.status === "COMPLETED") {
    return NextResponse.json({ error: "Already completed." }, { status: 400 });
  }

  await prisma.hackathon.update({
    where: { id: hackathon.id },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json({ ok: true });
}
