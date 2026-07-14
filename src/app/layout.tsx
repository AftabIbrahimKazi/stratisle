import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/strata.css";
import "../styles/tokens.css";
import "../styles/main.css";
import "../styles/responsive.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stratisle — 3D South Nicobar Island Experience",
  description:
    "A cinematic 3D journey around South Nicobar Island — real heightmap terrain and live weather, built with Next.js, Strata CSS and Triforge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-st-theme="light"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
