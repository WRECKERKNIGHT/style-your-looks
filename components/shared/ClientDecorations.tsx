"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(
  () => import("@/components/shared/CustomCursor").then((m) => m.CustomCursor),
  { ssr: false }
);
const LoadingScreen = dynamic(
  () => import("@/components/shared/LoadingScreen").then((m) => m.LoadingScreen),
  { ssr: false }
);
const CommandPalette = dynamic(
  () => import("@/components/shared/CommandPalette").then((m) => m.CommandPalette),
  { ssr: false }
);
const KeyboardShortcutHint = dynamic(
  () => import("@/components/shared/KeyboardShortcutHint").then((m) => m.KeyboardShortcutHint),
  { ssr: false }
);

export default function ClientDecorations() {
  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      <CommandPalette />
      <KeyboardShortcutHint />
    </>
  );
}
