// app/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Syne, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import ThemeRegistry from "@/components/ThemeRegistry";
import Navbar from "@/components/layout/Navbar";
import { auth } from "@/auth";
import { resolveAccess } from "@/lib/access";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Kept for Mono/CodeBlock components only
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Fawn", template: "%s | Fawn" },
  description: "Automated Rednote content pipeline — from raw idea to polished post.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.email
    ? (await resolveAccess(session.user.email)).role === "admin"
    : false;

  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}>
      <body>
        <SessionProvider session={session}>
          <ThemeRegistry>
            <Navbar session={session} isAdmin={isAdmin} />
            <main>{children}</main>
          </ThemeRegistry>
        </SessionProvider>
      </body>
    </html>
  );
}
