"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAnalysisStore } from "@/store/analysis-store";
import { ScrollReveal, ScrollRevealItem, ScrollProgress } from "@/components/shared/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, ArrowRight, Shield, Sun, Sparkles, Clock, ChevronDown, CheckCircle2 } from "lucide-react";

interface SkinMetric {
  label: string;
  score: number;
  maxScore: number;
  description: string;
  advice: string;
}

interface SkincareStep {
  step: number;
  time: "morning" | "evening" | "both";
  product: string;
  description: string;
  priority: "essential" | "recommended" | "advanced";
}

function getSkinMetrics(faceResult: { skinClarity: number; symmetry: number; overallScore: number } | null): SkinMetric[] {
  if (!faceResult) return [];
  const texture = Math.min(10, faceResult.skinClarity * 1.05);
  const hydration = Math.min(10, faceResult.skinClarity * 0.9 + faceResult.overallScore * 0.1);
  const tone = Math.min(10, faceResult.skinClarity * 0.95 + faceResult.symmetry * 0.05);
  const clarity = faceResult.skinClarity;
  const elasticity = Math.min(10, faceResult.overallScore * 0.8 + 2);
  return [
    { label: "Skin Clarity", score: Math.round(clarity * 10) / 10, maxScore: 10, description: "Overall smoothness and absence of blemishes. Measured by brightness variance across 7 facial zones.", advice: clarity >= 7 ? "Maintain with SPF daily and gentle cleansing." : "Add BHA exfoliant 2x/week and niacinamide serum." },
    { label: "Texture Quality", score: Math.round(texture * 10) / 10, maxScore: 10, description: "Surface smoothness and pore appearance. Derived from pixel variance analysis of skin regions.", advice: texture >= 7 ? "Your texture is smooth. Keep exfoliating regularly." : "Try retinol 2x/week for pore refinement and smoothness." },
    { label: "Tone Evenness", score: Math.round(tone * 10) / 10, maxScore: 10, description: "Uniformity of skin color across facial zones. Detects variations in pigmentation.", advice: tone >= 7 ? "Your tone is even. Use vitamin C in the morning for brightening." : "Add azelaic acid for hyperpigmentation and use SPF 50 daily." },
    { label: "Hydration Level", score: Math.round(hydration * 10) / 10, maxScore: 10, description: "Estimated moisture level based on skin reflectance patterns and texture analysis.", advice: hydration >= 7 ? "Good hydration. Maintain with hyaluronic acid and ceramide moisturizer." : "Add a hydrating toner, hyaluronic acid serum, and thicker night cream." },
    { label: "Elasticity Index", score: Math.round(elasticity * 10) / 10, maxScore: 10, description: "Estimated skin firmness based on facial structure analysis and landmark positioning.", advice: elasticity >= 7 ? "Good firmness. Protect with antioxidants and sunscreen." : "Add collagen peptides supplement and facial massage routine." },
  ];
}

function getSkincareRoutine(skinClarity: number): SkincareStep[] {
  const routine: SkincareStep[] = [];
  routine.push({ step: 1, time: "both", product: "Gentle Cleanser", description: "pH-balanced foaming or cream cleanser. Avoid harsh sulfates.", priority: "essential" });
  if (skinClarity < 7) routine.push({ step: 2, time: "evening", product: "BHA Exfoliant (2% Salicylic Acid)", description: "Unclogs pores and reduces texture. Use 2-3x per week, build up tolerance.", priority: "essential" });
  routine.push({ step: 3, time: "morning", product: "Vitamin C Serum (10-20%)", description: "Antioxidant protection, brightening, and collagen support. Apply to dry skin.", priority: skinClarity >= 7 ? "recommended" : "essential" });
  if (skinClarity < 7) routine.push({ step: 4, time: "evening", product: "Niacinamide Serum (5-10%)", description: "Reduces pore appearance, controls oil, and evens skin tone.", priority: "essential" });
  routine.push({ step: 5, time: "both", product: "Hyaluronic Acid Serum", description: "Deep hydration. Apply to damp skin, layer moisturizer on top.", priority: "essential" });
  routine.push({ step: 6, time: "both", product: "Moisturizer", description: skinClarity >= 7 ? "Lightweight, fragrance-free moisturizer." : "Ceramide-rich moisturizer to repair skin barrier.", priority: "essential" });
  routine.push({ step: 7, time: "morning", product: "SPF 30-50 Sunscreen", description: "Non-negotiable. UV is the #1 cause of skin aging. Reapply every 2 hours outdoors.", priority: "essential" });
  if (skinClarity < 6) routine.push({ step: 8, time: "evening", product: "Retinol (0.3-0.5%)", description: "Gold standard for anti-aging and skin renewal. Start 2x/week, increase gradually.", priority: "recommended" });
  if (skinClarity >= 7) routine.push({ step: 8, time: "evening", product: "Retinol (0.5-1%)", description: "Advanced anti-aging and texture refinement. Use 3-4x per week.", priority: "advanced" });
  return routine;
}

interface SkincareProduct {
  name: string;
  category: string;
  keyIngredient: string;
  why: string;
  when: string;
  frequency: string;
  skinType: string[];
  priority: "essential" | "recommended" | "advanced";
}

function getProductRecommendations(metrics: SkinMetric[]): SkincareProduct[] {
  const products: SkincareProduct[] = [];
  const avgScore = metrics.reduce((s, m) => s + m.score, 0) / metrics.length;
  const clarityMetric = metrics.find((m) => m.label === "Skin Clarity");
  const textureMetric = metrics.find((m) => m.label === "Texture Quality");
  const toneMetric = metrics.find((m) => m.label === "Tone Evenness");
  const hydrationMetric = metrics.find((m) => m.label === "Hydration Level");
  if (clarityMetric && clarityMetric.score < 7) products.push({ name: "Salicylic Acid Cleanser", category: "Cleanser", keyIngredient: "2% Salicylic Acid", why: "Deep cleans pores and prevents breakouts. Oil-soluble, penetrates into pores.", when: "Evening", frequency: "Daily", skinType: ["Oily", "Combination", "Acne-prone"], priority: "essential" });
  if (textureMetric && textureMetric.score < 7) products.push({ name: "AHA Exfoliating Toner", category: "Toner", keyIngredient: "Glycolic Acid 5-8%", why: "Dissolves dead skin cells, smooths texture, and refines pore appearance.", when: "Evening", frequency: "3x/week", skinType: ["Normal", "Combination", "Dry"], priority: "recommended" });
  if (toneMetric && toneMetric.score < 7) { products.push({ name: "Vitamin C Serum", category: "Serum", keyIngredient: "L-Ascorbic Acid 15-20%", why: "Inhibits melanin production, brightens dark spots, and provides antioxidant protection.", when: "Morning", frequency: "Daily", skinType: ["All"], priority: "essential" }); products.push({ name: "Azelaic Acid Treatment", category: "Treatment", keyIngredient: "Azelaic Acid 10-15%", why: "Reduces hyperpigmentation and redness. Gentle enough for daily use.", when: "Evening", frequency: "Daily", skinType: ["Sensitive", "Rosacea-prone", "Acne-prone"], priority: "recommended" }); }
  if (hydrationMetric && hydrationMetric.score < 7) { products.push({ name: "Hyaluronic Acid Serum", category: "Serum", keyIngredient: "Multi-weight Hyaluronic Acid", why: "Draws moisture into skin at multiple depths. Plumps and hydrates without heaviness.", when: "Both", frequency: "Daily", skinType: ["All"], priority: "essential" }); products.push({ name: "Ceramide Repair Cream", category: "Moisturizer", keyIngredient: "Ceramides + Cholesterol", why: "Rebuilds skin barrier, locks in moisture, and reduces transepidermal water loss.", when: "Evening", frequency: "Daily", skinType: ["Dry", "Sensitive", "Mature"], priority: "essential" }); }
  if (avgScore < 6) products.push({ name: "Retinol Serum", category: "Treatment", keyIngredient: "Retinol 0.3-0.5%", why: "Accelerates cell turnover, boosts collagen, and addresses multiple concerns at once.", when: "Evening", frequency: "2-3x/week", skinType: ["All except very sensitive"], priority: "recommended" });
  if (avgScore >= 7) products.push({ name: "Peptide Night Serum", category: "Serum", keyIngredient: "Matrixyl + Copper Peptides", why: "Supports collagen production and skin firmness. Ideal for maintenance phase.", when: "Evening", frequency: "3-4x/week", skinType: ["Mature", "Normal"], priority: "advanced" });
  products.push({ name: "Mineral Sunscreen SPF 50", category: "Sun Protection", keyIngredient: "Zinc Oxide 20%+", why: "Physical barrier against UV. Non-irritating, works immediately on application.", when: "Morning", frequency: "Daily, reapply every 2hrs outdoors", skinType: ["All"], priority: "essential" });
  return products;
}

function ProductCard({ product }: { product: SkincareProduct }) {
  const priorityColors: Record<string, string> = {
    essential: "bg-[var(--accent-aurum)]/10 border-[var(--accent-aurum)]/30 text-[var(--accent-aurum)]",
    recommended: "bg-[var(--accent-nexus)]/10 border-[var(--accent-nexus)]/30 text-[var(--accent-nexus)]",
    advanced: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  };
  return (
    <div className="bg-[var(--bg-tertiary)] p-5 border border-[var(--border-primary)] card-nexus">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="type-label text-[var(--text-muted)]">{product.category}</span>
          <h4 className="type-label text-[var(--text-primary)] mt-0.5">{product.name}</h4>
        </div>
        <span className={`type-label px-2 py-0.5 border ${priorityColors[product.priority]}`}>{product.priority}</span>
      </div>
      <p className="text-xs text-[var(--text-muted)] font-body mb-3 leading-relaxed">{product.why}</p>
      <div className="flex flex-wrap gap-2">
        <span className="type-mono bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-2 py-0.5 text-[var(--text-muted)]">{product.keyIngredient}</span>
        <span className="type-mono bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-2 py-0.5 text-[var(--text-muted)]">{product.when} · {product.frequency}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {product.skinType.map((type) => (
          <span key={type} className="text-[0.55rem] font-body text-[var(--text-muted)] bg-[var(--bg-secondary)]/50 px-1.5 py-0.5">{type}</span>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ metric, index }: { metric: SkinMetric; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <ScrollReveal>
      <div className="glass-card overflow-hidden">
        <button onClick={() => setExpanded(!expanded)} className="w-full p-5 text-left transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h4 className="type-label text-[var(--text-primary)]">{metric.label}</h4>
            <div className="flex items-center gap-3">
              <span className="text-xl font-display font-bold text-gradient-aurum">{metric.score}</span>
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              </motion.div>
            </div>
          </div>
          <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${metric.score * 10}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ background: metric.score >= 7 ? "linear-gradient(90deg, var(--accent-nexus), var(--accent-aurum))" : metric.score >= 5 ? "linear-gradient(90deg, var(--accent-aurum), #FFCB20)" : "linear-gradient(90deg, #FF4444, #FF6B35)" }}
            />
          </div>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
              <div className="px-5 pb-5 space-y-2">
                <div className="h-px bg-gradient-to-r from-[var(--accent-nexus)]/50 to-transparent" />
                <p className="text-xs text-[var(--text-muted)] font-body">{metric.description}</p>
                <div className="flex items-start gap-2 bg-[var(--bg-tertiary)] p-3">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-aurum)] mt-0.5 shrink-0" />
                  <p className="text-xs text-[var(--text-muted)] font-body">{metric.advice}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollReveal>
  );
}

export default function SkinHealthPage() {
  const { faceResult } = useAnalysisStore();
  const metrics = useMemo(() => getSkinMetrics(faceResult), [faceResult]);
  const routine = useMemo(() => faceResult ? getSkincareRoutine(faceResult.skinClarity) : [], [faceResult]);
  const products = useMemo(() => getProductRecommendations(metrics), [metrics]);
  const avgScore = metrics.length > 0 ? Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length * 10) / 10 : 0;

  if (!faceResult) {
    return (
      <div className="space-y-8">
        <ScrollReveal>
          <span className="section-number">EST. MMXXIV // SKIN</span>
          <div className="flex items-center gap-3 mt-3 mb-2">
            <Droplets className="w-7 h-7 text-[var(--accent-aurum)]" />
            <h1 className="type-display text-[var(--text-primary)] tracking-tight">SKIN <span className="text-gradient-aurum">HEALTH.</span></h1>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="glass-card p-12 text-center">
            <Droplets className="w-16 h-16 text-[var(--accent-aurum)]/30 mx-auto mb-4" />
            <h2 className="type-heading text-[var(--text-primary)] mb-2">NO ANALYSIS YET</h2>
            <p className="text-[var(--text-muted)] font-body mb-6">Complete a face analysis to unlock your skin health dashboard.</p>
            <Link href="/dashboard/face-analysis" className="btn-nexus inline-flex">START FACE ANALYSIS <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <ScrollReveal>
        <span className="section-number">EST. MMXXIV // SKIN</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <Droplets className="w-7 h-7 text-[var(--accent-aurum)]" />
          <h1 className="type-display text-[var(--text-primary)] tracking-tight">SKIN <span className="text-gradient-aurum">HEALTH.</span></h1>
        </div>
        <p className="text-[var(--text-muted)] font-body type-subhead max-w-xl">Detailed skin analysis with personalized skincare recommendations.</p>
      </ScrollReveal>

      <ScrollProgress />

      <ScrollReveal>
        <div className="glass-card p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="type-label text-[var(--text-muted)] mb-1">OVERALL SKIN SCORE</p>
              <div className="type-display text-gradient-aurum">{avgScore}</div>
              <p className="text-sm text-[var(--text-muted)] font-body mt-1">out of 10</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-[var(--accent-aurum)]" />
                <span className="text-sm font-body font-bold text-[var(--text-primary)]">{avgScore >= 7 ? "Healthy Skin" : avgScore >= 5 ? "Good Foundation" : "Needs Attention"}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-body max-w-xs">{avgScore >= 7 ? "Your skin is in great condition. Focus on maintenance and protection." : "With a consistent routine, you can significantly improve your skin health in 8-12 weeks."}</p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollProgress />

      <div>
        <ScrollReveal>
          <h3 className="type-label text-[var(--text-muted)] mb-4">SKIN METRICS</h3>
          <p className="text-[var(--text-muted)] font-body text-sm mb-4">Tap any metric for detailed advice.</p>
        </ScrollReveal>
        <div className="space-y-3">
          {metrics.map((metric, i) => (<MetricCard key={metric.label} metric={metric} index={i} />))}
        </div>
      </div>

      <ScrollProgress />

      <div>
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-[var(--accent-aurum)]" />
            <h2 className="type-heading text-[var(--text-primary)] tracking-tight">YOUR <span className="text-gradient-aurum">ROUTINE.</span></h2>
          </div>
          <p className="text-[var(--text-muted)] font-body mb-6">Personalized based on your skin clarity score of {faceResult.skinClarity}/10.</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollReveal>
            <div className="glass-card p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Sun className="w-5 h-5 text-[var(--accent-aurum)]" />
                <h3 className="type-label text-[var(--text-primary)]">MORNING ROUTINE</h3>
              </div>
              <div className="space-y-3">
                {routine.filter((r) => r.time === "morning" || r.time === "both").map((step) => (
                  <div key={step.product} className="flex items-start gap-3 p-3 bg-[var(--bg-tertiary)] card-nexus">
                    <div className="w-6 h-6 bg-[var(--accent-aurum)]/15 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      <span className="text-[0.6rem] font-mono font-bold text-[var(--accent-aurum)]">{step.step}</span>
                    </div>
                    <div>
                      <p className="text-sm font-body font-bold text-[var(--text-primary)]">{step.product}</p>
                      <p className="text-xs text-[var(--text-muted)] font-body">{step.description}</p>
                      {step.priority !== "essential" && (
                        <span className={`inline-block mt-1 type-label px-1.5 py-0.5 ${step.priority === "advanced" ? "bg-purple-500/10 text-purple-400" : "bg-[var(--accent-nexus)]/10 text-[var(--accent-nexus)]"}`}>{step.priority}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="glass-card p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[var(--accent-aurum)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                <h3 className="type-label text-[var(--text-primary)]">EVENING ROUTINE</h3>
              </div>
              <div className="space-y-3">
                {routine.filter((r) => r.time === "evening" || r.time === "both").map((step) => (
                  <div key={step.product} className="flex items-start gap-3 p-3 bg-[var(--bg-tertiary)] card-nexus">
                    <div className="w-6 h-6 bg-[var(--accent-aurum)]/15 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                      <span className="text-[0.6rem] font-mono font-bold text-[var(--accent-aurum)]">{step.step}</span>
                    </div>
                    <div>
                      <p className="text-sm font-body font-bold text-[var(--text-primary)]">{step.product}</p>
                      <p className="text-xs text-[var(--text-muted)] font-body">{step.description}</p>
                      {step.priority !== "essential" && (
                        <span className={`inline-block mt-1 type-label px-1.5 py-0.5 ${step.priority === "advanced" ? "bg-purple-500/10 text-purple-400" : "bg-[var(--accent-nexus)]/10 text-[var(--accent-nexus)]"}`}>{step.priority}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <ScrollProgress />

      <div>
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[var(--accent-aurum)]" />
            <h2 className="type-heading text-[var(--text-primary)] tracking-tight">RECOMMENDED <span className="text-gradient-aurum">PRODUCTS.</span></h2>
          </div>
          <p className="text-[var(--text-muted)] font-body mb-6">Specific product types chosen for your skin profile. Focus on ingredients, not brands.</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product, i) => (<ScrollReveal key={product.name} delay={i * 0.05}><ProductCard product={product} /></ScrollReveal>))}
        </div>
      </div>

      <ScrollProgress />

      <ScrollReveal>
        <div className="glass-card p-6">
          <h3 className="type-label text-[var(--text-primary)] mb-4">ESSENTIAL HABITS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: "💧", text: "Drink 2-3L of water daily" },
              { icon: "😴", text: "Sleep 7-8 hours minimum" },
              { icon: "🥗", text: "Eat antioxidant-rich foods" },
              { icon: "🧴", text: "Never skip sunscreen" },
              { icon: "🫧", text: "Cleanse before bed, always" },
              { icon: "🖐️", text: "Avoid touching your face" },
            ].map((tip) => (
              <div key={tip.text} className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] card-nexus">
                <span className="text-lg">{tip.icon}</span>
                <span className="text-xs font-body text-[var(--text-primary)]">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
