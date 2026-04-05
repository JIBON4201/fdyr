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
  title: "QuickTaskJob - Earn Money Online Easily",

  description:
    "QuickTaskJob is a simple and secure platform where you can earn money online by completing small tasks. Start earning daily with fast payments and an easy-to-use system.",

  keywords: [
    "earn money online",
    "online task job",
    "daily earning platform",
    "micro task earning",
    "QuickTaskJob"
  ],

  authors: [{ name: "QuickTaskJob Team" }],

  icons: {
    icon: "https://i.imgur.com/KyoUucm.jpeg",
  },

  openGraph: {
    title: "QuickTaskJob - Earn Money Online Easily",
    description:
      "Join QuickTaskJob and start earning money online by completing simple tasks.",
    url: "https://quicktaskjob.com",
    siteName: "QuickTaskJob",
    type: "website",
  },

  twitter: {
    card: "summary_large_image", // ❗ এখানে আগের ভুল ছিল (string দিতে হয়)
    title: "Earn Money Online with QuickTaskJob",
    description:
      "Complete simple tasks and earn money daily with ease.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
