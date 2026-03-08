import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { OAuth2Client } from "google-auth-library";
import authConfig from "@/auth.config";
import { upsertUser, getUserAccess } from "@/lib/db/users";

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
        
        const access = await getUserAccess(payload.email!);
        if (!access?.isAllowed) {
          throw new Error("Access denied");
        }

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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Check database for access
        const access = await getUserAccess(user.email!);
        
        if (!access?.isAllowed) {
          return false;
        }
        
        // Log user to database (tracks all sign-in attempts)
        if (user.email && user.id) {
          const dbUser = await upsertUser({
            email: user.email,
            emailVerified: profile?.email_verified as boolean | undefined,
            name: user.name,
            givenName: profile?.given_name as string | undefined,
            familyName: profile?.family_name as string | undefined,
            image: user.image,
            locale: profile?.locale as string | undefined,
          });
          user.id = dbUser.id;
        }
        
        return true;
      }
      return false;
    },

    // Persist user data into JWT
    async jwt({ token, user }) {
      if (user) {
        token.picture = user.image;

        // Log One Tap sign-ins and get database userId
        if (user.email && user.id) {
          const extUser = user as typeof user & {
            emailVerified?: Date;
            givenName?: string;
            familyName?: string;
            locale?: string;
          };
          const dbUser = await upsertUser({
            email: user.email,
            emailVerified: !!extUser.emailVerified,
            name: user.name,
            givenName: extUser.givenName,
            familyName: extUser.familyName,
            image: user.image,
            locale: extUser.locale,
          });
          token.userId = dbUser.id;
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
