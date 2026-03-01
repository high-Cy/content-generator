import { auth } from "@/auth";

export { auth as proxy };

export const config = {
  // Run proxy on all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};