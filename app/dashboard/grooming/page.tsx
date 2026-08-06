"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { BEARD_STYLES, MUSTACHE_STYLES } from "@/lib/constants";
import { initializeFaceLandmarker } from "@/lib/ml/face-analyzer";
import { drawFacialHair, detectHairColor, scoreGroomingStyles, type GroomingScore } from "@/lib/ml/facial-hair";
import { calculateFaceShape } from "@/lib/ml/face-geometry";
import { motion } from "framer-motion";
import { Scissors, Check, Star, Sparkles } from "lucide-react";
import { ScrollParallax, ScrollBlur, SectionScrollProgress } from "@/components/shared/ScrollEffects";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function GroomingPage() {
  const {
    uploadedImage,
    fullBodyImage,
    setUploadedImage,
    setFullBodyImage,
    selectedBeardStyle,
    setSelectedBeardStyle,
    selectedMustacheStyle,
    setSelectedMustacheStyle,
  } = useAnalysisStore();
  const currentPhoto = fullBodyImage ?? uploadedImage;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hairColor, setHairColor] = useState("#3C2A21");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faceResult, setFaceResult] = useState<any>(null);
  const [groomingScores, setGroomingScores] = useState<GroomingScore[]>([]);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const analyzePhoto = useCallback(async (imageData: string) => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    try {
      const img = new Image();
      img.onload = async () => {
        try {
          const landmarker = await initializeFaceLandmarker();
          const result = landmarker.detect(img);
          setFaceResult(result);
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const color = detectHairColor(canvas, result);
          setHairColor(color);
          const lm = result.faceLandmarks?.[0];
          const shape = lm
            ? calculateFaceShape(lm.map((l) => [l.x, l.y, l.z]))
            : useAnalysisStore.getState().faceResult?.facialShape;
          setFaceShape(shape ?? null);
          const scores = scoreGroomingStyles(shape);
          setGroomingScores(scores);
        } finally {
          setAnalysisComplete(true);
          setIsAnalyzing(false);
        }
      };
      img.onerror = () => { setAnalysisComplete(true); setIsAnalyzing(false); };
      img.src = imageData;
    } catch { setAnalysisComplete(true); setIsAnalyzing(false); }
  }, []);

  const handleImageUpload = useCallback((imageData: string) => {
    setUploadedImage(imageData);
    setFaceResult(null);
    analyzePhoto(imageData);
  }, [setUploadedImage, analyzePhoto]);

  useEffect(() => {
    if (currentPhoto && !faceResult && !isAnalyzing) {
      analyzePhoto(currentPhoto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhoto, faceResult]);

  useEffect(() => {
    if (!faceResult || !currentPhoto || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      if (selectedBeardStyle !== "clean-shaven") {
        drawFacialHair(ctx, faceResult, selectedBeardStyle, "beard", hairColor, 0.75, canvas.width, canvas.height);
      }
      if (selectedMustacheStyle !== "none") {
        drawFacialHair(ctx, faceResult, selectedMustacheStyle, "mustache", hairColor, 0.8, canvas.width, canvas.height);
      }
    };
    img.src = currentPhoto;
  }, [faceResult, currentPhoto, selectedBeardStyle, selectedMustacheStyle, hairColor]);

  return (
    <div className="space-y-8">
      <SectionScrollProgress />
      <ScrollParallax speed={0.12} distance={30}>
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // GROOMING</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Scissors className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            GROOMING <span className="text-gradient-aurum">STUDIO.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Try different beard and mustache styles virtually on your photo.
        </p>
      </motion.div>
      </ScrollParallax>

      {!currentPhoto ? (
        <div className="glass-card p-8">
          <ImageUploader onImageUpload={handleImageUpload} label="Upload a face photo for grooming preview" accept="face" />
        </div>
      ) : (
        <ScrollBlur blur={0} minOpacity={0.9}>
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
          <div className="glass-card overflow-hidden relative">
            {isAnalyzing && (
              <div className="absolute inset-0 glass-card backdrop-blur-sm flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="spinner mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-muted)] font-body">DETECTING FACE...</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="w-full max-h-[560px] object-contain" />
          </div>

          <div className="glass-card p-8">
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-4">HAIR COLOR</h3>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
                className="w-14 h-14 border border-[var(--border-primary)] cursor-pointer"
              />
              <span className="text-base text-[var(--text-muted)] font-body">
                Auto-detected: <span className="text-[var(--text-primary)] font-bold">{hairColor}</span>
              </span>
            </div>
          </div>

          {groomingScores.length > 0 && (
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">RECOMMENDED FOR YOUR FACE</h3>
                {faceShape && (
                  <span className="inline-flex items-center px-2.5 py-1 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[0.6rem] font-mono tracking-widest text-[var(--text-muted)]">
                    {faceShape.toUpperCase()} FACE · DETECTED FROM THIS PHOTO
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {groomingScores.filter((s) => s.type === "beard").slice(0, 3).map((rec) => (
                  <div
                    key={rec.styleId}
                    className={`p-5 border transition-all cursor-pointer ${
                      selectedBeardStyle === rec.styleId
                        ? "bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
                        : "bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_30%,transparent)]"
                    }`}
                    onClick={() => setSelectedBeardStyle(rec.styleId)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[var(--accent-aurum)]" />
                        <span className="font-display font-bold text-[var(--text-primary)]">
                          {BEARD_STYLES.find((s) => s.id === rec.styleId)?.label}
                        </span>
                      </div>
                      <span className={`text-sm font-mono font-bold ${rec.score >= 9 ? "text-[var(--accent-aurum)]" : rec.score >= 7 ? "text-[var(--accent-nexus)]" : "text-[var(--text-muted)]"}`}>
                        {rec.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-body ml-6">{rec.reason}</p>
                  </div>
                ))}
                {groomingScores.filter((s) => s.type === "mustache").slice(0, 2).map((rec) => (
                  <div
                    key={rec.styleId}
                    className={`p-5 border transition-all cursor-pointer ${
                      selectedMustacheStyle === rec.styleId
                        ? "bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
                        : "bg-[var(--bg-tertiary)] border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_30%,transparent)]"
                    }`}
                    onClick={() => setSelectedMustacheStyle(rec.styleId)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[var(--accent-aurum)]" />
                        <span className="font-display font-bold text-[var(--text-primary)]">
                          {MUSTACHE_STYLES.find((s) => s.id === rec.styleId)?.label}
                        </span>
                      </div>
                      <span className={`text-sm font-mono font-bold ${rec.score >= 9 ? "text-[var(--accent-aurum)]" : rec.score >= 7 ? "text-[var(--accent-nexus)]" : "text-[var(--text-muted)]"}`}>
                        {rec.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] font-body ml-6">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisComplete && groomingScores.length === 0 && (
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">NO FACE DETECTED</h3>
              </div>
              <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed max-w-2xl">
                We could not detect a face in this photo, so beard and mustache recommendations are unavailable. Upload a clear, front-facing photo with good lighting.
              </p>
            </div>
          )}

          <div className="glass-card p-8">
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-5">BEARD STYLE</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {BEARD_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedBeardStyle(style.id)}
                  className={`p-4 text-left text-base font-body transition-all duration-300 ${
                    selectedBeardStyle === style.id
                      ? "btn-nexus justify-center"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--bg-tertiary)_50%,transparent)] border border-[var(--border-primary)] card-nexus"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedBeardStyle === style.id && <Check className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{style.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-5">MUSTACHE STYLE</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {MUSTACHE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedMustacheStyle(style.id)}
                  className={`p-4 text-left text-base font-body transition-all duration-300 ${
                    selectedMustacheStyle === style.id
                      ? "btn-nexus justify-center"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--bg-tertiary)_50%,transparent)] border border-[var(--border-primary)] card-nexus"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedMustacheStyle === style.id && <Check className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{style.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <GroomingGuide selectedBeardStyle={selectedBeardStyle} />

          <button
            onClick={() => { useAnalysisStore.getState().setUploadedImage(null); useAnalysisStore.getState().setFullBodyImage(null); setFaceResult(null); }}
            className="btn-outline w-full justify-center"
          >
            Upload New Photo
          </button>
        </motion.div>
        </ScrollBlur>
      )}
    </div>
  );
}

const STYLE_LENGTH_MM: Record<string, number> = {
  "clean-shaven": 0,
  "stubble-short": 2,
  "stubble-medium": 4,
  "stubble-long": 6,
  "full-beard-short": 8,
  "full-beard-medium": 15,
  "full-beard-long": 30,
  goatee: 10,
  "circle-beard": 8,
  "van-dyke": 12,
  anchor: 10,
  balbo: 12,
  "mutton-chops": 18,
  "friendly-mutton-chops": 12,
  hulihee: 6,
};

const LINE_UP_ZONES = [
  {
    zone: "CHEEK LINE",
    rule: "Line up one finger-width above the jawline. Do not carve down onto the cheeks — a straight, soft line from sideburn to chin reads intentional.",
  },
  {
    zone: "NECK LINE",
    rule: "Two fingers above the Adam's apple. Scoop the line in a gentle U toward the ears — never carve a hard line across the neck.",
  },
  {
    zone: "SIDEBURNS",
    rule: "End at the top of the ear cartilage, tapered. Wider on square faces, thinner on round — it visually extends the jawline.",
  },
  {
    zone: "MUSTACHE LIP",
    rule: "Trim to a razor edge just above the upper lip. For handlebar styles, grow 4–6 weeks before first shape, then wax daily.",
  },
  {
    zone: "UNDER-CHIN",
    rule: "Shave upward toward the jawline in short strokes. This defines the neck taper that separates a beard from a neckbeard.",
  },
];

function GroomingGuide({ selectedBeardStyle }: { selectedBeardStyle: string }) {
  const [lengthMm, setLengthMm] = useState<number | null>(null);

  const recommended = STYLE_LENGTH_MM[selectedBeardStyle] ?? 0;
  const current = lengthMm ?? recommended;
  const mmPerWeek = 2.3;
  const weeks = current > 0 ? Math.max(1, Math.ceil(current / mmPerWeek)) : 0;

  const guardMap = [
    { label: "N°0 — BARE", max: 1 },
    { label: "N°1 — 3MM", max: 3.5 },
    { label: "N°2 — 6MM", max: 7 },
    { label: "N°3 — 10MM", max: 11 },
    { label: "N°4 — 16MM", max: 18 },
    { label: "FREE — 30MM", max: 30 },
  ];
  const guardIndex = guardMap.findIndex((g) => current <= g.max);

  return (
    <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-[var(--accent-aurum)]" />
          <h3 className="type-heading text-[var(--text-primary)] tracking-tight">LENGTH & GROWTH GUIDE</h3>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="type-label text-[var(--text-muted)]">TARGET LENGTH</span>
          <span className="type-mono text-[var(--accent-aurum)]">{current} MM</span>
        </div>
        <input
          type="range"
          min={0}
          max={30}
          value={current}
          onChange={(e) => setLengthMm(parseInt(e.target.value))}
          className="w-full h-1 accent-[var(--accent-aurum)]"
        />
        <div className="flex justify-between mt-1">
          {guardMap.map((g) => (
            <span key={g.label} className={`type-mono text-[0.45rem] tracking-widest ${current <= g.max ? "text-[var(--accent-aurum)]" : "text-[var(--text-muted)]/50"}`}>
              {g.label}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
            <span className="text-sm text-[var(--text-muted)] font-body">Guard equivalent</span>
            <span className="type-mono text-sm text-[var(--text-primary)]">{guardIndex >= 0 ? guardMap[guardIndex].label : "—"}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
            <span className="text-sm text-[var(--text-muted)] font-body">Weeks from clean-shaven</span>
            <span className="type-mono text-sm text-[var(--accent-aurum)]">{weeks > 0 ? `${weeks} WKS @ 2.3 MM/WK` : "—"}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
            <span className="text-sm text-[var(--text-muted)] font-body">Recommended for selected style</span>
            <span className="type-mono text-sm text-[var(--text-primary)]">{recommended} MM</span>
          </div>
        </div>

        <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-5">
          AVERAGE FACIAL HAIR GROWS ~2.3 MM/WEEK (12.7 MM/MONTH). FIRST SIX WEEKS OF FULL GROWTH = THE UNKEMPT WINDOW — TRIM THE NECK LINE WEEKLY DURING IT.
        </p>
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <Scissors className="w-5 h-5 text-[var(--accent-aurum)]" />
          <h3 className="type-heading text-[var(--text-primary)] tracking-tight">GROWTH DIRECTION MAP</h3>
        </div>
        <GrowthDirectionMap />
      </div>

      <div className="glass-card p-8 lg:col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <Check className="w-5 h-5 text-[var(--accent-aurum)]" />
          <h3 className="type-heading text-[var(--text-primary)] tracking-tight">LINE-UP GUIDE</h3>
        </div>
        <div className="space-y-4">
          {LINE_UP_ZONES.map((z) => (
            <div key={z.zone} className="flex gap-4 p-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
              <span className="type-mono text-[0.55rem] text-[var(--accent-aurum)] tracking-widest whitespace-nowrap pt-1">{z.zone}</span>
              <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed">{z.rule}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function GrowthDirectionMap() {
  const zones = [
    { label: "BROWS", x: 100, y: 60, dir: "out-up" },
    { label: "SIDEBURNS", x: 34, y: 110, dir: "down" },
    { label: "SIDEBURNS", x: 166, y: 110, dir: "down" },
    { label: "MUSTACHE", x: 100, y: 128, dir: "down" },
    { label: "CHEEKS", x: 44, y: 150, dir: "down" },
    { label: "CHEEKS", x: 156, y: 150, dir: "down" },
    { label: "CHIN", x: 100, y: 208, dir: "down" },
    { label: "NECK", x: 100, y: 240, dir: "up" },
  ];
  return (
    <svg viewBox="0 0 200 270" className="w-full max-w-[340px] mx-auto">
      <ellipse cx="100" cy="128" rx="64" ry="86" fill="none" stroke="var(--border-primary)" strokeWidth="1.5" />
      <path d="M40 88 Q 20 120 40 170" fill="none" stroke="var(--border-primary)" strokeWidth="1.5" />
      <path d="M160 88 Q 180 120 160 170" fill="none" stroke="var(--border-primary)" strokeWidth="1.5" />
      <path d="M64 220 Q 100 238 136 220" fill="none" stroke="var(--border-primary)" strokeWidth="1.5" strokeDasharray="3 3" />

      {zones.map((z, i) => {
        const a = z.dir === "up" ? -90 : z.dir === "down" ? 90 : z.dir === "out-up" ? (i % 2 === 0 ? -140 : -40) : 90;
        const rad = (a * Math.PI) / 180;
        const len = 10;
        const x2 = z.x + Math.cos(rad) * len;
        const y2 = z.y + Math.sin(rad) * len;
        const a2 = Math.atan2(z.y - y2, z.x - x2);
        return (
          <g key={i}>
            <line x1={z.x} y1={z.y} x2={x2} y2={y2} stroke="var(--accent-aurum)" strokeWidth="2" />
            <path
              d={`M ${x2} ${y2} L ${x2 + Math.cos(a2 + 0.5) * 5} ${y2 + Math.sin(a2 + 0.5) * 5} L ${x2 + Math.cos(a2 - 0.5) * 5} ${y2 + Math.sin(a2 - 0.5) * 5} Z`}
              fill="var(--accent-aurum)"
            />
            <circle cx={z.x} cy={z.y} r="1.6" fill="var(--accent-aurum)" />
          </g>
        );
      })}

      {zones.map((z, i) => (
        <g key={`l-${i}`}>
          <line x1={z.x} y1={z.y} x2={z.x + (z.x < 100 ? -18 : 18)} y2={z.y - 8} stroke="var(--text-muted)" strokeOpacity="0.4" strokeWidth="0.75" strokeDasharray="2 2" />
          <text x={z.x + (z.x < 100 ? -20 : 20)} y={z.y - 12} textAnchor={z.x < 100 ? "end" : "start"} fontSize="6.5" letterSpacing="1" fill="var(--text-muted)" fontFamily="monospace">
            {z.label}
          </text>
        </g>
      ))}
      <text x="100" y="14" textAnchor="middle" fontSize="6" letterSpacing="2" fill="var(--text-muted)" fontFamily="monospace">HAIR GROWS TOWARD ARROWS</text>
    </svg>
  );
}
