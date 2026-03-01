import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);
export { auth as proxy };

export const config = {
  // Run proxy on all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};