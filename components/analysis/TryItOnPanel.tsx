"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Sparkles } from "lucide-react";
import { glassesPosition, hairRegion, toPixel } from "@/lib/ml/face-landmarks";

type Mode = "original" | "hair" | "glasses" | "glow";

const HAIR_STYLES = ["Volume Crop", "Side Part", "Slick Back"] as const;
const GLASSES_STYLES = ["Wayfarer", "Round", "Rectangle"] as const;

function HairOverlay({ style, landmarks, nw, nh }: { style: string; landmarks: number[][]; nw: number; nh: number }) {
  const r = hairRegion(landmarks, nw, nh);
  const top = r.topY - (style === "Volume Crop" ? r.faceHeight * 0.14 : style === "Slick Back" ? r.faceHeight * 0.02 : r.faceHeight * 0.1);
  const bottom = r.foreheadY + r.faceHeight * 0.12;
  const cx = r.centerX;
  const left = r.leftX - r.faceWidth * 0.1;
  const right = r.rightX + r.faceWidth * 0.1;

  let d = "";
  if (style === "Volume Crop") {
    d = `M ${left} ${bottom} C ${left} ${top + r.faceHeight * 0.05}, ${cx - r.faceWidth * 0.22} ${top}, ${cx} ${top} C ${cx + r.faceWidth * 0.22} ${top}, ${right} ${top + r.faceHeight * 0.05}, ${right} ${bottom} Z`;
  } else if (style === "Side Part") {
    const partX = cx + r.faceWidth * 0.08;
    d = `M ${left} ${bottom} C ${left} ${top + r.faceHeight * 0.18}, ${partX} ${top + r.faceHeight * 0.02}, ${partX} ${top + r.faceHeight * 0.02} C ${partX + r.faceWidth * 0.16} ${top + r.faceHeight * 0.12}, ${right} ${top + r.faceHeight * 0.2}, ${right} ${bottom} Z`;
  } else {
    d = `M ${left} ${bottom} C ${left} ${top + r.faceHeight * 0.22}, ${cx - r.faceWidth * 0.25} ${top + r.faceHeight * 0.06}, ${cx} ${top + r.faceHeight * 0.02} C ${cx + r.faceWidth * 0.25} ${top + r.faceHeight * 0.06}, ${right} ${top + r.faceHeight * 0.22}, ${right} ${bottom} Z`;
  }

  return (
    <path
      d={d}
      fill="rgba(36, 24, 18, 0.55)"
      stroke="#C8963E"
      strokeWidth={nw * 0.002}
      strokeDasharray={`${nw * 0.01} ${nw * 0.006}`}
      style={{ filter: "blur(0.5px)" }}
    />
  );
}

function GlassesOverlay({ style, landmarks, nw, nh }: { style: string; landmarks: number[][]; nw: number; nh: number }) {
  const g = glassesPosition(landmarks, nw, nh);
  const lensW = g.totalWidth * 0.24;
  const lensH = lensW * (style === "Rectangle" ? 0.62 : 0.8);
  const y = g.eyeY - lensH / 2;
  const sw = nw * 0.0035;
  const stroke = "#241812";
  const fill = "rgba(200,150,62,0.16)";

  const lens = (cx: number) =>
    style === "Round"
      ? `<rect x="${cx - lensW / 2}" y="${y}" width="${lensW}" height="${lensH}" rx="${lensW / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
      : style === "Rectangle"
        ? `<rect x="${cx - lensW / 2}" y="${y}" width="${lensW}" height="${lensH}" rx="${lensW * 0.08}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`
        : `<rect x="${cx - lensW / 2}" y="${y}" width="${lensW}" height="${lensH}" rx="${lensW * 0.18}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

  const left = g.leftEye.x;
  const right = g.rightEye.x;
  const bridgeY = y + lensH * 0.3;

  return (
    <g
      dangerouslySetInnerHTML={{
        __html: `
          ${lens(left)}
          ${lens(right)}
          <path d="M ${left + lensW / 2} ${bridgeY} Q ${g.centerX} ${bridgeY - lensH * 0.3} ${right - lensW / 2} ${bridgeY}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>
          <line x1="${left + lensW / 2}" y1="${g.eyeY}" x2="${left + lensW / 2 - g.totalWidth * 0.28}" y2="${g.eyeY - lensH * 0.15}" stroke="${stroke}" stroke-width="${sw}"/>
          <line x1="${right - lensW / 2}" y1="${g.eyeY}" x2="${right - lensW / 2 + g.totalWidth * 0.28}" y2="${g.eyeY - lensH * 0.15}" stroke="${stroke}" stroke-width="${sw}"/>
        `,
      }}
    />
  );
}

function GlowHighlights({ landmarks, nw, nh }: { landmarks: number[][]; nw: number; nh: number }) {
  const leftCheek = toPixel(landmarks, 234, nw, nh);
  const rightCheek = toPixel(landmarks, 454, nw, nh);
  const forehead = toPixel(landmarks, 10, nw, nh);
  const nose = toPixel(landmarks, 1, nw, nh);
  const spots = [
    { cx: leftCheek.x, cy: leftCheek.y, r: nw * 0.05 },
    { cx: rightCheek.x, cy: rightCheek.y, r: nw * 0.05 },
    { cx: forehead.x, cy: forehead.y, r: nw * 0.045 },
    { cx: nose.x, cy: nose.y, r: nw * 0.022 },
  ];
  return (
    <g>
      {spots.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="url(#glow-grad)"
          opacity={0.45}
        />
      ))}
    </g>
  );
}

export function TryItOnPanel({
  image,
  landmarks,
}: {
  image: string;
  landmarks: number[][];
}) {
  const [mode, setMode] = useState<Mode>("original");
  const [hairIdx, setHairIdx] = useState(0);
  const [glassesIdx, setGlassesIdx] = useState(0);
  const [glow, setGlow] = useState(65);
  const [natural, setNatural] = useState({ nw: 0, nh: 0 });

  const hasLandmarks = landmarks.length > 0 && natural.nw > 0;
  const { nw, nh } = natural;

  const filter =
    mode === "glow"
      ? `brightness(${1 + (glow - 50) / 130}) saturate(${1 + (glow - 50) / 90}) contrast(${1 + (glow - 50) / 160})`
      : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-primary)]">
        <span className="flex items-center gap-2 type-subhead text-sm text-[var(--text-primary)] tracking-wider">
          <ScanLine className="w-4 h-4 text-[var(--accent-aurum)]" />
          TRY IT ON
        </span>
        <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-widest">
          PREVIEW OVERLAYS
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-5 pt-4">
        {(["original", "hair", "glasses", "glow"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`border px-3 py-2 text-xs font-mono tracking-wider uppercase transition-all ${
              mode === m
                ? "border-aurum-500/70 bg-aurum-500/10 text-[var(--accent-aurum)]"
                : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-aurum-500/40"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="relative p-5">
        <div className="relative max-h-[480px] overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-base)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt="Try it on"
            className="w-full h-full max-h-[480px] object-contain"
            style={{ filter }}
            onLoad={(e) => {
              const el = e.currentTarget;
              setNatural({ nw: el.naturalWidth, nh: el.naturalHeight });
            }}
          />

          {hasLandmarks && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${nw} ${nh}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="glow-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF3D6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FFF3D6" stopOpacity="0" />
                </radialGradient>
              </defs>
              <AnimatePresence mode="wait">
                {mode === "hair" && (
                  <motion.g
                    key={`hair-${hairIdx}`}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <HairOverlay style={HAIR_STYLES[hairIdx]} landmarks={landmarks} nw={nw} nh={nh} />
                  </motion.g>
                )}
                {mode === "glasses" && (
                  <motion.g
                    key={`glasses-${glassesIdx}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <GlassesOverlay style={GLASSES_STYLES[glassesIdx]} landmarks={landmarks} nw={nw} nh={nh} />
                  </motion.g>
                )}
                {mode === "glow" && (
                  <motion.g key="glow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <GlowHighlights landmarks={landmarks} nw={nw} nh={nh} />
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>
          )}

          {mode !== "original" && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[0.6rem] font-mono tracking-widest text-aurum-300 uppercase">
              {mode === "hair" ? HAIR_STYLES[hairIdx] : mode === "glasses" ? GLASSES_STYLES[glassesIdx] : "Glow Up"}
            </div>
          )}
        </div>

        <AnimatePresence>
          {mode === "hair" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {HAIR_STYLES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setHairIdx(i)}
                  className={`px-3 py-1.5 text-xs font-mono tracking-wider border transition-all ${
                    hairIdx === i
                      ? "border-aurum-500/70 bg-aurum-500/10 text-[var(--accent-aurum)]"
                      : "border-[var(--border-primary)] text-[var(--text-muted)]"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </motion.div>
          )}
          {mode === "glasses" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {GLASSES_STYLES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setGlassesIdx(i)}
                  className={`px-3 py-1.5 text-xs font-mono tracking-wider border transition-all ${
                    glassesIdx === i
                      ? "border-aurum-500/70 bg-aurum-500/10 text-[var(--accent-aurum)]"
                      : "border-[var(--border-primary)] text-[var(--text-muted)]"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </motion.div>
          )}
          {mode === "glow" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-[0.6rem] font-mono tracking-widest text-[var(--text-muted)] uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-aurum)]" />
                  Glow-up intensity
                </span>
                <span className="text-[0.6rem] font-mono text-[var(--accent-aurum)]">{glow}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                value={glow}
                onChange={(e) => setGlow(Number(e.target.value))}
                className="w-full accent-[var(--accent-aurum)]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-[var(--text-muted)] font-body mt-4 leading-relaxed">
          Illustrative previews mapped to your detected face geometry — style recommendations only,
          not photo editing. Glow-up simulates the effect of skincare + good lighting over time.
        </p>
      </div>
    </motion.div>
  );
}
