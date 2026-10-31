import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zylo — Subscription Management Platform",
  description: "One unified platform for recurring plans, billing, and automated renewals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">{children}</body>
    </html>
  );
}
