import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MALL",
  description: "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "MALL" }],
  icons: {
    icon: "https://i.imgur.com/KyoUucm.jpeg",
  },
  openGraph: {
    title: "MALL is an intelligent cloud global order matching center.",
    description: "MALL is an intelligent cloud global order matching center.",
    url: "https://chat.z.ai",
    siteName: "MALL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "First site of commsion earning",
    description: "MALL deposit is a secure and reliable platform to manage your funds online. Enjoy fast deposits, seamless transactions, and real-time balance updates. Trusted by users for its transparency, safety, and ease of use.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
