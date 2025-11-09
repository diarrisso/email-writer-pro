import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Email Writer Pro - AI-Powered Email Assistant",
  description: "Transform your thoughts into polished, professional emails with AI assistance. Supports English, German, and French.",
  keywords: ["email", "ai", "writing assistant", "professional emails", "multilingual"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
