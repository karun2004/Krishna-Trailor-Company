import type { Metadata } from "next";
import { sora, manrope, mono, hero } from "@/lib/fonts";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Krishna Trailor Company", template: "%s | Krishna Trailor Company" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${mono.variable} ${hero.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
