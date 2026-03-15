"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { normalizeUrl } from "@/lib/url";
import { useState } from "react";

type Team = {
  id: string;
  teamName: string;
  teamLeader: string;
  memberCount: number;
  teammateGithubUrls: string[];
  trackedRepo: string;
  deployedUrl: string | null;
  presentationLink: string | null;
  joinedAt: string;
  user: { name: string | null; email: string | null; githubUsername: string | null; avatar: string | null };
};

type Judge = {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  invitedAt: string;
};

type Props = {
  hackathonId: string;
  inviteCode: string | null;
  teams: Team[];
  judges: Judge[];
};

export default function OrganizerParticipantList({ hackathonId, inviteCode: initialCode, teams, judges }: Props) {
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateInvite() {
    setGenerating(true);
    const res = await fetch("/api/hackathons/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hackathonId }),
    });
    setGenerating(false);
    if (res.ok) {
      const data = (await res.json()) as { inviteCode: string };
      setInviteCode(data.inviteCode);
    }
  }

  async function copyCode() {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-violet-500/10 to-purple-500/10">
          <CardTitle>Judge Invite Code</CardTitle>
          <CardDescription>Share this code with judges so they can join and evaluate.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {inviteCode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="rounded-xl border-2 border-dashed border-primary/30 bg-muted/50 px-8 py-4">
                  <span className="font-mono text-3xl font-bold tracking-[0.3em]">{inviteCode}</span>
                </div>
                <Button variant="outline" size="sm" onClick={copyCode}>
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Judges can enter this code at <span className="font-mono">/judge/join</span> or use the invite link.
              </p>
            </div>
          ) : (
            <Button onClick={generateInvite} disabled={generating} className="w-full">
              {generating ? "Generating..." : "Generate invite code"}
            </Button>
          )}
          {judges.length > 0 && (
            <div className="mt-6 space-y-2 border-t pt-4">
              <p className="text-sm font-medium">Assigned judges ({judges.length})</p>
              <div className="flex flex-wrap gap-2">
                {judges.map((j) => (
                  <Badge key={j.id} variant="secondary" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    {j.name ?? j.email ?? "Judge"}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered Teams ({teams.length})</CardTitle>
          <CardDescription>All teams that have signed up for this hackathon.</CardDescription>
        </CardHeader>
        <CardContent>
          {teams.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-muted-foreground">No teams have registered yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {teams.map((team) => (
                <article key={team.id} className="rounded-xl border p-5 space-y-3 hover:border-primary/20 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold">{team.teamName}</h3>
                      <p className="text-xs text-muted-foreground">
                        Leader: {team.teamLeader} · {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registered by: {team.user.githubUsername ?? team.user.name ?? team.user.email ?? "—"}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {new Date(team.joinedAt).toLocaleDateString()}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a href={normalizeUrl(team.trackedRepo)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium hover:bg-accent transition">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>
                      Repo
                    </a>
                    {team.deployedUrl && (
                      <a href={normalizeUrl(team.deployedUrl)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium hover:bg-accent transition">
                        Deployed URL
                      </a>
                    )}
                    {team.presentationLink && (
                      <a href={normalizeUrl(team.presentationLink)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium hover:bg-accent transition">
                        Presentation
                      </a>
                    )}
                  </div>

                  {team.teammateGithubUrls.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Teammates:</span>{" "}
                      {team.teammateGithubUrls.map((url, i) => (
                        <span key={i}>
                          {i > 0 && ", "}
                          <a href={normalizeUrl(url)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {url.replace("https://github.com/", "")}
                          </a>
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
