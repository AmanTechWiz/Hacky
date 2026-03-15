import { auth } from "@/auth";
import JudgeInviteClient from "@/components/judge-invite-client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function JudgeInvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const hackathon = await prisma.hackathon.findUnique({
    where: { inviteCode: code },
    select: { id: true, title: true, startAt: true, endAt: true },
  });

  if (!hackathon) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Invalid Invite</h1>
          <p className="text-muted-foreground">This invite code is not valid or has expired.</p>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">Go home</Link>
        </div>
      </main>
    );
  }

  const session = await auth();

  if (!session?.user) {
    redirect(`/login?role=judge&callbackUrl=/judge/invite/${code}`);
  }

  return (
    <JudgeInviteClient
      inviteCode={code}
      hackathonTitle={hackathon.title}
      hackathonId={hackathon.id}
      startAt={hackathon.startAt.toISOString()}
      endAt={hackathon.endAt.toISOString()}
    />
  );
}
