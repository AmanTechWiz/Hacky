"use client";

import HackathonCountdown from "@/components/hackathon-countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type RepoOption = {
  id: number;
  name: string;
  fullName: string;
  url: string;
};

type HackathonItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  startAt: string;
  registrationCloses: string;
  participation: {
    teamName: string;
    teamLeader: string;
    teammateGithubUrls: string[];
    memberCount: number;
    trackedRepo: string;
    deployedUrl: string | null;
    presentationLink: string | null;
  } | null;
};

type Props = {
  hackathons: HackathonItem[];
  publicRepos: RepoOption[];
};

export default function ParticipantHackathons({ hackathons, publicRepos }: Props) {
  const router = useRouter();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [errorFor, setErrorFor] = useState<string | null>(null);
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);
  const [memberCountByHackathon, setMemberCountByHackathon] = useState<
    Record<string, string>
  >({});
  const [trackedRepoByHackathon, setTrackedRepoByHackathon] = useState<
    Record<string, string>
  >({});

  const repoMap = useMemo(
    () => new Map(publicRepos.map((repo) => [repo.url, repo])),
    [publicRepos]
  );

  if (hackathons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Hackathons</CardTitle>
          <CardDescription>No published upcoming hackathons yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {hackathons.map((hackathon) => {
        const participation = hackathon.participation;
        const hasJoined = Boolean(participation);

        return (
          <Card key={hackathon.id}>
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>{hackathon.title}</CardTitle>
                <CardDescription>
                  Starts: {new Date(hackathon.startAt).toLocaleString()}
                </CardDescription>
                <CardDescription>
                  Registration closes:{" "}
                  {new Date(hackathon.registrationCloses).toLocaleString()}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                <HackathonCountdown targetIso={hackathon.startAt} />
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              {hackathon.description ? (
                <p className="text-sm text-muted-foreground">{hackathon.description}</p>
              ) : null}

              <Link href={`/hackathon/${hackathon.slug}`} className="text-xs text-muted-foreground hover:underline">
                View leaderboard &rarr;
              </Link>

              {hasJoined ? (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-2">
                  <p className="font-medium">
                    Registered as: {participation?.teamName}
                  </p>
                  <p className="text-muted-foreground">
                    Repo:{" "}
                    {participation
                      ? repoMap.get(participation.trackedRepo)?.fullName ??
                        participation.trackedRepo
                      : "Not selected"}
                  </p>
                  <SubmitLinksForm
                    hackathonId={hackathon.id}
                    initialDeployedUrl={participation?.deployedUrl ?? ""}
                    initialPresentationLink={participation?.presentationLink ?? ""}
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-2">
                <Dialog
                  open={openFor === hackathon.id}
                  onOpenChange={(open) => {
                    setOpenFor(open ? hackathon.id : null);
                    setErrorFor(null);
                  }}
                >
                  <DialogTrigger
                    render={
                      <Button>
                        {hasJoined ? "Update participation" : "Participate"}
                      </Button>
                    }
                  />
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Participate in {hackathon.title}</DialogTitle>
                    <DialogDescription>
                      Submit team details and choose one public repo for tracking.
                    </DialogDescription>
                  </DialogHeader>

                  <form
                    className="space-y-4"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      setErrorFor(null);
                      setSubmittingFor(hackathon.id);

                      const formData = new FormData(event.currentTarget);
                      const teammateRaw = String(formData.get("teammates") ?? "");
                      const teammateGithubUrls = teammateRaw
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean);

                      const body = {
                        hackathonId: hackathon.id,
                        teamName: String(formData.get("teamName") ?? ""),
                        teamLeader: String(formData.get("teamLeader") ?? ""),
                        memberCount: Number(formData.get("memberCount") ?? 1),
                        trackedRepo: String(formData.get("trackedRepo") ?? ""),
                        teammateGithubUrls,
                      };

                      const response = await fetch("/api/participations", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(body),
                      });

                      setSubmittingFor(null);

                      if (!response.ok) {
                        const data = (await response.json().catch(() => null)) as
                          | { error?: string }
                          | null;
                        setErrorFor(data?.error ?? "Could not submit participation.");
                        return;
                      }

                      setOpenFor(null);
                      router.refresh();
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`teamName-${hackathon.id}`}>Team name</Label>
                      <Input
                        id={`teamName-${hackathon.id}`}
                        name="teamName"
                        defaultValue={participation?.teamName ?? ""}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`teamLeader-${hackathon.id}`}>Team leader</Label>
                      <Input
                        id={`teamLeader-${hackathon.id}`}
                        name="teamLeader"
                        defaultValue={participation?.teamLeader ?? ""}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`memberCount-${hackathon.id}`}>
                        Number of members
                      </Label>
                      <Select
                        defaultValue={
                          memberCountByHackathon[hackathon.id] ??
                          String(participation?.memberCount ?? 1)
                        }
                        onValueChange={(value) =>
                          setMemberCountByHackathon((prev) => ({
                            ...prev,
                            [hackathon.id]: value ?? String(participation?.memberCount ?? 1),
                          }))
                        }
                      >
                        <SelectTrigger id={`memberCount-${hackathon.id}`}>
                          <SelectValue placeholder="Select team size" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((count) => (
                            <SelectItem key={count} value={String(count)}>
                              {count}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="hidden"
                        name="memberCount"
                        value={
                          memberCountByHackathon[hackathon.id] ??
                          String(participation?.memberCount ?? 1)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`teammates-${hackathon.id}`}>
                        Teammate GitHub profile URLs
                      </Label>
                      <Textarea
                        id={`teammates-${hackathon.id}`}
                        name="teammates"
                        placeholder={"One URL per line\nhttps://github.com/teammate1"}
                        defaultValue={
                          participation?.teammateGithubUrls?.join("\n") ?? ""
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`trackedRepo-${hackathon.id}`}>
                        Public repo to track
                      </Label>
                      <Select
                        defaultValue={trackedRepoByHackathon[hackathon.id] ?? participation?.trackedRepo ?? ""}
                        onValueChange={(value) =>
                          setTrackedRepoByHackathon((prev) => ({
                            ...prev,
                            [hackathon.id]: value ?? participation?.trackedRepo ?? "",
                          }))
                        }
                      >
                        <SelectTrigger id={`trackedRepo-${hackathon.id}`}>
                          <SelectValue placeholder="Select one public repository" />
                        </SelectTrigger>
                        <SelectContent>
                          {publicRepos.map((repo) => (
                            <SelectItem key={repo.id} value={repo.url}>
                              {repo.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        type="hidden"
                        name="trackedRepo"
                        value={trackedRepoByHackathon[hackathon.id] ?? participation?.trackedRepo ?? ""}
                      />
                      {publicRepos.length === 0 ? (
                        <p className="text-xs text-destructive">
                          No public repos detected for this account. Sign in with
                          GitHub and ensure your target repo is public.
                        </p>
                      ) : null}
                    </div>

                    {errorFor ? (
                      <p className="text-sm text-destructive">{errorFor}</p>
                    ) : null}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={submittingFor === hackathon.id}>
                        {submittingFor === hackathon.id
                          ? "Saving..."
                          : hasJoined
                            ? "Update details"
                            : "Submit participation"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
                </Dialog>

                {hasJoined ? (
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      setErrorFor(null);
                      setSubmittingFor(hackathon.id);
                      const response = await fetch("/api/participations", {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ hackathonId: hackathon.id }),
                      });
                      setSubmittingFor(null);
                      if (!response.ok) {
                        const data = (await response.json().catch(() => null)) as
                          | { error?: string }
                          | null;
                        setErrorFor(data?.error ?? "Could not withdraw participation.");
                        return;
                      }
                      router.refresh();
                    }}
                    disabled={submittingFor === hackathon.id}
                  >
                    {submittingFor === hackathon.id ? "Withdrawing..." : "Withdraw"}
                  </Button>
                ) : null}
              </div>

              {errorFor ? (
                <p className="text-sm text-destructive">{errorFor}</p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SubmitLinksForm({
  hackathonId,
  initialDeployedUrl,
  initialPresentationLink,
}: {
  hackathonId: string;
  initialDeployedUrl: string;
  initialPresentationLink: string;
}) {
  const [deployedUrl, setDeployedUrl] = useState(initialDeployedUrl);
  const [presentationLink, setPresentationLink] = useState(initialPresentationLink);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/participations/links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hackathonId, deployedUrl, presentationLink }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-2 border-t pt-2 mt-2">
      <p className="text-xs font-medium text-muted-foreground">Submission links</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Deployed URL"
          value={deployedUrl}
          onChange={(e) => setDeployedUrl(e.target.value)}
          className="text-xs h-8"
        />
        <Input
          placeholder="Presentation link"
          value={presentationLink}
          onChange={(e) => setPresentationLink(e.target.value)}
          className="text-xs h-8"
        />
      </div>
      <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : saved ? "Saved!" : "Save links"}
      </Button>
    </div>
  );
}
