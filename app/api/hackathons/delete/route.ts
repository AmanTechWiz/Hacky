import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ORGANIZER") {
    return NextResponse.json(
      { error: "Only organizers can delete hackathons." },
      { status: 403 }
    );
  }

  const payload = (await request.json().catch(() => null)) as
    | { hackathonId?: string }
    | null;
  const hackathonId = payload?.hackathonId?.trim();

  if (!hackathonId) {
    return NextResponse.json(
      { error: "Missing hackathonId." },
      { status: 400 }
    );
  }

  const existing = await prisma.hackathon.findFirst({
    where: { id: hackathonId, createdById: session.user.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Hackathon not found." },
      { status: 404 }
    );
  }

  await prisma.hackathon.delete({ where: { id: existing.id } });

  return NextResponse.json({ ok: true });
}
