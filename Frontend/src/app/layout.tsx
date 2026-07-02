import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { AppShell } from "@/components/effects/LoadingScreen";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Resync — Where AI Meets Agriculture & Healthcare",
  description:
    "Resync builds intelligent technologies that transform agriculture and healthcare using AI, Computer Vision, IoT, Remote Sensing, and Advanced Analytics.",
  openGraph: {
    title: "Resync — Where AI Meets Agriculture & Healthcare",
    description:
      "Connecting Agriculture & Healthcare through Artificial Intelligence.",
    images: ["/resync-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full scroll-smooth`}>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
        <style>{`:root { --font-satoshi: 'Satoshi', system-ui, sans-serif; }`}</style>
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AppShell>
          <AnimatedBackground />
          <CursorGlow />
          {children}
        </AppShell>
      </body>
    </html>
  );
}
