"use client";

import { useState, useEffect } from "react";
import { useAnalysisStore } from "@/store/analysis-store";
import { ScoreGauge } from "@/components/analysis/ScoreGauge";
import { motion } from "framer-motion";
import { getScoreTrends, type ScoreTrendPoint } from "@/lib/history";
import {
  Dna,
  ScanFace,
  Layers,
  Droplets,
  Crown,
  Palette,
  Shirt,
  TrendingUp,
  Sparkles,
  BarChart3,
  Download,
  Share2,
} from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ScoreTrendChart({ trends }: { trends: ScoreTrendPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const metrics = [
    { key: "overall" as const, label: "Overall", color: "var(--accent-aurum)" },
    { key: "symmetry" as const, label: "Symmetry", color: "var(--accent-nexus)" },
    { key: "goldenRatio" as const, label: "Golden Ratio", color: "#A0764E" },
    { key: "harmony" as const, label: "Harmony", color: "#8A5F3D" },
  ];

  const w = 560;
  const h = 200;
  const pad = { top: 10, right: 20, bottom: 30, left: 30 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const toPath = (values: number[]) => {
    if (values.length < 2) return "";
    return values
      .map((v, i) => {
        const x = pad.left + (i / (values.length - 1)) * plotW;
        const y = pad.top + plotH - (v / 10) * plotH;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[560px]">
        {[0, 2, 4, 6, 8, 10].map((v) => {
          const y = pad.top + plotH - (v / 10) * plotH;
          return (
            <g key={v}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="var(--border-muted)" strokeWidth="1" />
              <text x={pad.left - 4} y={y + 3} textAnchor="end" fill="var(--text-muted)" fontSize="8" fontFamily="JetBrains Mono">{v}</text>
            </g>
          );
        })}

        {metrics.map((m) => {
          const values = trends.map((t) => t[m.key]);
          return (
            <path
              key={m.key}
              d={toPath(values)}
              fill="none"
              stroke={m.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {trends.map((t, i) => {
          const x = pad.left + (i / (trends.length - 1)) * plotW;
          return metrics.map((m) => {
            const y = pad.top + plotH - (t[m.key] / 10) * plotH;
            return (
              <circle
                key={`${m.key}-${i}`}
                cx={x}
                cy={y}
                r={hoveredIdx === i ? 4 : 2.5}
                fill={m.color}
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          });
        })}

        {hoveredIdx !== null && (
          <g>
            <line
              x1={pad.left + (hoveredIdx / (trends.length - 1)) * plotW}
              y1={pad.top}
              x2={pad.left + (hoveredIdx / (trends.length - 1)) * plotW}
              y2={pad.top + plotH}
              stroke="var(--accent-aurum)"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity={0.5}
            />
            <text
              x={pad.left + (hoveredIdx / (trends.length - 1)) * plotW}
              y={h - 5}
              textAnchor="middle"
              fill="var(--text-primary)"
              fontSize="8"
              fontFamily="JetBrains Mono"
            >
              {trends[hoveredIdx].date.split(",")[0]}
            </text>
          </g>
        )}
      </svg>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {metrics.map((m) => (
          <div key={m.key} className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="text-xs font-body text-[var(--text-muted)]">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  let color = "bg-[color-mix(in_srgb,var(--accent-aurum)_15%,transparent)] text-[var(--accent-aurum)] border-[color-mix(in_srgb,var(--accent-aurum)_30%,transparent)]";
  if (score >= 8) color = "bg-[color-mix(in_srgb,var(--accent-aurum)_20%,transparent)] text-[var(--accent-aurum)] border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]";
  else if (score >= 6) color = "bg-[color-mix(in_srgb,var(--accent-nexus)_15%,transparent)] text-[var(--accent-nexus)] border-[color-mix(in_srgb,var(--accent-nexus)_30%,transparent)]";
  else if (score < 5) color = "bg-purple-500/15 text-purple-400 border-purple-500/30";

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full ${color}`}>
      <span className="text-xs font-body">{label}</span>
      <span className="text-sm font-display font-bold">{score.toFixed(1)}</span>
    </div>
  );
}

export default function StyleDnaPage() {
  const { faceResult, bodyResult, colorAnalysis } = useAnalysisStore();
  const [trends, setTrends] = useState<ScoreTrendPoint[]>([]);

  useEffect(() => {
    setTrends(getScoreTrends());
  }, []);

  const hasData = faceResult || bodyResult;

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // STYLE DNA</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Dna className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">
            STYLE <span className="text-gradient-aurum">DNA.</span>
          </h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl leading-relaxed">
          Your comprehensive profile combining facial analysis, body proportions,
          skin tone, and seasonal color classification into one unified style identity.
        </p>
      </div>

      {!hasData && (
        <div className="glass-card p-12 text-center">
          <Dna className="w-12 h-12 text-[color-mix(in_srgb,var(--text-muted)_40%,transparent)] mx-auto mb-4" />
          <h3 className="type-heading text-[var(--text-primary)] mb-2">NO ANALYSIS DATA YET</h3>
          <p className="text-[var(--text-muted)] font-body max-w-md mx-auto">
            Run a face analysis and body analysis first. Your Style DNA will be automatically generated from the combined results.
          </p>
        </div>
      )}

      {hasData && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
          <motion.div variants={fadeUp} className="glass-card p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[color-mix(in_srgb,var(--accent-nexus)_5%,transparent)] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">YOUR STYLE IDENTITY</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-tertiary)] p-6 border border-[var(--border-primary)] text-center card-nexus">
                  <ScanFace className="w-8 h-8 text-[var(--accent-aurum)] mx-auto mb-3" />
                  <span className="type-label text-[var(--text-muted)]">Face Profile</span>
                  <p className="font-display font-bold text-[var(--text-primary)] text-xl mt-1">{faceResult?.styleProfile || "—"}</p>
                  <p className="text-sm text-[var(--text-muted)] font-body mt-1">{faceResult?.facialShape} shape</p>
                </div>
                <div className="bg-[var(--bg-tertiary)] p-6 border border-[var(--border-primary)] text-center card-nexus">
                  <Layers className="w-8 h-8 text-[var(--accent-aurum)] mx-auto mb-3" />
                  <span className="type-label text-[var(--text-muted)]">Body Profile</span>
                  <p className="font-display font-bold text-[var(--text-primary)] text-xl mt-1">{bodyResult?.bodyType || "—"}</p>
                  <p className="text-sm text-[var(--text-muted)] font-body mt-1">{bodyResult?.shoulderToWaistRatio ? `SWR ${bodyResult.shoulderToWaistRatio}` : "Awaiting scan"}</p>
                </div>
                <div className="bg-[var(--bg-tertiary)] p-6 border border-[var(--border-primary)] text-center card-nexus">
                  <Palette className="w-8 h-8 text-[var(--accent-aurum)] mx-auto mb-3" />
                  <span className="type-label text-[var(--text-muted)]">Color Season</span>
                  <p className="font-display font-bold text-[var(--text-primary)] text-xl mt-1">{colorAnalysis?.subType || faceResult?.undertone || "—"}</p>
                  <p className="text-sm text-[var(--text-muted)] font-body mt-1">{colorAnalysis?.metalPreference ? `${colorAnalysis.metalPreference} metals` : "Awaiting scan"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {faceResult && (
            <motion.div variants={fadeUp} className="glass-card p-10">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">COMPOSITE SCORES</h3>
              </div>
              <div className="flex flex-wrap justify-center gap-10">
                <ScoreGauge score={faceResult.overallScore} size="md" label="Face IQ" />
                <ScoreGauge score={faceResult.facialHarmony} size="md" label="Facial Harmony" />
                {bodyResult?.bodyProportionScore && (
                  <ScoreGauge score={bodyResult.bodyProportionScore} size="md" label="Body Proportion" />
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <ScoreBadge label="Symmetry" score={faceResult.symmetry} />
                <ScoreBadge label="Golden Ratio" score={faceResult.goldenRatio} />
                <ScoreBadge label="Jawline" score={faceResult.jawline} />
                <ScoreBadge label="Skin" score={faceResult.skinClarity} />
                <ScoreBadge label="Harmony" score={faceResult.facialHarmony} />
                {bodyResult?.bodyProportionScore && (
                  <ScoreBadge label="Body" score={bodyResult.bodyProportionScore} />
                )}
              </div>
            </motion.div>
          )}

          {faceResult && trends.length >= 2 && (
            <motion.div variants={fadeUp} className="glass-card p-10">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">SCORE PROGRESS</h3>
              </div>
              <p className="text-[var(--text-muted)] font-body text-sm mb-6">Tracking your analysis scores across {trends.length} sessions. Hover for details.</p>
              <ScoreTrendChart trends={trends} />
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-[var(--accent-aurum)]" />
              <h3 className="type-heading text-[var(--text-primary)] tracking-tight">STYLE RECOMMENDATIONS</h3>
            </div>
            <p className="text-[var(--text-muted)] font-body text-sm mb-8">
              Based on your {faceResult?.styleProfile || "unique"} facial profile, {bodyResult?.bodyType || "individual"} body type, and {faceResult?.undertone || "natural"} coloring.
            </p>
            <div className="space-y-5">
              {faceResult?.styleProfile === "Rugged Elegance" && (
                <><StyleRec icon={<Shirt className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Wardrobe Direction" text="Lean into structured pieces with rich textures. Leather jackets, tailored blazers, and quality knits. Avoid overly trendy pieces — your features carry classic well." /><StyleRec icon={<Palette className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Power Colors" text="Navy, burgundy, forest green, camel, and charcoal. These ground your strong features without competing." /></>
              )}
              {faceResult?.styleProfile === "Classic Handsome" && (
                <><StyleRec icon={<Shirt className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Wardrobe Direction" text="Your balanced features suit timeless silhouettes. Invest in well-fitted essentials: Oxford shirts, chinos, leather belts, and clean sneakers." /><StyleRec icon={<Palette className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Power Colors" text="Your symmetry means you can wear a wide range. Anchor with navy and white, accent with your seasonal palette." /></>
              )}
              {faceResult?.styleProfile === "Editorial Sharp" && (
                <><StyleRec icon={<Shirt className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Wardrobe Direction" text="Your angular features read editorial. Experiment with monochrome outfits, structured outerwear, and fashion-forward silhouettes." /><StyleRec icon={<Palette className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Power Colors" text="Black, white, and grey as your base. Add accent colors from your seasonal palette for visual interest." /></>
              )}
              {!["Rugged Elegance", "Classic Handsome", "Editorial Sharp"].includes(faceResult?.styleProfile || "") && (
                <><StyleRec icon={<Shirt className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Wardrobe Direction" text="Your unique facial profile gives you versatility. Build a wardrobe of quality basics and let your features do the talking." /><StyleRec icon={<Palette className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Power Colors" text={`${faceResult?.undertone || "Natural"} palette tones will be most flattering. Use the Color Analysis page for specific recommendations.`} /></>
              )}

              {bodyResult?.bodyType === "Inverted Triangle" && (<StyleRec icon={<Layers className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Body Styling" text="Your broader shoulders are an asset. V-neck tees and well-fitted tops highlight your V-taper. Avoid excessive shoulder padding." />)}
              {bodyResult?.bodyType === "Rectangle" && (<StyleRec icon={<Layers className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Body Styling" text="Create visual dimension with layering. Structured jackets add shoulder definition. Tapered trousers create a more dynamic silhouette." />)}
              {bodyResult?.bodyType === "Oval" && (<StyleRec icon={<Layers className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Body Styling" text="Vertical lines and structured fabrics create a leaner silhouette. Well-fitted (not tight) pieces are your friend. Monochrome outfits elongate." />)}
              {bodyResult?.bodyType === "Hourglass" && (<StyleRec icon={<Layers className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Body Styling" text="Your balanced proportions suit fitted silhouettes. Define your waist with belts and tailored pieces. Avoid boxy, oversized tops." />)}

              {faceResult?.skinClarity && faceResult.skinClarity < 6 && (<StyleRec icon={<Droplets className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Skincare Priority" text="Invest in a consistent skincare routine. A simple 4-step system (cleanse, treat, moisturize, SPF) will noticeably improve your appearance within 4-6 weeks." />)}

              {colorAnalysis && (<StyleRec icon={<Palette className="w-5 h-5 text-[var(--accent-aurum)]" />} title="Metal & Accessories" text={`Stick to ${colorAnalysis.metalPreference.toLowerCase()} metals for watches, rings, and belt buckles. ${colorAnalysis.patternRecommendation} will complement your coloring.`} />)}
            </div>
          </motion.div>

          {faceResult && (
            <motion.div variants={fadeUp} className="glass-card p-10">
              <div className="flex items-center gap-3 mb-6">
                <ScanFace className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">FULL FACE METRICS</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <MetricTile label="Symmetry" score={faceResult.symmetry} />
                <MetricTile label="Golden Ratio" score={faceResult.goldenRatio} />
                <MetricTile label="Jawline" score={faceResult.jawline} />
                <MetricTile label="Proportions" score={faceResult.proportions} />
                <MetricTile label="Skin Clarity" score={faceResult.skinClarity} />
                <MetricTile label="Eye Spacing" score={faceResult.eyeSpacing} />
                <MetricTile label="Cheekbone" score={faceResult.cheekboneDefinition} />
                <MetricTile label="Lip Proportion" score={faceResult.lipFullness} />
                <MetricTile label="Nose Profile" score={faceResult.noseProfile} />
                <MetricTile label="Forehead Balance" score={faceResult.foreheadBalance} />
                <MetricTile label="Facial Harmony" score={faceResult.facialHarmony} />
                <MetricTile label="Overall" score={faceResult.overallScore} />
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="glass-card p-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-heading text-[var(--text-primary)] tracking-tight">SHARE YOUR REPORT</h3>
              </div>
            </div>
            <p className="text-[var(--text-muted)] font-body text-sm mb-6">Generate a comprehensive style report card to share or save.</p>
            <button onClick={() => generateReport(faceResult, bodyResult, colorAnalysis)} className="btn-nexus">
              <Download className="w-4 h-4" />
              GENERATE REPORT CARD
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function generateReport(face: any, body: any, color: any) {
  const w = 640;
  const h = 900;
  const faceMetrics = face ? [
    { label: "Overall", score: face.overallScore },
    { label: "Symmetry", score: face.symmetry },
    { label: "Golden Ratio", score: face.goldenRatio },
    { label: "Jawline", score: face.jawline },
    { label: "Skin", score: face.skinClarity },
    { label: "Harmony", score: face.facialHarmony },
  ] : [];
  const bodyMetrics = body ? [
    { label: "Body Type", value: body.bodyType },
    { label: "Shoulder-Waist", value: body.shoulderToWaistRatio?.toFixed(2) || "—" },
    { label: "Undertone", value: body.undertone },
  ] : [];
  const barY = 160;
  const barH = 14;
  const barMaxW = 200;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("width", `${w}`);
  svg.setAttribute("height", `${h}`);

  svg.innerHTML = `
    <rect width="${w}" height="${h}" fill="#241812"/>
    <rect width="${w}" height="8" fill="#8A5F3D"/>
    <text x="${w/2}" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#C9B18C" letter-spacing="4">N E X A R I</text>
    <text x="${w/2}" y="68" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#F3EAD9" font-weight="bold">Style Analysis Report</text>
    <text x="${w/2}" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#C8963E">${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</text>
    <line x1="40" y1="100" x2="${w-40}" y2="100" stroke="#8A5F3D" stroke-width="1"/>

    ${face ? `
      <text x="40" y="125" font-family="Arial, sans-serif" font-size="14" fill="#F3EAD9" font-weight="bold">FACE ANALYSIS</text>
      <text x="40" y="145" font-family="Arial, sans-serif" font-size="10" fill="#C9B18C">${face.facialShape} Shape · ${face.styleProfile} · ${face.overallRating}</text>
      ${faceMetrics.map((m, i) => `
        <text x="40" y="${barY + i * 32}" font-family="Arial, sans-serif" font-size="10" fill="#C9B18C">${m.label}</text>
        <rect x="130" y="${barY + i * 32 - 10}" width="${(m.score / 10) * barMaxW}" height="${barH}" rx="3" fill="${m.score >= 7 ? 'var(--accent-nexus)' : m.score >= 5 ? 'var(--accent-aurum)' : '#A13B2F'}"/>
        <text x="${135 + (m.score / 10) * barMaxW}" y="${barY + i * 32}" font-family="monospace" font-size="10" fill="#F3EAD9" font-weight="bold">${m.score.toFixed(1)}</text>
      `).join("")}
    ` : ""}

    ${body ? `
      <text x="40" y="${barY + faceMetrics.length * 32 + 30}" font-family="Arial, sans-serif" font-size="14" fill="#F3EAD9" font-weight="bold">BODY ANALYSIS</text>
      ${bodyMetrics.map((m, i) => `
        <text x="40" y="${barY + faceMetrics.length * 32 + 55 + i * 24}" font-family="Arial, sans-serif" font-size="10" fill="#C9B18C">${m.label}:</text>
        <text x="180" y="${barY + faceMetrics.length * 32 + 55 + i * 24}" font-family="Arial, sans-serif" font-size="11" fill="#F3EAD9" font-weight="bold">${m.value}</text>
      `).join("")}
    ` : ""}

    ${color ? `
      <text x="40" y="${h - 180}" font-family="Arial, sans-serif" font-size="14" fill="#F3EAD9" font-weight="bold">COLOR PALETTE</text>
      <text x="40" y="${h - 160}" font-family="Arial, sans-serif" font-size="10" fill="#C9B18C">${color.subType} · ${color.metalPreference} Metals</text>
      ${color.bestColors.slice(0, 8).map((c: string, i: number) => `<rect x="${40 + i * 65}" y="${h - 145}" width="55" height="30" rx="4" fill="${c}" stroke="#8A5F3D" stroke-width="1"/>`).join("")}
      ${color.bestColors.slice(0, 8).map((c: string, i: number) => `<text x="${67 + i * 65}" y="${h - 125}" text-anchor="middle" font-family="monospace" font-size="7" fill="#F3EAD9">${c}</text>`).join("")}
    ` : ""}

    <line x1="40" y1="${h - 80}" x2="${w-40}" y2="${h - 80}" stroke="#8A5F3D" stroke-width="1"/>
    <text x="${w/2}" y="${h - 55}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#C8963E">Generated by NEXARI</text>
    <text x="${w/2}" y="${h - 40}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#C8963E">nexari.app</text>
  `;

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const canvas = document.createElement("canvas");
  canvas.width = w * 2;
  canvas.height = h * 2;
  const ctx = canvas.getContext("2d")!;
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, w * 2, h * 2);
    URL.revokeObjectURL(url);
    const link = document.createElement("a");
    link.download = "nexari-report.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  img.src = url;
}

function StyleRec({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4 bg-[var(--bg-tertiary)] p-5 border border-[var(--border-primary)] card-nexus">
      <div className="w-10 h-10 bg-[color-mix(in_srgb,var(--accent-aurum)_10%,transparent)] flex items-center justify-center flex-shrink-0 rounded-full border border-[color-mix(in_srgb,var(--accent-aurum)_20%,transparent)]">
        {icon}
      </div>
      <div>
        <h4 className="type-label text-[var(--text-primary)] mb-1">{title}</h4>
        <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function MetricTile({ label, score }: { label: string; score: number }) {
  let borderColor = "border-[var(--border-primary)]";
  if (score >= 8) borderColor = "border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]";
  else if (score >= 6) borderColor = "border-[color-mix(in_srgb,var(--accent-nexus)_30%,transparent)]";
  else if (score < 5) borderColor = "border-purple-500/30";

  return (
    <div className={`bg-[var(--bg-tertiary)] p-4 border ${borderColor} text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
      <span className="type-label text-[var(--text-muted)] block">{label}</span>
      <span className="font-display font-bold text-[var(--text-primary)] text-2xl mt-1 block">
        {score.toFixed(1)}
      </span>
      <span className="type-mono text-[var(--text-muted)]">/10</span>
    </div>
  );
}
