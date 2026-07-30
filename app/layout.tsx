import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ToastProvider } from "@/components/shared/Toast";
import { CustomCursor } from "@/components/shared/CustomCursor";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { ParticleField } from "@/components/shared/ParticleField";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { ThemeInitializer } from "@/components/shared/ThemeInitializer";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";
import { SkipLink } from "@/components/shared/SkipLink";
import { AutoSave } from "@/components/shared/AutoSave";
import { KeyboardShortcutHint } from "@/components/shared/KeyboardShortcutHint";
import { JsonLd } from "@/components/shared/JsonLd";

const baseUrl = "https://aurastyle.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
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
    "color analysis",
    "personal styling",
  ],
  authors: [{ name: "AURASTYLE", url: baseUrl }],
  creator: "AURASTYLE",
  publisher: "AURASTYLE",
  robots: { index: true, follow: true },
  alternates: { canonical: baseUrl },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AURASTYLE",
    title: "AURASTYLE — AI-Powered Style Intelligence",
    description:
      "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser.",
    url: baseUrl,
    images: [{ url: `${baseUrl}/icon-512.svg`, width: 512, height: 512, alt: "AURASTYLE" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AURASTYLE — AI-Powered Style Intelligence",
    description:
      "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser.",
    images: [`${baseUrl}/icon-512.svg`],
  },
  appleWebApp: {
    capable: true,
    title: "AURASTYLE",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E8" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0A08" },
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
        <meta name="theme-color" content="#F5F0E8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0D0A08" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <JsonLd />
      </head>
      <body className="antialiased grain vignette">
        <ThemeInitializer />
        <LoadingScreen />
        <ParticleField />
        <CustomCursor />
        <SkipLink />
        <CommandPalette />
        <OfflineIndicator />
        <ServiceWorkerRegister />
        <KeyboardShortcutHint />
        <AutoSave />
        <ToastProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ToastProvider>
      </body>
    </html>
  );
}
