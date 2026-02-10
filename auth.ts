import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "github" && profile) {
        token.githubUserId = String((profile as { id: number | string }).id);
        token.githubUsername =
          (profile as { login?: string }).login ?? token.name ?? null;
        token.avatar = (profile as { avatar_url?: string }).avatar_url ?? null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.githubUserId = (token.githubUserId as string | null) ?? null;
        session.user.githubUsername =
          (token.githubUsername as string | null) ?? null;
        session.user.avatar = (token.avatar as string | null) ?? null;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
