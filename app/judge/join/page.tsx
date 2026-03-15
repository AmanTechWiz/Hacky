import { auth } from "@/auth";
import JudgeJoinClient from "@/components/judge-join-client";
import { redirect } from "next/navigation";

export default async function JudgeJoinPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?role=judge");

  return <JudgeJoinClient />;
}
