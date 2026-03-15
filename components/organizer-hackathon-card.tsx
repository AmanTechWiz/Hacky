"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type HackathonData = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startAt: string;
  endAt: string;
  registrationCloses: string;
  status: string;
  createdAt: string;
};

function toInputValue(isoStr: string) {
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function OrganizerHackathonCard({
  hackathon,
  onDeleted,
}: {
  hackathon: HackathonData;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const canUpdate = hackathon.status !== "COMPLETED";

  const minReg = toInputValue(hackathon.registrationCloses);
  const minEnd = toInputValue(hackathon.endAt);

  const [regValue, setRegValue] = useState(minReg);
  const [endValue, setEndValue] = useState(minEnd);
  const [extendError, setExtendError] = useState<string | null>(null);
  const [extendSuccess, setExtendSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);

  async function handleExtend(e: React.FormEvent) {
    e.preventDefault();
    setExtendError(null);
    setExtendSuccess(false);
    setSubmitting(true);

    const res = await fetch("/api/hackathons/extend", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hackathonId: hackathon.id,
        registrationCloses: regValue,
        endAt: endValue,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      setExtendError(data?.error ?? "Failed to extend timeline.");
      return;
    }

    setExtendSuccess(true);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this hackathon? This cannot be undone.")) {
      return;
    }
    setDeleting(true);

    const res = await fetch("/api/hackathons/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hackathonId: hackathon.id }),
    });

    setDeleting(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      alert(data?.error ?? "Failed to delete hackathon.");
      return;
    }

    onDeleted?.();
    router.refresh();
  }

  return (
    <article className="rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{hackathon.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Starts: {new Date(hackathon.startAt).toLocaleString()} | Ends:{" "}
            {new Date(hackathon.endAt).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Registration closes:{" "}
            {new Date(hackathon.registrationCloses).toLocaleString()}
          </p>
        </div>
        <Badge variant="secondary">{hackathon.status}</Badge>
      </div>

      {hackathon.description ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {hackathon.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/organizer/hackathon/${hackathon.id}`}>
          <Button variant="outline" size="sm">View teams & judges</Button>
        </Link>
        <Link href={`/hackathon/${hackathon.slug}`}>
          <Button variant="ghost" size="sm">Leaderboard</Button>
        </Link>
        {canUpdate && (
          <Button
            variant="outline"
            size="sm"
            disabled={completing}
            className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
            onClick={async () => {
              if (!confirm("Mark this hackathon as completed? This will reveal the leaderboard scores to everyone. This cannot be undone.")) return;
              setCompleting(true);
              const res = await fetch("/api/hackathons/complete", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hackathonId: hackathon.id }),
              });
              setCompleting(false);
              if (!res.ok) {
                const data = (await res.json().catch(() => null)) as { error?: string } | null;
                alert(data?.error ?? "Failed to complete hackathon.");
                return;
              }
              router.refresh();
            }}
          >
            {completing ? "Completing..." : "Mark as completed"}
          </Button>
        )}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleExtend}>
          <div className="space-y-2">
            <Label htmlFor={`reg-${hackathon.id}`}>Registration closes</Label>
            <Input
              id={`reg-${hackathon.id}`}
              type="datetime-local"
              value={regValue}
              min={minReg}
              onChange={(e) => {
                setRegValue(e.target.value);
                setExtendError(null);
                setExtendSuccess(false);
              }}
              disabled={!canUpdate}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`end-${hackathon.id}`}>Hackathon ends</Label>
            <Input
              id={`end-${hackathon.id}`}
              type="datetime-local"
              value={endValue}
              min={minEnd}
              onChange={(e) => {
                setEndValue(e.target.value);
                setExtendError(null);
                setExtendSuccess(false);
              }}
              disabled={!canUpdate}
              required
            />
          </div>

          {extendError ? (
            <p className="text-sm text-destructive sm:col-span-2">
              {extendError}
            </p>
          ) : null}

          {extendSuccess ? (
            <p className="text-sm text-green-600 dark:text-green-400 sm:col-span-2">
              Timeline extended successfully.
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="outline"
              disabled={!canUpdate || submitting}
            >
              {submitting ? "Saving..." : "Extend timeline"}
            </Button>
          </div>
        </form>

        <Button
          variant="destructive"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? "Deleting..." : "Delete hackathon"}
        </Button>
      </div>
    </article>
  );
}
