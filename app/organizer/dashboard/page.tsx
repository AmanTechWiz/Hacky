import { auth, signOut } from "@/auth";
import ModeToggle from "@/components/mode-toggle";
import OrganizerHackathonCard from "@/components/organizer-hackathon-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { syncUserRoleFromCookie } from "@/lib/user-role";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default async function OrganizerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const activeRole = await syncUserRoleFromCookie(
    session.user.id,
    session.user.role
  );

  if (activeRole !== "ORGANIZER") {
    redirect("/dashboard");
  }

  const createdHackathons = await prisma.hackathon.findMany({
    where: {
      createdById: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const displayName = session.user.name ?? session.user.email ?? "Organizer";

  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Hacky</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/hackathons" className="text-sm text-muted-foreground hover:text-foreground transition">
              Hackathons
            </Link>
            <ModeToggle />
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
              <Button type="submit" variant="ghost" size="sm">Sign out</Button>
            </form>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Organizer
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hello, {displayName}
          </h1>
          <p className="text-muted-foreground">
            Create hackathons, manage timelines, and invite judges.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
              <CardTitle>Create Hackathon</CardTitle>
              <CardDescription>
                Publish a new hackathon for participant registrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form
                className="grid gap-4 md:grid-cols-2"
                action={async (formData) => {
                  "use server";
                  const activeSession = await auth();
                  if (!activeSession?.user) {
                    redirect("/login");
                  }

                  const title = String(formData.get("title") ?? "").trim();
                  const description = String(formData.get("description") ?? "").trim();
                  const startAtInput = String(formData.get("startAt") ?? "");
                  const endAtInput = String(formData.get("endAt") ?? "");
                  const registrationClosesInput = String(
                    formData.get("registrationCloses") ?? ""
                  );

                  if (!title || !startAtInput || !endAtInput || !registrationClosesInput) {
                    return;
                  }

                  const startAt = new Date(startAtInput);
                  const endAt = new Date(endAtInput);
                  const registrationCloses = new Date(registrationClosesInput);
                  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
                    return;
                  }
                  if (endAt < startAt || registrationCloses > startAt) {
                    return;
                  }

                  const baseSlug = slugify(title) || "hackathon";
                  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                  const slug = `${baseSlug}-${randomSuffix}`;

                  await prisma.hackathon.create({
                    data: {
                      title,
                      slug,
                      description: description || null,
                      startAt,
                      endAt,
                      registrationCloses,
                      status: "PUBLISHED",
                      createdById: activeSession.user.id,
                    },
                  });

                  revalidatePath("/organizer/dashboard");
                  revalidatePath("/dashboard");
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="Hacky Spring Buildathon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationCloses">Registration closes</Label>
                  <Input
                    id="registrationCloses"
                    name="registrationCloses"
                    type="datetime-local"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startAt">Start at</Label>
                  <Input id="startAt" name="startAt" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endAt">End at</Label>
                  <Input id="endAt" name="endAt" type="datetime-local" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Mention tracks, expectations, and important instructions."
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit">Create hackathon</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Hackathons</CardTitle>
              <CardDescription>
                Manage timelines and view team registrations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {createdHackathons.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">No hackathons created yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {createdHackathons.map((hackathon) => (
                    <OrganizerHackathonCard
                      key={hackathon.id}
                      hackathon={{
                        id: hackathon.id,
                        title: hackathon.title,
                        slug: hackathon.slug,
                        description: hackathon.description,
                        startAt: hackathon.startAt.toISOString(),
                        endAt: hackathon.endAt.toISOString(),
                        registrationCloses: hackathon.registrationCloses.toISOString(),
                        status: hackathon.status,
                        createdAt: hackathon.createdAt.toISOString(),
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
