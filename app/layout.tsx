import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PropertyAI — AI-Powered Property Search",
  description:
    "Find your perfect home with an AI agent powered by Gemini function calling. Enter your preferences and let AI rank the best properties for you.",
  keywords: ["property search", "real estate AI", "Gemini", "home finder"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
