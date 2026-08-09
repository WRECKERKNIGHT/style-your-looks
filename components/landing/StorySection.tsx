"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const chapters = [
  {
    label: "CHAPTER I",
    title: "YOUR FACE IS YOUR FIRST LANGUAGE.",
    sub: "Before you speak a word, 478 tracked landmarks are already measuring proportion for you.",
    accent: "#8A5F3D",
    tint: "from-[#8A5F3D]/25",
  },
  {
    label: "CHAPTER II",
    title: "SYMMETRY IS HEARD BEFORE IT IS SEEN.",
    sub: "Golden ratios, harmony indices, proportions — mathematics has always dressed first.",
    accent: "#B98B56",
    tint: "from-[#B98B56]/20",
  },
  {
    label: "CHAPTER III",
    title: "STYLE IS A RATIO. FIT IS A DECLARATION.",
    sub: "Body typing turns silhouettes into physics. The right frame makes the outfit.",
    accent: "#C8963E",
    tint: "from-[#C8963E]/25",
  },
  {
    label: "CHAPTER IV",
    title: "PRIVACY IS THE NEW CHARM.",
    sub: "Every pixel is processed on your device. Your face never leaves your hands.",
    accent: "#6F4A30",
    tint: "from-[#6F4A30]/20",
  },
];

function ChapterWord({
  word,
  index,
  total,
  chapterProgress,
  accent,
}: {
  word: string;
  index: number;
  total: number;
  chapterProgress: MotionValue<number>;
  accent: string;
}) {
  const start = (index / total) * 0.45;
  const width = useTransform(
    chapterProgress,
    [start, start + 0.45 / total],
    ["0%", "100%"]
  );

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="text-[color-mix(in_srgb,var(--text-primary)_10%,transparent)]">{word}</span>
      <motion.span
        aria-hidden
        className="absolute top-0 left-0 overflow-hidden"
        style={{ width, color: accent, textShadow: `0 0 24px ${accent}44` }}
      >
        <span className="whitespace-nowrap">{word}</span>
      </motion.span>
    </span>
  );
}

function Chapter({
  chapter,
  index,
  total,
  scrollYProgress,
}: {
  chapter: (typeof chapters)[number];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const center = (start + end) / 2;

  const opacity = useTransform(
    scrollYProgress,
    [start, center - 0.03, center + 0.03, end],
    [0, 1, 1, 0]
  );
  const y = useTransform(scrollYProgress, [start, center, end], [48, 0, -48]);
  const chapterProgress = useTransform(
    scrollYProgress,
    [start, end],
    [0, 1]
  );
  const subOpacity = useTransform(chapterProgress, [0.12, 0.38], [0, 1]);
  const title = chapter.title.split(" ");

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center px-8 md:px-16 lg:px-24"
      style={{ opacity, y }}
    >
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-b ${chapter.tint} to-transparent opacity-60`}
      />
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="w-[110vmin] h-[110vmin] rounded-full opacity-25 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${chapter.accent}, transparent 70%)` }}
        />
      </div>
      <div
        aria-hidden
        className="absolute -bottom-10 -right-4 md:right-8 pointer-events-none select-none type-display leading-none text-[24vw] md:text-[17vw] font-bold opacity-[0.05]"
        style={{ color: chapter.accent }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <div
          className="flex items-center gap-4 mb-8"
          style={{ opacity: 1 }}
        >
          <div
            className="w-12 h-[2px]"
            style={{ background: chapter.accent }}
          />
          <span
            className="type-mono text-[0.65rem] tracking-[0.35em]"
            style={{ color: chapter.accent }}
          >
            {chapter.label}
          </span>
        </div>

        <h2 className="type-massive text-[var(--text-primary)] leading-[0.95] tracking-tight">
          {title.map((word, i) => (
            <span key={`${word}-${i}`}>
              <ChapterWord
                word={word}
                index={i}
                total={title.length}
                chapterProgress={chapterProgress}
                accent={chapter.accent}
              />
              {i < title.length - 1 && <span> </span>}
            </span>
          ))}
        </h2>

        <motion.p
          className="mt-10 text-[var(--text-secondary)] text-lg md:text-xl font-body leading-relaxed max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          style={{ opacity: subOpacity }}
        >
          {chapter.sub}
        </motion.p>
      </div>
    </motion.div>
  );
}

function ChapterDot({
  chapter,
  index,
  total,
  scrollYProgress,
}: {
  chapter: (typeof chapters)[number];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const active = useTransform(scrollYProgress, [start, end], [0, 1]);
  const color = useTransform(
    active,
    [0, 0.4],
    ["rgba(87, 58, 39, 0.2)", chapter.accent]
  );
  const scale = useTransform(active, [0, 0.4], [1, 1.6]);

  return (
    <motion.div
      className="w-2 h-2 rounded-full"
      style={{ backgroundColor: color, scale }}
    />
  );
}

export function StorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} className="relative h-[300vh] bg-cosmic-elevated">
      <div className="sticky top-0 h-screen overflow-hidden will-change-transform">
        <div className="absolute inset-0 grid-bg opacity-30" />

        {chapters.map((chapter, i) => (
          <Chapter
            key={chapter.label}
            chapter={chapter}
            index={i}
            total={chapters.length}
            scrollYProgress={scrollYProgress}
          />
        ))}

        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          {chapters.map((chapter, i) => (
            <div
              key={chapter.label}
              className="w-6 h-6 flex items-center justify-center"
            >
              <ChapterDot
                chapter={chapter}
                index={i}
                total={chapters.length}
                scrollYProgress={scrollYProgress}
              />
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-[color-mix(in_srgb,var(--text-muted)_18%,transparent)]">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-[#8A5F3D] via-[#B98B56] to-[#C8963E]"
            style={{ scaleX: scrollYProgress }}
          />
        </div>
      </div>
    </section>
  );
}
