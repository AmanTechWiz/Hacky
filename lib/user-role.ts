import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";

export function normalizeRole(value: string | undefined): UserRole {
  return value === "organizer" ? UserRole.ORGANIZER : UserRole.PARTICIPANT;
}

export async function syncUserRoleFromCookie(userId: string, currentRole: UserRole) {
  const cookieStore = await cookies();
  const selected = cookieStore.get("selected_role")?.value;

  if (!selected) {
    return currentRole;
  }

  const nextRole = normalizeRole(selected);
  if (nextRole === currentRole) {
    return currentRole;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: nextRole },
  });

  return nextRole;
}
