import type { NextAuthConfig } from "next-auth";

export default {
  providers: [], // Providers are defined in auth.ts, not needed here

  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = request.nextUrl.pathname === "/";
      const isAuthRoute = request.nextUrl.pathname.startsWith("/api/auth");

      if (isAuthRoute) return true;
      
      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL("/generate", request.nextUrl));
      }

      if (!isLoggedIn && !isOnLoginPage) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
