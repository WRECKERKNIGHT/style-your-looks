import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/LegalPage";
import {
  ScrollBlur,
  SectionScrollProgress,
} from "@/components/shared/ScrollEffects";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "ZERVEY terms of service — the simple rules that keep ZERVEY free, honest, and useful for everyone.",
};

const sections = [
  {
    heading: "1. THE SHORT VERSION",
    body: "ZERVEY is a free, on-device style analysis tool. Use it respectfully, don't misuse it, and don't rely on it as professional medical or legal advice.",
  },
  {
    heading: "2. USING THE SERVICE",
    body: "You may use ZERVEY for personal, non-commercial purposes. You are responsible for the photos you analyze and for any content you publish to the community feed. You agree not to upload content you do not have the right to use, or that is unlawful, harassing, or harmful.",
  },
  {
    heading: "3. ACCOUNTS",
    body: "You must provide accurate information when creating an account and keep your credentials secure. You are responsible for activity under your account. You may delete your account at any time.",
  },
  {
    heading: "4. ON-DEVICE ANALYSIS",
    body: "Core analysis runs in your browser and is provided on an as-is basis. Results are informational style guidance, not medical, psychological, or fitness advice. Always consult qualified professionals for health-related concerns.",
  },
  {
    heading: "5. COMMUNITY CONTENT",
    body: "Content you post to the community feed becomes visible to other users. You retain ownership of your content but grant ZERVEY a limited license to display it in the community. We may remove content that violates these terms.",
  },
  {
    heading: "6. INTELLECTUAL PROPERTY",
    body: "ZERVEY is open source. The ZERVEY name, logo, and brand assets remain the property of the project. You may not use them to imply endorsement without permission.",
  },
  {
    heading: "7. NO WARRANTY & LIABILITY",
    body: "The service is provided free of charge and without warranty of any kind, express or implied. To the maximum extent permitted by law, ZERVEY shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.",
  },
  {
    heading: "8. CHANGES & CONTACT",
    body: "We may update these terms from time to time, with the effective date noted below. Questions? Open an issue on the ZERVEY GitHub repository and we will get back to you.",
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="ZERVEY // LEGAL"
      title={
        <>
          SIMPLE RULES.{" "}
          <span className="text-gradient-aurum">NO FINE PRINT.</span>
        </>
      }
      subtitle="The terms of using ZERVEY, written the way we wish everyone wrote them."
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
