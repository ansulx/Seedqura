import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resync — Intelligent Agriculture × Precision Medicine",
  description:
    "A research-first technology company building intelligent AI for agriculture and precision medicine.",
  openGraph: {
    title: "Resync — Intelligent Agriculture × Precision Medicine",
    description:
      "Research-driven AI for agriculture and healthcare — from field to hospital.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
