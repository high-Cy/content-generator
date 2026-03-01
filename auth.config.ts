import type { NextAuthConfig } from "next-auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export default {
  providers: [], // Providers are defined in auth.ts, not needed here

  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = request.nextUrl.pathname === "/";
      const isAuthRoute = request.nextUrl.pathname.startsWith("/api/auth");

      // Always allow auth API routes
      if (isAuthRoute) return true;

      // Authenticated admin hitting login page → redirect to dashboard
      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      // Unauthenticated user on any protected route → redirect to login
      if (!isLoggedIn && !isOnLoginPage) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      // Extra safety: even if somehow a non-admin session exists, block them
      if (isLoggedIn && auth?.user?.email !== ADMIN_EMAIL) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
