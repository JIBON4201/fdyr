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
  title: "QUICKTASK",
  description: "Quick task deposit is a secure and reliable platform to manage your funds online. Enjoy fast deposits, seamless transactions, and real-time balance updates. Trusted by users for its transparency, safety, and ease of use",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Quicktask" }],
  icons: {
    icon: "https://i.imgur.com/KyoUucm.jpeg",
  },
  openGraph: {
    title: "Quick task is an intelligent cloud global order matching center.",
    description: "Quick  taskis an intelligent cloud global order matching center.",
    url: "",
    siteName: "Quick Task",
    type: "website",
  },
  twitter: {
    card: "Quick task is an intelligent cloud global order matching center.",
    title: "First site of commsion earning",
    description: "Quick task deposit is a secure and reliable platform to manage your funds online. Enjoy fast deposits, seamless transactions, and real-time balance updates. Trusted by users for its transparency, safety, and ease of use.",
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
