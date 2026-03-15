"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  hackathonId: string;
  participantId: string;
  teamName: string;
  existing: { innovation: number; presentation: number; feedback: string | null } | null;
  locked: boolean;
};

export default function EvaluationForm({
  hackathonId,
  participantId,
  teamName,
  existing,
  locked,
}: Props) {
  const router = useRouter();
  const [innovation, setInnovation] = useState(existing?.innovation ?? 5);
  const [presentation, setPresentation] = useState(existing?.presentation ?? 5);
  const [feedback, setFeedback] = useState(existing?.feedback ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hackathonId,
        participantId,
        innovation,
        presentation,
        feedback: feedback || undefined,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Failed to save evaluation.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluate: {teamName}</CardTitle>
        <CardDescription>
          {locked
            ? "This hackathon is completed. Scores are locked."
            : existing
              ? "Update your evaluation below."
              : "Score this team on Innovation and Presentation (1-10 each)."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Innovation — {innovation}/10</Label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={innovation}
                onChange={(e) => setInnovation(Number(e.target.value))}
                disabled={locked}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1</span><span>5</span><span>10</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Presentation — {presentation}/10</Label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={presentation}
                onChange={(e) => setPresentation(Number(e.target.value))}
                disabled={locked}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Feedback (optional)</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Additional comments for this team..."
              rows={3}
              disabled={locked}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-green-600">Evaluation saved!</p>}

          <Button type="submit" disabled={submitting || locked}>
            {submitting
              ? "Saving..."
              : existing
                ? "Update evaluation"
                : "Submit evaluation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
