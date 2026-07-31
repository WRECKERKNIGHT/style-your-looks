"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(
  () => import("@/components/shared/CustomCursor"),
  { ssr: false }
);
const ParticleField = dynamic(
  () => import("@/components/shared/ParticleField"),
  { ssr: false }
);
const LoadingScreen = dynamic(
  () => import("@/components/shared/LoadingScreen"),
  { ssr: false }
);
const CommandPalette = dynamic(
  () => import("@/components/shared/CommandPalette"),
  { ssr: false }
);
const KeyboardShortcutHint = dynamic(
  () => import("@/components/shared/KeyboardShortcutHint"),
  { ssr: false }
);

export default function ClientDecorations() {
  return (
    <>
      <LoadingScreen />
      <ParticleField />
      <CustomCursor />
      <CommandPalette />
      <KeyboardShortcutHint />
    </>
  );
}
