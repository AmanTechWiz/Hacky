"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  inviteCode: string;
  hackathonTitle: string;
  hackathonId: string;
  startAt: string;
  endAt: string;
};

export default function JudgeInviteClient({ inviteCode, hackathonTitle, startAt, endAt }: Props) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    const res = await fetch("/api/judge/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode }),
    });
    setJoining(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Failed to join.");
      return;
    }

    router.push("/judge/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Judge Invitation</CardTitle>
          <CardDescription>You have been invited to judge:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">{hackathonTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(startAt).toLocaleDateString()} — {new Date(endAt).toLocaleDateString()}
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleJoin} disabled={joining} className="w-full">
            {joining ? "Joining..." : "Accept & Join as Judge"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
