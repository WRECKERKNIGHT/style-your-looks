import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";

export const metadata: Metadata = {
  title: "ZERVEY — AI-Powered Style Intelligence",
  description:
    "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser — your photos never leave your device.",
  openGraph: {
    title: "ZERVEY — AI-Powered Style Intelligence",
    description:
      "AI-powered facial analysis, virtual try-on, and outfit recommendations. All analysis runs in your browser.",
    type: "website",
    siteName: "ZERVEY",
  },
};

export default function HomePage() {
  return <Hero />;
}
