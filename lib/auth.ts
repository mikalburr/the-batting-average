import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// NextAuth 4 calls new URL(NEXTAUTH_URL) at module init time.
// If the env var is missing or contains a placeholder, clear it so
// NextAuth auto-detects the URL from VERCEL_URL / the incoming request.
if (process.env.NEXTAUTH_URL) {
  try {
    new URL(process.env.NEXTAUTH_URL);
  } catch {
    delete process.env.NEXTAUTH_URL;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) return null;
        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return { id: "admin", email: adminEmail, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
};
