"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JudgeJoinClient() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setJoining(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/judge/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });

    setJoining(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Invalid code. Please try again.");
      return;
    }

    const data = (await res.json()) as { title?: string; alreadyJoined?: boolean };
    if (data.alreadyJoined) {
      setSuccess(`You've already joined "${data.title}". Redirecting...`);
    } else {
      setSuccess(`Joined "${data.title}" as judge! Redirecting...`);
    }

    setTimeout(() => router.push("/judge/dashboard"), 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Join as Judge</CardTitle>
          <CardDescription>Enter the 6-character invite code from the organizer.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="e.g. AB3X7K"
              maxLength={6}
              className="text-center text-2xl font-mono tracking-[0.3em] h-14"
              autoFocus
            />

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            {success && <p className="text-sm text-emerald-500 text-center">{success}</p>}

            <Button type="submit" disabled={joining || code.length < 6} className="w-full">
              {joining ? "Joining..." : "Join hackathon"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
