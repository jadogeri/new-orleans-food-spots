import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins/bearer";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db";
import {
  usersTable,
  sessionsTable,
  accountsTable,
  verificationsTable,
} from "@repo/db";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

/**
 * Temporary store for Better Auth reset tokens captured from the
 * sendResetPassword callback.  The token is stored keyed by email
 * and consumed (deleted) once the AuthService has used it.
 */
export const capturedResetTokens = new Map<string, string>();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verification: verificationsTable,
    },
  }),
  secret: process.env.SESSION_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:5000",
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async (data: { url: string; user: { email: string } }) => {
      // Extract the reset token from the URL (.../reset-password/<token>?...)
      const match = (data.url ?? "").match(/reset-password\/([^?]+)/);
      if (match?.[1]) {
        capturedResetTokens.set(data.user.email, match[1]);
      }
    },
  },
  plugins: [bearer()],
  trustedOrigins: ["*"],
});

export type Auth = typeof auth;
