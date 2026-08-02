import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ToastProvider } from "@/components/shared/Toast";
import { ThemeInitializer } from "@/components/shared/ThemeInitializer";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";
import { SkipLink } from "@/components/shared/SkipLink";
import { AutoSave } from "@/components/shared/AutoSave";
import { JsonLd } from "@/components/shared/JsonLd";
import ClientDecorations from "@/components/shared/ClientDecorations";
import { CursorGlow } from "@/components/shared/CursorGlow";
import { ScrollProgressBar } from "@/components/landing/ScrollProgressBar";

const baseUrl = "https://nexari.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "NEXARI — AI-Powered Style Intelligence",
    template: "%s | NEXARI",
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
    "color analysis",
    "personal styling",
  ],
  authors: [{ name: "NEXARI", url: baseUrl }],
  creator: "NEXARI",
  publisher: "NEXARI",
  robots: { index: true, follow: true },
  alternates: { canonical: baseUrl },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NEXARI",
    title: "NEXARI — AI-Powered Style Intelligence",
    description:
      "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser.",
    url: baseUrl,
    images: [{ url: `${baseUrl}/icon-512.svg`, width: 512, height: 512, alt: "NEXARI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXARI — AI-Powered Style Intelligence",
    description:
      "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser.",
    images: [`${baseUrl}/icon-512.svg`],
  },
  appleWebApp: {
    capable: true,
    title: "NEXARI",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F0A2E" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0618" },
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F0A2E" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0A0618" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <JsonLd />
      </head>
      <body className="antialiased grain vignette">
        <ThemeInitializer />
        <SkipLink />
        <OfflineIndicator />
        <ServiceWorkerRegister />
        <AutoSave />
        <ClientDecorations />
        <CursorGlow />
        <ScrollProgressBar />
        <ToastProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ToastProvider>
      </body>
    </html>
  );
}
