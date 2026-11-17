import type { Metadata } from "next";
import { sora, manrope, mono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krishna Trailor Company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${mono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
