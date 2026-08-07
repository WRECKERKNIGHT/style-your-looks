import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ToastProvider } from "@/components/shared/Toast";
import { ThemeInitializer } from "@/components/shared/ThemeInitializer";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";
import { SkipLink } from "@/components/shared/SkipLink";
import { JsonLd } from "@/components/shared/JsonLd";
import ClientDecorations from "@/components/shared/ClientDecorations";
import { CursorGlow } from "@/components/shared/CursorGlow";
import { ScrollProgressBar } from "@/components/landing/ScrollProgressBar";

const baseUrl = "https://zervey.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ZERVEY — AI-Powered Style Intelligence",
    template: "%s | ZERVEY",
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
    "tone studio",
    "personal styling",
  ],
  authors: [{ name: "ZERVEY", url: baseUrl }],
  creator: "ZERVEY",
  publisher: "ZERVEY",
  robots: { index: true, follow: true },
  alternates: { canonical: baseUrl },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ZERVEY",
    title: "ZERVEY — AI-Powered Style Intelligence",
    description:
      "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser.",
    url: baseUrl,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ZERVEY — AI style intelligence, entirely on-device" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZERVEY — AI-Powered Style Intelligence",
    description:
      "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser.",
    images: ["/og.png"],
  },
  appleWebApp: {
    capable: true,
    title: "ZERVEY",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F0E5" },
    { media: "(prefers-color-scheme: dark)", color: "#241812" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="D-ErFCv48rC-Nd_oYBDtFwe1DB0uwtPr54MA0OVVUl0" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F6F0E5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#241812" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <JsonLd />
      </head>
      <body className="antialiased">
        <div className="grain" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
        <ThemeInitializer />
        <SkipLink />
        <OfflineIndicator />
        <ServiceWorkerRegister />
        <ClientDecorations />
        <CursorGlow />
        <ScrollProgressBar />
        <ToastProvider>
          <SmoothScroll>
            <main id="main-content">{children}</main>
          </SmoothScroll>
        </ToastProvider>
      </body>
    </html>
  );
}
