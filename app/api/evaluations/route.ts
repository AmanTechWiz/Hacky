import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type EvalPayload = {
  participantId?: string;
  hackathonId?: string;
  innovation?: number;
  presentation?: number;
  feedback?: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as EvalPayload;
  const participantId = payload.participantId?.trim();
  const hackathonId = payload.hackathonId?.trim();
  const innovation = payload.innovation;
  const presentation = payload.presentation;
  const feedback = payload.feedback?.trim() || null;

  if (!participantId || !hackathonId || !innovation || !presentation) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (innovation < 1 || innovation > 10 || presentation < 1 || presentation > 10) {
    return NextResponse.json({ error: "Scores must be between 1 and 10." }, { status: 400 });
  }

  const judgeRecord = await prisma.hackathonJudge.findUnique({
    where: { userId_hackathonId: { userId: session.user.id, hackathonId } },
  });
  if (!judgeRecord) {
    return NextResponse.json({ error: "You are not a judge for this hackathon." }, { status: 403 });
  }

  const participant = await prisma.hackathonParticipant.findFirst({
    where: { id: participantId, hackathonId },
  });
  if (!participant) {
    return NextResponse.json({ error: "Team not found." }, { status: 404 });
  }

  const hackathon = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
    select: { status: true },
  });
  if (hackathon?.status === "COMPLETED") {
    return NextResponse.json({ error: "Hackathon is completed. Scores are locked." }, { status: 400 });
  }

  await prisma.evaluation.upsert({
    where: { judgeId_participantId: { judgeId: judgeRecord.id, participantId } },
    update: { innovation, presentation, feedback },
    create: {
      judgeId: judgeRecord.id,
      participantId,
      innovation,
      presentation,
      feedback,
    },
  });

  return NextResponse.json({ ok: true });
}
