import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { OAuth2Client } from "google-auth-library";
import authConfig from "@/auth.config";
import { upsertUser } from "@/lib/db/users";

const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },

  // Custom pages: stop NextAuth redirecting to its own /api/auth/signin
  pages: {
    signIn: "/",
    error: "/", // Redirect to home on error
  },

  // Add this to clear cookies on failed login
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),

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

        // No whitelist check — anyone verified may sign in. Access is decided
        // per-request by lib/access.ts (new users land on /pending).
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
    // Identity gate only: require a Google-verified email. Whether the user
    // may USE the app is decided per-request in lib/access.ts — pending users
    // still get a session and land on /pending.
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        return profile?.email_verified === true;
      }
      if (account?.provider === "google-one-tap") {
        return true; // token + email_verified already checked in authorize()
      }
      return false;
    },

    // Persist user data into JWT — single upsert point for both providers.
    // New emails get a users row with status 'pending'.
    async jwt({ token, user, account, profile }) {
      if (user?.email) {
        token.picture = user.image;

        try {
          const dbUser = await upsertUser({
            email: user.email,
            emailVerified:
              account?.provider === "google-one-tap"
                ? true // enforced in authorize()
                : (profile?.email_verified as boolean | undefined),
            name: user.name,
            givenName: profile?.given_name as string | undefined,
            familyName: profile?.family_name as string | undefined,
            image: user.image,
            locale: profile?.locale as string | undefined,
          });
          token.userId = dbUser.id;
        } catch {
          // DB unreachable — keep an identity-only token so the owner
          // fail-safe (lib/access.ts) still lets the owner in.
        }
      }

      return token;
    },

    // Expose JWT data to session object
    async session({ session, token }) {      
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.image = token.picture as string;
      }
      
      return session;
    },
  },
});
