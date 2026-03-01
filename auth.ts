import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { OAuth2Client } from "google-auth-library";
import authConfig from "@/auth.config";

const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // Spread edge-safe config (callbacks.authorized etc.)

  // JWT strategy required — no DB adapter
  session: { strategy: "jwt" },

  // Custom pages: stop NextAuth redirecting to its own /api/auth/signin
  pages: {
    signIn: "/",
    error: "/",
  },

  providers: [
    // Standard Google OAuth button
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Google One Tap — verifies the GSI credential token server-side
    Credentials({
      id: "google-one-tap",
      name: "Google One Tap",
      credentials: {
        credential: { type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.credential as string;
        if (!token) throw new Error("No credential provided");

        const ticket = await googleAuthClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) throw new Error("Invalid Google token");
        if (!payload.email_verified) throw new Error("Email not verified");
        if (payload.email !== ADMIN_EMAIL) throw new Error("Access denied");

        return {
          id: payload.sub,
          name: payload.name ?? null,
          email: payload.email,
          image: payload.picture ?? null,
        };
      },
    }),
  ],

  callbacks: {
    // Guard standard Google OAuth button (One Tap is guarded in authorize())
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        return user.email === ADMIN_EMAIL;
      }
      return true;
    },

    // Persist user data into JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }
      return token;
    },

    // Expose JWT data to session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});