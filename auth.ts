import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
    Google,
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role ?? "PARTICIPANT";
        session.user.githubUserId = user.githubUserId ?? null;
        session.user.githubUsername = user.githubUsername ?? null;
        session.user.avatar = user.avatar ?? user.image ?? null;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "github" || !profile) {
        return;
      }

      const githubUserId = String((profile as { id: number | string }).id);
      const githubUsername =
        (profile as { login?: string }).login ?? user.name ?? null;
      const avatar = (profile as { avatar_url?: string }).avatar_url ?? null;

      const linkedAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "github",
            providerAccountId: account.providerAccountId,
          },
        },
        select: { userId: true },
      });

      if (!linkedAccount) {
        return;
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: linkedAccount.userId },
        select: { githubUserId: true },
      });

      if (currentUser?.githubUserId && currentUser.githubUserId !== githubUserId) {
        return;
      }

      await prisma.user.update({
        where: { id: linkedAccount.userId },
        data: {
          githubUserId,
          githubUsername,
          avatar,
          image: avatar,
          email: user.email,
        },
      });
    },
  },
  pages: {
    signIn: "/login",
  },
});
