import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/LegalPage";
import {
  ScrollBlur,
  SectionScrollProgress,
} from "@/components/shared/ScrollEffects";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ZERVEY privacy policy — your photos are processed on your device and never leave it. What we collect, what we never collect, and your rights.",
};

const sections = [
  {
    heading: "1. ON-DEVICE BY DEFAULT",
    body: "ZERVEY's core analysis — face, body, color, grooming — runs entirely in your browser using on-device machine learning. Your photos are not uploaded to our servers for analysis. When you delete a photo from the app, it is gone from your device.",
  },
  {
    heading: "2. WHAT WE NEVER COLLECT",
    body: "We never collect or store your facial images, body images, analysis results, or biometric data. There are no tracking pixels, no ad networks, and no third-party analytics on the analysis pages.",
  },
  {
    heading: "3. ACCOUNT DATA",
    body: "If you create an account, we store the minimum required to keep you signed in: your email, name, and the history entries you choose to save locally. Saved history is stored on your device and in your account storage only so it can be restored across devices.",
  },
  {
    heading: "4. COMMUNITY POSTS",
    body: "If you share a post to the community feed, the content you explicitly publish is visible to other users. Never share anything you would not want public. You can delete your own posts at any time.",
  },
  {
    heading: "5. COOKIES & SESSIONS",
    body: "We use only the session cookies required for authentication. We do not use cookies for advertising or cross-site tracking. You can clear them without affecting core features.",
  },
  {
    heading: "6. DATA RETENTION",
    body: "Account records are kept only while your account is active. Deleting your account removes your profile and any published community content. Locally saved analysis history is removed when you clear the app data on your device.",
  },
  {
    heading: "7. YOUR RIGHTS",
    body: "You may access, export, or delete your data at any time from your profile page or by contacting us. Because analysis never leaves your device, most of your data is already fully under your control.",
  },
  {
    heading: "8. CHANGES",
    body: "If this policy changes materially, we will update it here and note the effective date. Continued use after changes constitutes acceptance.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="ZERVEY // LEGAL"
      title={
        <>
          PRIVACY IS THE{" "}
          <span className="text-gradient-aurum">DEFAULT.</span>
        </>
      }
      subtitle="Your face is yours. Here is exactly what ZERVEY does — and does not — do with your data."
    >
      <div className="space-y-8">
        <SectionScrollProgress />
        {sections.map((section) => (
          <ScrollBlur
            key={section.heading}
            sharpAt={0.4}
            minOpacity={0.4}
            className="space-y-2"
          >
            <h2 className="type-label text-[var(--text-primary)]">
              {section.heading}
            </h2>
            <p className="text-[var(--text-muted)] font-body leading-relaxed text-[15px]">
              {section.body}
            </p>
          </ScrollBlur>
        ))}
      </div>
      <ScrollBlur sharpAt={0.3} minOpacity={0.3}>
        <p className="type-mono text-[0.6rem] text-[var(--text-muted)] tracking-widest pt-6 border-t border-[var(--border-primary)]">
          LAST UPDATED: AUGUST 2026
        </p>
      </ScrollBlur>
    </LegalPage>
  );
}
