import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type ExtendPayload = {
  hackathonId?: string;
  registrationCloses?: string;
  endAt?: string;
};

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ORGANIZER") {
    return NextResponse.json(
      { error: "Only organizers can modify hackathons." },
      { status: 403 }
    );
  }

  const payload = (await request.json()) as ExtendPayload;
  const hackathonId = payload.hackathonId?.trim();
  const regInput = payload.registrationCloses?.trim();
  const endInput = payload.endAt?.trim();

  if (!hackathonId || !regInput || !endInput) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const nextReg = new Date(regInput);
  const nextEnd = new Date(endInput);
  if (Number.isNaN(nextReg.getTime()) || Number.isNaN(nextEnd.getTime())) {
    return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
  }

  const existing = await prisma.hackathon.findFirst({
    where: { id: hackathonId, createdById: session.user.id },
    select: { id: true, startAt: true, endAt: true, registrationCloses: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Hackathon not found." }, { status: 404 });
  }

  const trunc = (d: Date) =>
    Math.floor(d.getTime() / 60000) * 60000;

  const existRegTr = trunc(existing.registrationCloses);
  const existEndTr = trunc(existing.endAt);
  const nextRegTr = trunc(nextReg);
  const nextEndTr = trunc(nextEnd);

  if (nextRegTr < existRegTr) {
    return NextResponse.json(
      { error: "Registration close time can only be extended, not reduced." },
      { status: 400 }
    );
  }
  if (nextEndTr < existEndTr) {
    return NextResponse.json(
      { error: "Hackathon end time can only be extended, not reduced." },
      { status: 400 }
    );
  }
  if (nextReg > existing.startAt) {
    return NextResponse.json(
      { error: "Registration cannot close after the hackathon starts." },
      { status: 400 }
    );
  }
  if (nextEnd < existing.startAt) {
    return NextResponse.json(
      { error: "Hackathon cannot end before it starts." },
      { status: 400 }
    );
  }

  if (nextRegTr === existRegTr && nextEndTr === existEndTr) {
    return NextResponse.json(
      { error: "No changes detected — pick a later date." },
      { status: 400 }
    );
  }

  const data: Record<string, Date> = {};
  if (nextRegTr > existRegTr) data.registrationCloses = nextReg;
  if (nextEndTr > existEndTr) data.endAt = nextEnd;

  await prisma.hackathon.update({ where: { id: existing.id }, data });

  return NextResponse.json({ ok: true });
}
