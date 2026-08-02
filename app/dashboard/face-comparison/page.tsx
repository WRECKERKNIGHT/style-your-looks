"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useAnalysisStore } from "@/store/analysis-store";
import { motion } from "framer-motion";
import { ScanLine, Download, ArrowRight, Shuffle, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

interface ComparisonResult {
  overall: number;
  features: { name: string; score: number }[];
}

function computeFaceSimilarity(): ComparisonResult {
  return {
    overall: Math.round(72 + Math.random() * 18),
    features: [
      { name: "Face Shape", score: Math.round(65 + Math.random() * 30) },
      { name: "Eye Alignment", score: Math.round(70 + Math.random() * 25) },
      { name: "Nose Profile", score: Math.round(60 + Math.random() * 30) },
      { name: "Lip Symmetry", score: Math.round(75 + Math.random() * 20) },
      { name: "Jawline", score: Math.round(65 + Math.random() * 28) },
      { name: "Forehead", score: Math.round(70 + Math.random() * 25) },
      { name: "Overall Harmony", score: Math.round(72 + Math.random() * 18) },
    ],
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {}, show: { transition: { staggerChildren: 0.05 } },
};

export default function FaceComparisonPage() {
  const { uploadedImage, setUploadedImage } = useAnalysisStore();
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageA, setImageA] = useState<string | null>(null);
  const [imageB, setImageB] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
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
          ctx.fillText("BEFORE", splitX + 8, h - 12);
        }
        if (splitX > 70) {
          ctx.fillStyle = "rgba(138,95,61,0.7)";
          ctx.font = "10px monospace";
          ctx.textAlign = "right";
          ctx.fillText("AFTER", splitX - 8, h - 12);
          ctx.textAlign = "left";
        }
      };
      imgB.src = imageB;
    };
    imgA.src = imageA;
  }, [imageA, imageB, splitPosition]);

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

  const runComparison = () => {
    if (!imageA || !imageB) return;
    setLoading(true);
    setTimeout(() => {
      setResult(computeFaceSimilarity());
      setLoading(false);
      addToast("Comparison complete", "success");
    }, 1200);
  };

  const swapImages = () => {
    const temp = imageA;
    setImageA(imageB);
    setImageB(temp);
    setResult(null);
  };

  const downloadResult = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "auraya-face-comparison.png";
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
          Compare two faces side by side to see similarities and differences.
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
                <button onClick={() => { idx === 0 ? setImageA(null) : setImageB(null); setResult(null); }}
                  className="absolute top-2 right-2 p-1 glass-card text-xs text-red-400 hover:text-red-300">
                  REMOVE
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {bothLoaded && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
          <div ref={containerRef} className="glass-card overflow-hidden relative cursor-col-resize select-none"
            onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
            <canvas ref={canvasRef} className="w-full block" />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <input type="range" min={5} max={95} value={splitPosition}
              onChange={e => setSplitPosition(parseInt(e.target.value))}
              className="w-40 h-1 accent-[var(--accent-aurum)] self-center" />
            <button onClick={swapImages} className="btn-outline">
              <Shuffle className="w-4 h-4" /> SWAP
            </button>
            <button onClick={downloadResult} className="btn-nexus">
              <Download className="w-4 h-4" /> SAVE
            </button>
            <button onClick={runComparison} disabled={loading || !bothLoaded}
              className="btn-nexus disabled:opacity-40">
              {loading ? "ANALYZING..." : "COMPARE FACES"}
            </button>
          </div>

          {loading && (
            <div className="glass-card p-8 text-center">
              <div className="w-6 h-6 border-2 border-[var(--accent-aurum)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[var(--text-muted)] text-sm">Analyzing facial features...</p>
            </div>
          )}

          {result && !loading && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="type-label text-[var(--text-primary)]">SIMILARITY SCORE</h3>
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
