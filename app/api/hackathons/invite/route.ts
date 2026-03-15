import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can generate invite codes." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as { hackathonId?: string } | null;
  const hackathonId = payload?.hackathonId?.trim();
  if (!hackathonId) {
    return NextResponse.json({ error: "Missing hackathonId." }, { status: 400 });
  }

  const hackathon = await prisma.hackathon.findFirst({
    where: { id: hackathonId, createdById: session.user.id },
    select: { id: true, inviteCode: true },
  });
  if (!hackathon) {
    return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
  }

  if (hackathon.inviteCode) {
    return NextResponse.json({ inviteCode: hackathon.inviteCode });
  }

  const inviteCode = generateShortCode();
  await prisma.hackathon.update({
    where: { id: hackathon.id },
    data: { inviteCode },
  });

  return NextResponse.json({ inviteCode });
}
