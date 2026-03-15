import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type LinksPayload = {
  hackathonId?: string;
  deployedUrl?: string;
  presentationLink?: string;
};

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as LinksPayload;
  const hackathonId = payload.hackathonId?.trim();
  const deployedUrl = payload.deployedUrl?.trim() || null;
  const presentationLink = payload.presentationLink?.trim() || null;

  if (!hackathonId) {
    return NextResponse.json({ error: "Missing hackathonId." }, { status: 400 });
  }

  const participation = await prisma.hackathonParticipant.findUnique({
    where: { userId_hackathonId: { userId: session.user.id, hackathonId } },
  });

  if (!participation) {
    return NextResponse.json({ error: "You are not registered for this hackathon." }, { status: 404 });
  }

  await prisma.hackathonParticipant.update({
    where: { id: participation.id },
    data: { deployedUrl, presentationLink },
  });

  return NextResponse.json({ ok: true });
}
