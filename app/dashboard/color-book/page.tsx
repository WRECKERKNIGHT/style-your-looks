"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, Copy, Check, Sparkles } from "lucide-react";
import { SectionScrollProgress } from "@/components/shared/ScrollEffects";
import {
  JAPANESE_COLORS,
  SEASONS,
  getColor,
  readableTextColor,
  type Season,
} from "@/lib/data/japanese-colors";
import {
  MEN_COMBOS,
  WOMEN_COMBOS,
  type OutfitCombo,
} from "@/lib/data/japanese-color-book";
import { useToast } from "@/components/shared/Toast";
import { OutfitIllustration } from "@/components/color-book/OutfitIllustration";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

/**
 * Hand-drawn SVG illustrations show the actual garment silhouettes filled
 * with the correct traditional Japanese color hex values — the whole point
 * of the Color Book. Unsplash stock photos are random and don't represent
 * the actual color combinations, so the SVG illustration is primary.
 */
function ComboPhotoView({ combo }: { combo: OutfitCombo }) {
  return <OutfitIllustration combo={combo} />;
}

function SwatchStrip({ combo }: { combo: OutfitCombo }) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full">
      {combo.items.map(({ garment, colorId }) => (
        <span
          key={garment}
          title={`${garment}: ${getColor(colorId).name}`}
          className="flex-1"
          style={{ backgroundColor: getColor(colorId).hex }}
        />
      ))}
    </div>
  );
}

function ComboCard({ combo, onOpen }: { combo: OutfitCombo; onOpen: () => void }) {
  const season = SEASONS.find((s) => s.id === combo.season);
  return (
    <button
      onClick={onOpen}
      className="group w-full text-left border border-[var(--border-primary)] bg-[var(--bg-secondary)] rounded-[var(--radius-md)] overflow-hidden transition-all hover:border-[var(--accent-aurum)]/50 hover:shadow-aurum"
    >
      <div className="aspect-[4/3] border-b border-[var(--border-primary)] overflow-hidden">
        <div className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.03] overflow-hidden">
          <ComboPhotoView combo={combo} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="text-sm font-body font-bold text-[var(--text-primary)] tracking-wide group-hover:text-[var(--accent-aurum)] transition-colors">
            {combo.name}
          </span>
          <span className="font-display text-lg text-[var(--accent-mocha)] shrink-0">{combo.kanji}</span>
        </div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="type-mono text-[0.5rem] tracking-widest uppercase text-[var(--text-muted)]">
            {combo.romaji}
          </span>
          {season && (
            <span className="type-mono text-[0.5rem] tracking-widest uppercase px-1.5 py-0.5 rounded-full border border-[var(--border-primary)] text-[var(--accent-mocha)]">
              {season.label} {season.kanji}
            </span>
          )}
        </div>
        <SwatchStrip combo={combo} />
      </div>
    </button>
  );
}

function SeasonFilter({
  active,
  onChange,
}: {
  active: Season | "all";
  onChange: (s: Season | "all") => void;
}) {
  const base =
    "px-3 py-1.5 type-mono text-[0.55rem] tracking-widest uppercase border transition-all";
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange("all")}
        className={`${base} ${
          active === "all"
            ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)] bg-aurum-500/[0.07]"
            : "border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        } rounded-full`}
      >
        All 四季
      </button>
      {SEASONS.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`${base} ${
            active === s.id
              ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)] bg-aurum-500/[0.07]"
              : "border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          } rounded-full`}
        >
          {s.label} {s.kanji}
        </button>
      ))}
    </div>
  );
}

interface PanelProps {
  side: "left" | "right";
  panelId: string;
  volumeLabel: string;
  kanji: string;
  romaji: string;
  combos: OutfitCombo[];
  seasonFilter: Season | "all";
  onOpenCombo: (combo: OutfitCombo) => void;
}

/**
 * One half of the split-screen book: a fixed colour-coded cover column and a
 * scrollable list of combinations (the book's pages).
 */
function BookPanel({
  side,
  panelId,
  volumeLabel,
  kanji,
  romaji,
  combos,
  seasonFilter,
  onOpenCombo,
}: PanelProps) {
  const filtered = useMemo(
    () => (seasonFilter === "all" ? combos : combos.filter((c) => c.season === seasonFilter)),
    [combos, seasonFilter]
  );
  const tint = side === "left" ? "rgba(34,58,112,0.06)" : "rgba(208,16,76,0.05)";

  return (
    <section
      id={panelId}
      aria-label={`${volumeLabel} combinations`}
      className="flex flex-col lg:flex-row min-h-[60vh] border-y lg:border-y-0 border-[var(--border-primary)] scroll-mt-24"
      style={{ background: `linear-gradient(180deg, ${tint}, transparent 30%)` }}
    >
      {/* Spine / cover column */}
      <div className="lg:w-14 w-full shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] flex lg:flex-col items-center justify-between py-3 lg:py-6 px-4 lg:px-0">
        <span className="type-mono text-[0.5rem] tracking-[0.3em] uppercase text-[var(--accent-mocha)] [writing-mode:horizontal-tb] lg:[writing-mode:vertical-rl]">
          {volumeLabel}
        </span>
        <span className="font-display text-xl text-[var(--accent-aurum)]">{kanji}</span>
        <span className="type-mono text-[0.45rem] tracking-[0.3em] uppercase text-[var(--text-muted)] hidden lg:block [writing-mode:vertical-rl]">
          {romaji}
        </span>
      </div>

      {/* Pages */}
      <div className="flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="type-heading text-[var(--text-primary)] tracking-tight">
            {side === "left" ? "MEN" : "WOMEN"}&apos;S VOLUME{" "}
            <span className="text-gradient-aurum">{side === "left" ? "紳士篇" : "淑女篇"}</span>
          </h2>
          <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest shrink-0">
            {filtered.length}/{combos.length}
          </span>
        </div>
        <p className="text-xs font-body text-[var(--text-muted)] leading-relaxed mb-5 max-w-md">
          {side === "left"
            ? "Traditional dentōshoku pairings cut for menswear — indigo, ink and earth tones with one seasonal accent each."
            : "Traditional dentōshoku pairings styled for womenswear — petal pinks, wisteria and deep winter reds with classical layering logic."}
        </p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filtered.map((combo) => (
            <ComboCard key={combo.id} combo={combo} onOpen={() => onOpenCombo(combo)} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-sm font-body text-[var(--text-muted)] mt-6">
            No combinations for this season in this volume.
          </p>
        )}
      </div>
    </section>
  );
}

function ComboModal({ combo, onClose }: { combo: OutfitCombo | null; onClose: () => void }) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Escape closes the sheet, Tab is trapped inside it (dialog semantics), and
  // focus returns to the card that opened the sheet on dismiss.
  useEffect(() => {
    if (!combo) return;
    const opener = document.activeElement as HTMLElement | null;
    const sheet = sheetRef.current;

    // Initial focus lands inside the dialog for screen-reader users.
    sheet?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [combo, onClose]);

  if (!combo) return null;

  const copyPalette = async () => {
    try {
      const text = combo.items
        .map(({ garment, colorId }) => `${garment}: ${getColor(colorId).name} ${getColor(colorId).hex}`)
        .join("\n");
      await navigator.clipboard.writeText(`${combo.name} (${combo.kanji})\n${text}`);
      setCopied(true);
      addToast("Palette copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast("Could not copy palette", "error");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${combo.name} combination details`}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[85vh] flex flex-col border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-nexus-xl rounded-[var(--radius-xl)]"
        >
          <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border-primary)]">
            <div>
              <p className="font-display text-2xl text-[var(--accent-aurum)] leading-none mb-1.5">
                {combo.kanji}
              </p>
              <h3 className="text-base font-body font-bold text-[var(--text-primary)] tracking-wide">
                {combo.name}
              </h3>
              <p className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest uppercase mt-1">
                {combo.romaji} &middot; {combo.occasion}
              </p>
            </div>
            <button
              onClick={onClose}
              data-autofocus
              className="p-2 border border-[var(--border-primary)] rounded-full text-[var(--text-primary)] transition-colors hover:text-aurum-500"
              aria-label="Close combination"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-primary)] aspect-[4/3]">
              <ComboPhotoView combo={combo} />
            </div>
            <div className="flex overflow-hidden border border-[var(--border-primary)] h-20">
              {combo.items.map(({ garment, colorId }) => {
                const c = getColor(colorId);
                const fg = readableTextColor(c.hex);
                return (
                  <div
                    key={garment}
                    className="flex-1 flex flex-col items-center justify-end pb-2 min-w-0"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="text-[0.55rem] font-mono truncate max-w-full px-1" style={{ color: fg }}>
                      {c.hex.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div>
              <p className="type-mono text-[0.55rem] text-[var(--accent-aurum)] tracking-[0.25em] uppercase mb-3">
                Garment breakdown
              </p>
              <ul className="space-y-2.5">
                {combo.items.map(({ garment, colorId }) => {
                  const c = getColor(colorId);
                  return (
                    <li key={garment} className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-[var(--radius-xs)] border border-[color-mix(in_srgb,var(--border-primary)_60%,transparent)] shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-body font-semibold text-[var(--text-primary)]">
                          {garment}
                        </p>
                        <p className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-wide">
                          {c.name} &middot; {c.kanji} ({c.romaji})
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="type-mono text-[0.55rem] text-[var(--accent-aurum)] tracking-[0.25em] uppercase mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Styling note
              </p>
              <p className="text-sm font-body text-[var(--text-muted)] leading-relaxed">
                {combo.description}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border-primary)]">
            <button onClick={onClose} className="btn-outline">
              Close
            </button>
            <button onClick={copyPalette} className="btn-nexus">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy palette"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ColorBookPage() {
  useEffect(() => { document.title = "Color Book | ZERVEY"; }, []);

  // One shared filter keeps both volumes aligned to the same season — like
  // flipping both halves of the book to the same chapter.
  const [seasonFilter, setSeasonFilter] = useState<Season | "all">("all");
  const [selected, setSelected] = useState<OutfitCombo | null>(null);

  return (
    <div className="space-y-8">
      <SectionScrollProgress />

      <motion.header variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="max-w-2xl">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            COLOR <span className="text-gradient-aurum">BOOK.</span>
          </h1>
          <span className="font-display text-xl text-[var(--accent-mocha)] mt-2">色見本帖</span>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead mt-3">
          A Japanese book of colour combinations — traditional dentōshoku palettes arranged as
          outfit recipes, in two mirrored volumes for men and women.
        </p>
      </motion.header>

      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
        <SeasonFilter active={seasonFilter} onChange={setSeasonFilter} />
      </motion.div>

      {/* How to read the book — three steps, so the page explains itself */}
      <motion.ol
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        aria-label="How to use the colour book"
      >
        {[
          {
            step: "01",
            title: "Pick a season",
            body: "Filter both volumes to the same seasonal chapter — spring sakura pairings, winter inks.",
          },
          {
            step: "02",
            title: "Compare volumes",
            body: "Men's and women's recipes mirror each other using the same traditional colour logic.",
          },
          {
            step: "03",
            title: "Open a combo",
            body: "Each spread shows the outfit preview plus exact hex codes you can copy for shopping.",
          },
        ].map((s) => (
          <li
            key={s.step}
            className="glass-card p-4 flex gap-3 items-start rounded-[var(--radius-md)]"
          >
            <span className="type-mono text-[0.6rem] text-[var(--accent-aurum)] tracking-widest mt-0.5 shrink-0">
              {s.step}
            </span>
            <div>
              <p className="text-sm font-body font-semibold text-[var(--text-primary)]">{s.title}</p>
              <p className="text-xs font-body text-[var(--text-muted)] leading-relaxed mt-1">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </motion.ol>

      {/* Mobile volume jump links — the split stacks on small screens */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="flex gap-2 lg:hidden">
        {[
          { href: "#volume-men", label: "MEN 紳" },
          { href: "#volume-women", label: "WOMEN 淑" },
        ].map((v) => (
          <a key={v.href} href={v.href} className="btn-outline flex-1 justify-center py-2 text-xs">
            {v.label}
          </a>
        ))}
      </motion.div>

      {/* 50/50 split screen — two volumes of the book side by side */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-paper-lg overflow-hidden">
          <BookPanel
            side="left"
            panelId="volume-men"
            volumeLabel="Volume I · Men"
            kanji="紳"
            romaji="shinshi-hen"
            combos={MEN_COMBOS}
            seasonFilter={seasonFilter}
            onOpenCombo={setSelected}
          />
          <div className="hidden lg:block w-px bg-[var(--border-primary)]" aria-hidden />
          <BookPanel
            side="right"
            panelId="volume-women"
            volumeLabel="Volume II · Women"
            kanji="淑"
            romaji="shukujo-hen"
            combos={WOMEN_COMBOS}
            seasonFilter={seasonFilter}
            onOpenCombo={setSelected}
          />
        </div>
      </motion.div>

      {/* Full palette reference */}
      <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="glass-card p-8">
        <div className="flex items-baseline justify-between gap-3 mb-6">
          <h2 className="type-heading text-[var(--text-primary)] tracking-tight">
            THE FULL PALETTE <span className="text-gradient-aurum">伝統色一覧</span>
          </h2>
          <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">
            {JAPANESE_COLORS.length} COLOURS
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-2">
          {JAPANESE_COLORS.map((c) => (
            <div
              key={c.id}
              className="group relative aspect-square rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--border-primary)_50%,transparent)] overflow-hidden"
              style={{ backgroundColor: c.hex }}
              title={`${c.name} · ${c.kanji}`}
            >
              <div
                className={`absolute inset-0 flex flex-col items-center justify-end pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/25`}
              >
                <span className="text-white text-[0.6rem] font-bold leading-tight text-center px-1 drop-shadow">
                  {c.name}
                </span>
                <span className="text-white/80 text-[0.5rem] font-mono">{c.hex.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <ComboModal combo={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
