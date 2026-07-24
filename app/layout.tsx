import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AuraStyle - AI-Powered Personal Style Intelligence",
    template: "%s | AuraStyle",
  },
  description:
    "Discover your perfect style with advanced facial analysis, virtual try-on, and personalized outfit recommendations. All AI runs in your browser.",
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
  authors: [{ name: "AuraStyle" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AuraStyle",
    title: "AuraStyle - AI-Powered Personal Style Intelligence",
    description:
      "Discover your perfect style with advanced facial analysis, virtual try-on, and personalized outfit recommendations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraStyle - AI-Powered Personal Style Intelligence",
    description:
      "Discover your perfect style with advanced facial analysis, virtual try-on, and personalized outfit recommendations.",
  },
};

export const viewport: Viewport = {
  themeColor: "#3C2A21",
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
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
