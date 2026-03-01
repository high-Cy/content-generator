import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { OAuth2Client } from "google-auth-library"

const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // 1. Your existing standard Google login
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // 2. The NEW One Tap Provider
    Credentials({
      id: "google-one-tap",
      name: "Google One Tap",
      credentials: {
        credential: { type: "text" },
      },
      async authorize(credentials) {
        const token = credentials.credential as string;
        
        // Verify the token with Google's servers
        const ticket = await googleAuthClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        if (!payload) throw new Error("Invalid Google Token");

        if (payload.email !== "loh.chengyin@gmail.com") {
           throw new Error("Access Denied");
        }

        // Return the user object to create the session
        return {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
          image: payload.picture,
        };
      }
    })
  ],
  // ... keep your existing callbacks if you have them
})