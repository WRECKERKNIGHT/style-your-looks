"use client";

import { useAnalysisStore } from "@/store/analysis-store";
import { ScoreGauge } from "@/components/analysis/ScoreGauge";
import { motion } from "framer-motion";
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
} from "lucide-react";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ScoreBadge({ label, score }: { label: string; score: number }) {
  let color = "bg-amber/15 text-amber border-amber/30";
  if (score >= 8) color = "bg-amber/20 text-amber border-amber/40";
  else if (score >= 6) color = "bg-olive/15 text-olive border-olive/30";
  else if (score < 5) color = "bg-burgundy/15 text-burgundy border-burgundy/30";

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full ${color}`}>
      <span className="text-xs font-body">{label}</span>
      <span className="text-sm font-display font-bold">{score.toFixed(1)}</span>
    </div>
  );
}

export default function StyleDnaPage() {
  const { faceResult, bodyResult, colorAnalysis } = useAnalysisStore();

  const hasData = faceResult || bodyResult;

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // STYLE DNA</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Dna className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            STYLE <span className="text-gradient-gold">DNA.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl leading-relaxed">
          Your comprehensive profile combining facial analysis, body proportions,
          skin tone, and seasonal color classification into one unified style identity.
        </p>
      </div>

      {!hasData && (
        <div className="bg-cream p-12 border border-tan vintage-border rounded-sm text-center">
          <Dna className="w-12 h-12 text-tan mx-auto mb-4" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-2">
            NO ANALYSIS DATA YET
          </h3>
          <p className="text-coffee font-body max-w-md mx-auto">
            Run a face analysis and body analysis first. Your Style DNA will be
            automatically generated from the combined results.
          </p>
        </div>
      )}

      {hasData && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* ═══════════════ MASTER PROFILE CARD ═══════════════ */}
          <motion.div
            variants={fadeUp}
            className="bg-cream p-10 border border-tan vintage-border rounded-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-5 h-5 text-amber" />
                <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                  YOUR STYLE IDENTITY
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-parchment p-6 border border-tan rounded-sm text-center">
                  <ScanFace className="w-8 h-8 text-amber mx-auto mb-3" />
                  <span className="text-xs font-body text-coffee tracking-wider uppercase">
                    Face Profile
                  </span>
                  <p className="font-display font-bold text-espresso text-xl mt-1">
                    {faceResult?.styleProfile || "—"}
                  </p>
                  <p className="text-sm text-coffee font-body mt-1">
                    {faceResult?.facialShape} shape
                  </p>
                </div>
                <div className="bg-parchment p-6 border border-tan rounded-sm text-center">
                  <Layers className="w-8 h-8 text-amber mx-auto mb-3" />
                  <span className="text-xs font-body text-coffee tracking-wider uppercase">
                    Body Profile
                  </span>
                  <p className="font-display font-bold text-espresso text-xl mt-1">
                    {bodyResult?.bodyType || "—"}
                  </p>
                  <p className="text-sm text-coffee font-body mt-1">
                    {bodyResult?.shoulderToWaistRatio
                      ? `SWR ${bodyResult.shoulderToWaistRatio}`
                      : "Awaiting scan"}
                  </p>
                </div>
                <div className="bg-parchment p-6 border border-tan rounded-sm text-center">
                  <Palette className="w-8 h-8 text-amber mx-auto mb-3" />
                  <span className="text-xs font-body text-coffee tracking-wider uppercase">
                    Color Season
                  </span>
                  <p className="font-display font-bold text-espresso text-xl mt-1">
                    {colorAnalysis?.subType || faceResult?.undertone || "—"}
                  </p>
                  <p className="text-sm text-coffee font-body mt-1">
                    {colorAnalysis?.metalPreference
                      ? `${colorAnalysis.metalPreference} metals`
                      : "Awaiting scan"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══════════════ COMPOSITE SCORES ═══════════════ */}
          {faceResult && (
            <motion.div
              variants={fadeUp}
              className="bg-cream p-10 border border-tan vintage-border rounded-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="w-5 h-5 text-amber" />
                <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                  COMPOSITE SCORES
                </h3>
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

          {/* ═══════════════ STYLE RECOMMENDATIONS ═══════════════ */}
          <motion.div
            variants={fadeUp}
            className="bg-cream p-10 border border-tan vintage-border rounded-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-amber" />
              <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                STYLE RECOMMENDATIONS
              </h3>
            </div>
            <p className="text-coffee font-body text-sm mb-8">
              Based on your {faceResult?.styleProfile || "unique"} facial profile,
              {" "}{bodyResult?.bodyType || "individual"} body type, and{" "}
              {faceResult?.undertone || "natural"} coloring.
            </p>

            <div className="space-y-5">
              {faceResult?.styleProfile === "Rugged Elegance" && (
                <>
                  <StyleRec
                    icon={<Shirt className="w-5 h-5 text-amber" />}
                    title="Wardrobe Direction"
                    text="Lean into structured pieces with rich textures. Leather jackets, tailored blazers, and quality knits. Avoid overly trendy pieces — your features carry classic well."
                  />
                  <StyleRec
                    icon={<Palette className="w-5 h-5 text-amber" />}
                    title="Power Colors"
                    text="Navy, burgundy, forest green, camel, and charcoal. These ground your strong features without competing."
                  />
                </>
              )}
              {faceResult?.styleProfile === "Classic Handsome" && (
                <>
                  <StyleRec
                    icon={<Shirt className="w-5 h-5 text-amber" />}
                    title="Wardrobe Direction"
                    text="Your balanced features suit timeless silhouettes. Invest in well-fitted essentials: Oxford shirts, chinos, leather belts, and clean sneakers."
                  />
                  <StyleRec
                    icon={<Palette className="w-5 h-5 text-amber" />}
                    title="Power Colors"
                    text="Your symmetry means you can wear a wide range. Anchor with navy and white, accent with your seasonal palette."
                  />
                </>
              )}
              {faceResult?.styleProfile === "Editorial Sharp" && (
                <>
                  <StyleRec
                    icon={<Shirt className="w-5 h-5 text-amber" />}
                    title="Wardrobe Direction"
                    text="Your angular features read editorial. Experiment with monochrome outfits, structured outerwear, and fashion-forward silhouettes."
                  />
                  <StyleRec
                    icon={<Palette className="w-5 h-5 text-amber" />}
                    title="Power Colors"
                    text="Black, white, and grey as your base. Add accent colors from your seasonal palette for visual interest."
                  />
                </>
              )}
              {!["Rugged Elegance", "Classic Handsome", "Editorial Sharp"].includes(
                faceResult?.styleProfile || ""
              ) && (
                <>
                  <StyleRec
                    icon={<Shirt className="w-5 h-5 text-amber" />}
                    title="Wardrobe Direction"
                    text="Your unique facial profile gives you versatility. Build a wardrobe of quality basics and let your features do the talking."
                  />
                  <StyleRec
                    icon={<Palette className="w-5 h-5 text-amber" />}
                    title="Power Colors"
                    text={`${faceResult?.undertone || "Natural"} palette tones will be most flattering. Use the Color Analysis page for specific recommendations.`}
                  />
                </>
              )}

              {bodyResult?.bodyType === "Inverted Triangle" && (
                <StyleRec
                  icon={<Layers className="w-5 h-5 text-amber" />}
                  title="Body Styling"
                  text="Your broader shoulders are an asset. V-neck tees and well-fitted tops highlight your V-taper. Avoid excessive shoulder padding."
                />
              )}
              {bodyResult?.bodyType === "Rectangle" && (
                <StyleRec
                  icon={<Layers className="w-5 h-5 text-amber" />}
                  title="Body Styling"
                  text="Create visual dimension with layering. Structured jackets add shoulder definition. Tapered trousers create a more dynamic silhouette."
                />
              )}
              {bodyResult?.bodyType === "Oval" && (
                <StyleRec
                  icon={<Layers className="w-5 h-5 text-amber" />}
                  title="Body Styling"
                  text="Vertical lines and structured fabrics create a leaner silhouette. Well-fitted (not tight) pieces are your friend. Monochrome outfits elongate."
                />
              )}
              {bodyResult?.bodyType === "Hourglass" && (
                <StyleRec
                  icon={<Layers className="w-5 h-5 text-amber" />}
                  title="Body Styling"
                  text="Your balanced proportions suit fitted silhouettes. Define your waist with belts and tailored pieces. Avoid boxy, oversized tops."
                />
              )}

              {faceResult?.skinClarity && faceResult.skinClarity < 6 && (
                <StyleRec
                  icon={<Droplets className="w-5 h-5 text-amber" />}
                  title="Skincare Priority"
                  text="Invest in a consistent skincare routine. A simple 4-step system (cleanse, treat, moisturize, SPF) will noticeably improve your appearance within 4-6 weeks."
                />
              )}

              {colorAnalysis && (
                <StyleRec
                  icon={<Palette className="w-5 h-5 text-amber" />}
                  title="Metal & Accessories"
                  text={`Stick to ${colorAnalysis.metalPreference.toLowerCase()} metals for watches, rings, and belt buckles. ${colorAnalysis.patternRecommendation} will complement your coloring.`}
                />
              )}
            </div>
          </motion.div>

          {/* ═══════════════ FULL METRIC GRID ═══════════════ */}
          {faceResult && (
            <motion.div
              variants={fadeUp}
              className="bg-cream p-10 border border-tan vintage-border rounded-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <ScanFace className="w-5 h-5 text-amber" />
                <h3 className="text-lg font-display font-bold text-espresso tracking-wider">
                  FULL FACE METRICS
                </h3>
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
        </motion.div>
      )}
    </div>
  );
}

function StyleRec({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4 bg-parchment p-5 border border-tan rounded-sm card-hover">
      <div className="w-10 h-10 bg-amber/10 flex items-center justify-center flex-shrink-0 rounded-full border border-amber/20">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-display font-bold text-espresso tracking-wider mb-1">
          {title}
        </h4>
        <p className="text-sm text-coffee font-body leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function MetricTile({ label, score }: { label: string; score: number }) {
  let borderColor = "border-tan";
  if (score >= 8) borderColor = "border-amber/40";
  else if (score >= 6) borderColor = "border-olive/30";
  else if (score < 5) borderColor = "border-burgundy/30";

  return (
    <div className={`bg-parchment p-4 border ${borderColor} rounded-sm text-center`}>
      <span className="text-xs font-body text-coffee tracking-wider uppercase block">
        {label}
      </span>
      <span className="font-display font-bold text-espresso text-2xl mt-1 block">
        {score.toFixed(1)}
      </span>
      <span className="text-[10px] font-mono text-coffee">/10</span>
    </div>
  );
}
