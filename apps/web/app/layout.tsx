import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AuthProvider } from "@/src/lib/auth-context";

export const metadata: Metadata = {
  title: "WonderKids English - Fun English Learning for Kids",
  description: "Interactive English lessons, games, and AI tutoring designed for children aged 5-12",
  keywords: ["english learning", "kids education", "interactive lessons", "language learning"],
  authors: [{ name: "WonderKids Team" }],
  openGraph: {
    title: "WonderKids English",
    description: "Fun English Learning for Kids",
    type: "website",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children
}: RootLayoutProps) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
