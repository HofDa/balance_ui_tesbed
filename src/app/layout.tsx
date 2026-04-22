import type { Metadata } from "next";
import { Geist, Geist_Mono, Major_Mono_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const displayMono = Major_Mono_Display({
  variable: "--font-display-mono",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "b*nature — Vielfalt unserer Region",
  description:
    "Biodiversität für Südtirol. Spielerisch deinen Fußabdruck verstehen und lokale Projekte unterstützen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${displayMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
