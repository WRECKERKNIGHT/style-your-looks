import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";

export const metadata: Metadata = {
  title: {
    default: "AURASTYLE — AI-Powered Style Intelligence",
    template: "%s | AURASTYLE",
  },
  description:
    "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser. Your photos never leave your device.",
  keywords: [
    "face analysis",
    "style recommendations",
    "virtual try-on",
    "skin tone detection",
    "body type analysis",
    "AI fashion",
    "grooming",
    "beard simulator",
  ],
  authors: [{ name: "AURASTYLE" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AURASTYLE",
    title: "AURASTYLE — AI-Powered Style Intelligence",
    description:
      "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AURASTYLE — AI-Powered Style Intelligence",
    description:
      "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser.",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F0E8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased grain vignette">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
