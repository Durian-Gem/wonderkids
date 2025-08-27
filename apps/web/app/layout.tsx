import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AuthProvider } from "@/src/lib/auth-context";
import "./globals.css";

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
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params
}: RootLayoutProps) {
  const { locale } = await params;
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
