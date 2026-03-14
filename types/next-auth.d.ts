import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

type UserRole = "PARTICIPANT" | "ORGANIZER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      githubUserId: string | null;
      githubUsername: string | null;
      avatar: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    githubUserId?: string | null;
    githubUsername?: string | null;
    avatar?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    githubUserId?: string | null;
    githubUsername?: string | null;
    avatar?: string | null;
  }
}
