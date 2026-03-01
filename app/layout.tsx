// app/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import ThemeRegistry from "@/components/ThemeRegistry";
import Navbar from "@/components/layout/Navbar";
import { auth } from "@/auth";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Nóvèl", template: "%s | Nóvèl" },
  description: "Automated Rednote content pipeline — from raw idea to polished post.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" className={`${playfair.variable} ${ibmPlexMono.variable}`}>
      <body>
        <SessionProvider session={session}>
          <ThemeRegistry>
            <Navbar session={session} />
            <main>{children}</main>
          </ThemeRegistry>
        </SessionProvider>
      </body>
    </html>
  );
}
