"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalysisStore } from "@/store/analysis-store";
import {
  mapLandmark,
  drawAngleArc,
  drawMeasurementLine,
  drawSymmetryAxis,
  drawProportionGuide,
  type DrawPt,
} from "@/components/analysis/FaceSkeletonOverlay";
import { calculateSymmetryAxis, calculateFaceShape } from "@/lib/ml/face-geometry";

const PHASES = [
  { label: "FACE DETECTED", threshold: 12 },
  { label: "MAPPING 478 LANDMARKS", threshold: 28 },
  { label: "TRACING FEATURES", threshold: 45 },
  { label: "EXTRACTING GEOMETRY", threshold: 62 },
  { label: "SYMMETRY ANALYSIS", threshold: 75 },
  { label: "SCORING DOMAINS", threshold: 90 },
  { label: "COMPLETE", threshold: 100 },
];

const TOTAL_DURATION = 6;

const OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

const FEATURE_REGIONS = [
  {
    name: "left eye",
    color: "#E8C88A",
    indices: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  },
  {
    name: "right eye",
    color: "#E8C88A",
    indices: [263, 249, 390, 373, 374, 380, 381, 382, 398, 384, 385, 386, 387, 388, 466],
  },
  {
    name: "left brow",
    color: "#A0764E",
    indices: [46, 53, 52, 65, 55, 70, 63, 105, 66, 107],
  },
  {
    name: "right brow",
    color: "#A0764E",
    indices: [285, 295, 282, 283, 300, 293, 296, 336, 334, 263],
  },
  {
    name: "nose",
    color: "#8A5F3D",
    indices: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 98, 97, 326, 327],
  },
  {
    name: "mouth",
    color: "#CCA066",
    indices: [0, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267],
  },
];

function pt(
  lm: number[][],
  i: number,
  w: number,
  h: number,
  aspect?: number,
): DrawPt | null {
  const p = lm[i];
  if (!p) return null;
  return mapLandmark(p[0], p[1], w, h, aspect);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  scale: number,
) {
  const size = Math.max(9, Math.round(11 * scale));
  ctx.font = `600 ${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textBaseline = "bottom";
  ctx.lineWidth = Math.max(2, Math.round(3 * scale));
  ctx.strokeStyle = "rgba(0,0,0,0.65)";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x, y);
}

export function ProcessingCinematic() {
  const isAnalyzing = useAnalysisStore((s) => s.isAnalyzing);
  const progress = useAnalysisStore((s) => s.analysisProgress);
  const preview = useAnalysisStore((s) => s.processingPreview);
  const previewImage = preview?.image ?? null;
  const landmarks = useMemo(() => preview?.landmarks ?? [], [preview?.landmarks]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [imageAspect, setImageAspect] = useState<number | undefined>();
  const timerRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const [phaseProgress, setPhaseProgress] = useState(0);

  // Hold the screen on screen for at least TOTAL_DURATION even if the compute
  // finishes faster, so the scan is actually visible instead of blinking past
  // in a fraction of a second. `active` is the local truth (isAnalyzing | hold).
  const [active, setActive] = useState(false);
  const holdTimeoutRef = useRef<number | null>(null);

  const handleImageLoad = useCallback(() => {
    const img = containerRef.current?.querySelector("img");
    if (img && img.naturalWidth > 0) {
      setImageAspect(img.naturalWidth / img.naturalHeight);
      setDims({ w: img.clientWidth, h: img.clientHeight });
    }
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      if (holdTimeoutRef.current !== null) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }
      startTimeRef.current = null;
      timerRef.current = 0;
      setPhaseProgress(0);
      setDims(null);
      setImageAspect(undefined);
      setActive(true);
    } else if (active && holdTimeoutRef.current === null) {
      // Waiting for the minimum display time to elapse before hiding.
      let held = 0;
      if (startTimeRef.current !== null) {
        held = (performance.now() - startTimeRef.current) / 1000;
      }
      const remaining = Math.max(150, (TOTAL_DURATION - held) * 1000 + 150);
      holdTimeoutRef.current = window.setTimeout(() => {
        holdTimeoutRef.current = null;
        setActive(false);
      }, remaining);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnalyzing]);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = (now - startTimeRef.current) / 1000;
      timerRef.current = elapsed;
      const t = Math.min(1, elapsed / TOTAL_DURATION);
      setPhaseProgress(t);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, previewImage]);

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current !== null) clearTimeout(holdTimeoutRef.current);
    };
  }, []);

  const currentPhaseIdx = useMemo(
    () => PHASES.findIndex((p) => phaseProgress * 100 < p.threshold),
    [phaseProgress],
  );
  const activePhase = currentPhaseIdx >= 0 ? currentPhaseIdx : PHASES.length - 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dims || !active) return;
    const { w, h } = dims;
    if (w <= 0 || h <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = timerRef.current;
      const scale = Math.min(w, h) / 600;

      const tp = t / TOTAL_DURATION;

      // Phase 1 & 2: Landmark dot flood
      if (tp > 0.02 && landmarks.length >= 478) {
        const floodEnd = 0.28;
        const floodStart = 0.04;
        const floodT = Math.min(1, Math.max(0, (tp - floodStart) / (floodEnd - floodStart)));
        const dotCount = Math.floor(floodT * landmarks.length);

        for (let i = 0; i < dotCount; i++) {
          const p = pt(landmarks, i, w, h, imageAspect);
          if (!p) continue;
          const age = (dotCount - i) / landmarks.length;
          const r = 1.2 + age * 2.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232,200,138,${0.15 + age * 0.55})`;
          ctx.fill();
        }

        if (floodT > 0 && floodT < 1) {
          const scanY = h * floodT;
          const grad = ctx.createLinearGradient(0, scanY - 1, 0, scanY + 1);
          grad.addColorStop(0, "rgba(232,200,138,0)");
          grad.addColorStop(0.5, "rgba(232,200,138,0.85)");
          grad.addColorStop(1, "rgba(232,200,138,0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, scanY - 1, w, 2);
        }
      }

      // Phase 3: Feature path tracing
      if (tp > 0.14) {
        const traceStart = 0.14;
        const traceEnd = 0.48;
        const traceT = Math.min(1, Math.max(0, (tp - traceStart) / (traceEnd - traceStart)));

        // Oval first
        const ovalT = Math.min(1, traceT / 0.35);
        if (ovalT > 0 && landmarks.length >= 478) {
          const ovalPts: DrawPt[] = [];
          for (const idx of OVAL_INDICES) {
            const p = pt(landmarks, idx, w, h, imageAspect);
            if (p) ovalPts.push(p);
          }
          if (ovalPts.length > 2) {
            let totalLen = 0;
            for (let i = 1; i < ovalPts.length; i++)
              totalLen += Math.hypot(ovalPts[i].x - ovalPts[i - 1].x, ovalPts[i].y - ovalPts[i - 1].y);
            ctx.save();
            ctx.strokeStyle = "#C8963E";
            ctx.lineWidth = 1.8;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.shadowColor = "rgba(200,150,62,0.4)";
            ctx.shadowBlur = 4;
            ctx.setLineDash([totalLen, totalLen]);
            ctx.lineDashOffset = totalLen * (1 - ovalT);
            ctx.beginPath();
            ctx.moveTo(ovalPts[0].x, ovalPts[0].y);
            for (let i = 1; i < ovalPts.length; i++) ctx.lineTo(ovalPts[i].x, ovalPts[i].y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
            ctx.restore();
          }
        }

        // Other features
        const featuresT = Math.min(1, Math.max(0, (traceT - 0.35) / 0.65));
        if (featuresT > 0 && landmarks.length >= 478) {
          const regionDelay = 1 / FEATURE_REGIONS.length;
          for (let ri = 0; ri < FEATURE_REGIONS.length; ri++) {
            const region = FEATURE_REGIONS[ri];
            const regionT = Math.min(1, Math.max(0, (featuresT - ri * regionDelay) / regionDelay));
            if (regionT <= 0) continue;
            const pts: DrawPt[] = [];
            for (const idx of region.indices) {
              const p = pt(landmarks, idx, w, h, imageAspect);
              if (p) pts.push(p);
            }
            if (pts.length < 2) continue;
            let totalLen = 0;
            for (let i = 1; i < pts.length; i++)
              totalLen += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
            ctx.save();
            ctx.strokeStyle = region.color;
            ctx.lineWidth = 1.6;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.shadowColor = "rgba(200,150,62,0.25)";
            ctx.shadowBlur = 3;
            ctx.setLineDash([totalLen, totalLen]);
            ctx.lineDashOffset = totalLen * (1 - regionT);
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
            ctx.restore();
          }
        }
      }

      // Phase 4: Geometry extraction overlays
      if (tp > 0.28 && landmarks.length >= 478) {
        const geoStart = 0.28;
        const geoEnd = 0.65;
        const geoT = Math.min(1, Math.max(0, (tp - geoStart) / (geoEnd - geoStart)));

        // Jaw width
        const jawT = Math.min(1, geoT / 0.3);
        if (jawT > 0) {
          const left = pt(landmarks, 234, w, h, imageAspect);
          const right = pt(landmarks, 454, w, h, imageAspect);
          if (left && right) {
            ctx.globalAlpha = jawT;
            drawMeasurementLine(ctx, left, right, -14 * scale, "#E8C88A", "JAW WIDTH", scale);
            ctx.globalAlpha = 1;
          }
        }

        // Nose bridge
        const noseT = Math.min(1, Math.max(0, (geoT - 0.2) / 0.3));
        if (noseT > 0) {
          const bridge = pt(landmarks, 6, w, h, imageAspect);
          const tip = pt(landmarks, 1, w, h, imageAspect);
          if (bridge && tip) {
            ctx.globalAlpha = noseT;
            drawMeasurementLine(ctx, bridge, tip, 12 * scale, "#8A5F3D", "NOSE LENGTH", scale);
            ctx.globalAlpha = 1;
          }
        }

        // Vertical thirds
        const thirdsT = Math.min(1, Math.max(0, (geoT - 0.4) / 0.3));
        if (thirdsT > 0) {
          const hairline = pt(landmarks, 10, w, h, imageAspect);
          const chinPt = pt(landmarks, 152, w, h, imageAspect);
          const leftCheek = pt(landmarks, 234, w, h, imageAspect);
          const rightCheek = pt(landmarks, 454, w, h, imageAspect);
          if (hairline && chinPt && leftCheek && rightCheek) {
            ctx.globalAlpha = thirdsT * 0.6;
            drawProportionGuide(
              ctx,
              hairline.y,
              chinPt.y,
              leftCheek.x,
              rightCheek.x - leftCheek.x,
              "rgba(160,118,78,0.45)",
              scale,
            );
            ctx.globalAlpha = 1;
          }
        }

        // Gonial angle arcs at jaw corners
        const gonialT = Math.min(1, Math.max(0, (geoT - 0.6) / 0.4));
        if (gonialT > 0) {
          const leftJawTop = pt(landmarks, 172, w, h, imageAspect);
          const leftJawBot = pt(landmarks, 145, w, h, imageAspect);
          const leftJawVertex = pt(landmarks, 132, w, h, imageAspect);
          if (leftJawTop && leftJawBot && leftJawVertex) {
            ctx.globalAlpha = gonialT;
            drawAngleArc(ctx, leftJawVertex, leftJawTop, leftJawBot, 22 * scale, "#A0764E", undefined, scale);
            ctx.globalAlpha = 1;
          }
          const rightJawTop = pt(landmarks, 397, w, h, imageAspect);
          const rightJawBot = pt(landmarks, 374, w, h, imageAspect);
          const rightJawVertex = pt(landmarks, 356, w, h, imageAspect);
          if (rightJawTop && rightJawBot && rightJawVertex) {
            ctx.globalAlpha = gonialT;
            drawAngleArc(ctx, rightJawVertex, rightJawTop, rightJawBot, 22 * scale, "#A0764E", undefined, scale);
            ctx.globalAlpha = 1;
          }
        }
      }

      // Phase 5: Symmetry analysis
      if (tp > 0.50 && landmarks.length >= 478) {
        const symStart = 0.50;
        const symEnd = 0.78;
        const symT = Math.min(1, Math.max(0, (tp - symStart) / (symEnd - symStart)));

        const axisRaw = calculateSymmetryAxis(landmarks);
        if (axisRaw && symT > 0) {
          const a = mapLandmark(axisRaw.a.x, axisRaw.a.y, w, h, imageAspect);
          const b = mapLandmark(axisRaw.b.x, axisRaw.b.y, w, h, imageAspect);
          const dashLen = Math.hypot(b.x - a.x, b.y - a.y);
          ctx.save();
          ctx.strokeStyle = "rgba(200,150,62,0.45)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([dashLen, dashLen]);
          ctx.lineDashOffset = dashLen * (1 - symT);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          if (symT > 0.5) {
            const labelAlpha = (symT - 0.5) * 2;
            ctx.globalAlpha = labelAlpha;
            drawLabel(
              ctx,
              `AXIS ${axisRaw.angleDeg >= 0 ? "+" : ""}${axisRaw.angleDeg.toFixed(1)}°`,
              a.x + 10,
              a.y - 6,
              scale,
            );
            ctx.globalAlpha = 1;
          }
        }

        // Left/right flash — subtle alternating overlay
        if (symT > 0.3 && symT < 0.8) {
          const flashCycle = ((symT - 0.3) * 10) % 2;
          if (flashCycle < 1) {
            ctx.save();
            ctx.globalAlpha = 0.04;
            ctx.fillStyle = "#E8C88A";
            ctx.fillRect(0, 0, w / 2, h);
            ctx.restore();
          } else {
            ctx.save();
            ctx.globalAlpha = 0.04;
            ctx.fillStyle = "#E8C88A";
            ctx.fillRect(w / 2, 0, w / 2, h);
            ctx.restore();
          }
        }
      }

      // Dissolve: fade canvas content
      if (tp > 0.90) {
        const fadeT = (tp - 0.90) / 0.10;
        ctx.save();
        ctx.globalAlpha = fadeT * 0.95;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [dims, landmarks, imageAspect, active]);

  const hasLandmarks = landmarks.length >= 478;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="cinematic"
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 50% 40% at 50% 45%, rgba(232,200,138,0.04), transparent)",
            }}
          />

          {/* Face image — center stage */}
          {previewImage && (
            <div className="relative" style={{ maxHeight: "60vh", maxWidth: "90vw" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Analysis"
                onLoad={handleImageLoad}
                className="max-h-[60vh] max-w-[90vw] object-contain"
              />

              {/* Canvas overlay for dots, paths, measurements */}
              {dims && (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: dims.w, height: dims.h }}
                />
              )}

              {/* Corner brackets */}
              {previewImage && (
                <CornerBrackets progress={phaseProgress} />
              )}
            </div>
          )}

          {/* Phase label */}
          <motion.div
            className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 text-center"
            key={activePhase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="font-mono text-[0.65rem] tracking-[0.35em] text-[#E8C88A]">
              {PHASES[activePhase]?.label ?? "PROCESSING"}
            </p>
          </motion.div>

          {/* Domain score rings — appear during phase 6 */}
          {phaseProgress > 0.68 && (
            <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 flex gap-3">
              {(["proportion", "symmetry", "structure", "features", "quality"] as const).map(
                (domain, i) => (
                  <DomainRing
                    key={domain}
                    label={domain.slice(0, 4).toUpperCase()}
                    progress={Math.max(
                      0,
                      Math.min(1, (phaseProgress - 0.68 - i * 0.03) / 0.15),
                    )}
                  />
                ),
              )}
            </div>
          )}

          {/* Progress bar at very bottom */}
          <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #6B4C2A, #C8963E, #E8C88A)",
                boxShadow: "0 0 8px rgba(200,150,62,0.4)",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CornerBrackets({ progress }: { progress: number }) {
  const bracketSize = 28;
  const inset = 12;
  const opacity = progress < 0.92 ? 1 : Math.max(0, 1 - (progress - 0.92) / 0.08);
  if (opacity <= 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <div
        className="absolute border-t-2 border-l-2"
        style={{
          top: inset,
          left: inset,
          width: bracketSize,
          height: bracketSize,
          borderColor: "rgba(232,200,138,0.7)",
        }}
      />
      <div
        className="absolute border-t-2 border-r-2"
        style={{
          top: inset,
          right: inset,
          width: bracketSize,
          height: bracketSize,
          borderColor: "rgba(232,200,138,0.7)",
        }}
      />
      <div
        className="absolute border-b-2 border-l-2"
        style={{
          bottom: inset,
          left: inset,
          width: bracketSize,
          height: bracketSize,
          borderColor: "rgba(232,200,138,0.7)",
        }}
      />
      <div
        className="absolute border-b-2 border-r-2"
        style={{
          bottom: inset,
          right: inset,
          width: bracketSize,
          height: bracketSize,
          borderColor: "rgba(232,200,138,0.7)",
        }}
      />
    </div>
  );
}

function DomainRing({
  label,
  progress,
}: {
  label: string;
  progress: number;
}) {
  const circumference = 2 * Math.PI * 14;
  const offset = circumference * (1 - progress);
  const size = 38;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        className="-rotate-90"
      >
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2.5"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="#C8963E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: "drop-shadow(0 0 3px rgba(200,150,62,0.5))",
            transition: "stroke-dashoffset 0.4s ease-out",
          }}
        />
      </svg>
      <span className="font-mono text-[0.45rem] tracking-[0.2em] text-[#A0764E]">
        {label}
      </span>
    </div>
  );
}
