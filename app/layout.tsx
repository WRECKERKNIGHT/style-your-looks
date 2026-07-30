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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F5F0E8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0D0A08" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="antialiased grain vignette">
        <ThemeInitializer />
        <LoadingScreen />
        <ParticleField />
        <CustomCursor />
        <CommandPalette />
        <OfflineIndicator />
        <ServiceWorkerRegister />
        <ToastProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ToastProvider>
      </body>
    </html>
  );
}
