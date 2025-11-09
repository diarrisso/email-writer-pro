import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Masinga Tech - Email Writer Pro",
  description: "Assistant de rédaction d'emails professionnel propulsé par IA. Supporte l'anglais, l'allemand et le français.",
  keywords: ["email", "ai", "writing assistant", "masinga tech", "professional emails", "multilingual"],
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
