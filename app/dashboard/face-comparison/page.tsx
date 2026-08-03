"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { motion } from "framer-motion";
import { ScanLine, Download, ArrowRight, Shuffle, Layers, AlertCircle } from "lucide-react";
import { useToast } from "@/components/shared/Toast";
import { initializeFaceLandmarker } from "@/lib/ml/face-analyzer";

interface FeatureScore {
  name: string;
  score: number;
  indices: number[];
}

interface ComparisonResult {
  overall: number;
  features: FeatureScore[];
}

const FEATURE_GROUPS: { name: string; indices: number[] }[] = [
  { name: "Face Shape", indices: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109] },
  { name: "Eye Alignment", indices: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 263, 249, 390, 373, 374, 380, 381, 382, 398, 384, 385, 386, 387, 388, 466] },
  { name: "Nose Profile", indices: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 98, 97, 326, 327, 49, 279, 220, 437] },
  { name: "Lip Symmetry", indices: [0, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191] },
  { name: "Jawline", indices: [127, 132, 234, 128, 129, 130, 131, 152, 356, 358, 359, 361, 368, 367, 366, 364, 365, 312, 206, 216, 210, 213, 213] },
  { name: "Forehead", indices: [9, 70, 63, 105, 66, 107, 336, 296, 334, 293, 108, 69, 67, 109, 10] },
  { name: "Overall Harmony", indices: [1, 33, 133, 263, 362, 61, 291, 152, 234, 454, 2, 10, 9, 13] },
];

async function detectLandmarks(dataUrl: string): Promise<number[][]> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Could not load the image"));
    img.src = dataUrl;
  });
  const landmarker = await initializeFaceLandmarker();
  const result = landmarker.detect(img);
  const lm = result.faceLandmarks?.[0];
  if (!lm) throw new Error("No face detected in one of the photos. Use front-facing, well-lit photos.");
  return lm.map((p) => [p.x, p.y, p.z ?? 0]);
}

function dist(a: number[], b: number[]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], (a[2] ?? 0) - (b[2] ?? 0));
}

function analyzeFeatureSimilarity(lmA: number[][], lmB: number[][], indices: number[]): number {
  const ptsA = indices.filter((i) => lmA[i] && lmB[i]).map((i) => lmA[i]);
  const ptsB = indices.filter((i) => lmA[i] && lmB[i]).map((i) => lmB[i]);
  if (ptsA.length < 5) return 0;

  const centroid = (pts: number[][]) =>
    pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]).map((v) => v / pts.length) as number[];

  const cA = centroid(ptsA);
  const cB = centroid(ptsB);

  const eyeDist = (lm: number[][]) =>
    lm[33] && lm[263] ? dist(lm[33], lm[263]) : 0;

  const scaleA = eyeDist(lmA) || 1;
  const scaleB = eyeDist(lmB) || 1;

  let totalDist = 0;
  let count = 0;
  for (let k = 0; k < ptsA.length; k++) {
    const dx = (ptsA[k][0] - cA[0]) / scaleA - (ptsB[k][0] - cB[0]) / scaleB;
    const dy = (ptsA[k][1] - cA[1]) / scaleA - (ptsB[k][1] - cB[1]) / scaleB;
    totalDist += Math.hypot(dx, dy);
    count++;
  }
  const avgDist = totalDist / count;
  const score = Math.max(0, Math.min(100, Math.round((1 - avgDist / 0.28) * 100)));
  return score;
}

function computeFaceSimilarity(lmA: number[][], lmB: number[][]): ComparisonResult {
  const features = FEATURE_GROUPS.map((g) => ({
    name: g.name,
    indices: g.indices,
    score: analyzeFeatureSimilarity(lmA, lmB, g.indices),
  }));
  const overall = Math.round(
    features.reduce((acc, f) => acc + f.score * (f.name === "Overall Harmony" ? 2 : 1), 0) /
      (features.length + 1)
  );
  return { overall, features };
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {}, show: { transition: { staggerChildren: 0.05 } },
};

export default function FaceComparisonPage() {
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splitPosition, setSplitPosition] = useState(50);
  const [showOverlay, setShowOverlay] = useState(false);
  const [landmarksA, setLandmarksA] = useState<number[][]>([]);
  const [landmarksB, setLandmarksB] = useState<number[][]>([]);
  const dragging = useRef(false);

  const renderComparison = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imageA || !imageB) return;
    const w = container.clientWidth;
    const h = Math.min(w * 0.7, 480);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const imgA = new Image();
    const imgB = new Image();
    imgA.onload = () => {
      imgB.onload = () => {
        const splitX = (splitPosition / 100) * w;

        ctx.drawImage(imgA, 0, 0, w, h);
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitX, 0, w - splitX, h);
        ctx.clip();
        ctx.drawImage(imgB, 0, 0, w, h);
        ctx.restore();

        if (showOverlay && landmarksA.length > 0 && landmarksB.length > 0) {
          const drawLm = (lm: number[][], color: string, alpha: number) => {
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            for (const p of lm) {
              ctx.beginPath();
              ctx.arc(p[0] * w, p[1] * h, 1.6, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.globalAlpha = 1;
          };
          drawLm(landmarksA, "#CCA066", 0.9);
          drawLm(landmarksB, "#7FD4D4", 0.9);
        }

        ctx.strokeStyle = "rgba(232,182,32,0.8)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, h);
        ctx.stroke();
        ctx.setLineDash([]);

        if (splitX + 60 < w) {
          ctx.fillStyle = "rgba(138,95,61,0.7)";
          ctx.font = "10px monospace";
          ctx.fillText("IMAGE A", splitX + 8, h - 12);
        }
        if (splitX > 70) {
          ctx.fillStyle = "rgba(138,95,61,0.7)";
          ctx.font = "10px monospace";
          ctx.textAlign = "right";
          ctx.fillText("IMAGE B", splitX - 8, h - 12);
          ctx.textAlign = "left";
        }
      };
      imgB.src = imageB;
    };
    imgA.src = imageA;
  }, [imageA, imageB, splitPosition, showOverlay, landmarksA, landmarksB]);

  useEffect(() => {
    renderComparison();
  }, [renderComparison]);

  const handleDragStart = useCallback(() => { dragging.current = true; }, []);
  const handleDragEnd = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const pos = ((clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.max(5, Math.min(95, pos)));
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [handleDragEnd]);

  const runComparison = async () => {
    if (!imageA || !imageB) return;
    setLoading(true);
    setError(null);
    try {
      const [lmA, lmB] = await Promise.all([detectLandmarks(imageA), detectLandmarks(imageB)]);
      setLandmarksA(lmA);
      setLandmarksB(lmB);
      setResult(computeFaceSimilarity(lmA, lmB));
      addToast("Comparison complete", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compare the faces. Try clearer photos.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const swapImages = () => {
    const temp = imageA;
    setImageA(imageB);
    setImageB(temp);
    setResult(null);
    setError(null);
  };

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "zervey-face-comparison.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    addToast("Comparison saved", "success");
  };

  const bothLoaded = imageA && imageB;

  return (
    <div className="space-y-8">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <span className="section-number">EST. MMXXIV // FACE COMPARISON</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <ScanLine className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            FACE <span className="text-gradient-aurum">COMPARISON.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">
          Compare two faces side by side. Scores are computed live from MediaPipe&apos;s 478-point landmark
          geometry after scale + position alignment — no random placeholders.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {([0, 1] as const).map(idx => (
          <motion.div key={idx} variants={fadeUp} initial="hidden" animate="show"
            className="glass-card p-4">
            <p className="type-label text-[var(--text-muted)] mb-3">{idx === 0 ? "IMAGE A" : "IMAGE B"}</p>
            {(!(idx === 0 ? imageA : imageB)) ? (
              <ImageUploader
                onImageUpload={(data) => idx === 0 ? setImageA(data) : setImageB(data)}
                label={`Upload ${idx === 0 ? "first" : "second"} photo`}
                accept="any" />
            ) : (
              <div className="relative">
                <img src={idx === 0 ? imageA! : imageB!} alt={`Face ${idx === 0 ? "A" : "B"}`}
                  className="w-full h-48 object-cover" />
                <button onClick={() => { idx === 0 ? setImageA(null) : setImageB(null); setResult(null); setError(null); }}
                  className="absolute top-2 right-2 p-1 glass-card text-xs text-red-400 hover:text-red-300">
                  REMOVE
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {error && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 p-5">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400 font-body">{error}</p>
        </motion.div>
      )}

      {bothLoaded && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
          <div ref={containerRef} className="glass-card overflow-hidden relative cursor-col-resize select-none"
            onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
            <canvas ref={canvasRef} className="w-full block" />
          </div>

          <div className="flex flex-wrap gap-3 justify-center items-center">
            <input type="range" min={5} max={95} value={splitPosition}
              onChange={e => setSplitPosition(parseInt(e.target.value))}
              className="w-40 h-1 accent-[var(--accent-aurum)] self-center" />
            <button onClick={swapImages} className="btn-outline">
              <Shuffle className="w-4 h-4" /> SWAP
            </button>
            <button onClick={downloadResult} className="btn-outline">
              <Download className="w-4 h-4" /> SAVE
            </button>
            <button
              onClick={() => setShowOverlay((v) => !v)}
              className={`btn-outline ${showOverlay ? "!border-[var(--accent-aurum)] !text-[var(--accent-aurum)]" : ""}`}
            >
              <Layers className="w-4 h-4" /> {showOverlay ? "HIDE" : "SHOW"} METRIC OVERLAY
            </button>
            <button onClick={runComparison} disabled={loading || !bothLoaded}
              className="btn-nexus disabled:opacity-40">
              {loading ? "ANALYZING..." : "COMPARE FACES"}
            </button>
          </div>

          {showOverlay && (
            <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest text-center">
              GOLD = IMAGE A LANDMARKS · TEAL = IMAGE B LANDMARKS · ALIGNED BY CENTROID + INTEROCULAR SCALE
            </p>
          )}

          {loading && (
            <div className="glass-card p-8 text-center">
              <div className="w-6 h-6 border-2 border-[var(--accent-aurum)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[var(--text-muted)] text-sm">Mapping 478 facial landmarks on both faces...</p>
            </div>
          )}

          {result && !loading && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="type-label text-[var(--text-primary)]">OVERALL GEOMETRY SIMILARITY</h3>
                <span className="type-display text-2xl text-[var(--accent-aurum)]">{result.overall}%</span>
              </div>
              <div className="space-y-2">
                {result.features.map(f => (
                  <motion.div key={f.name} variants={fadeUp}
                    className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">{f.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1 bg-[var(--bg-tertiary)] overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[var(--accent-nexus)] to-[var(--accent-aurum)]" style={{ width: `${f.score}%` }} />
                      </div>
                      <span className="type-mono text-[var(--accent-aurum)] w-8 text-right">{f.score}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-widest mt-5">
                LANDMARK ALIGNMENT: CENTROID TRANSLATION + INTEROCULAR-DISTANCE SCALING (PROCRUSTES-STYLE) · SENSITIVE TO POSE & EXPRESSION
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {bothLoaded && (
        <div className="flex gap-4">
          <Link href="/dashboard/history" className="btn-outline flex-1 justify-center">
            HISTORY <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/dashboard/profile" className="btn-nexus flex-1 justify-center">
            PROFILE <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
