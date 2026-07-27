"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAnalysisStore } from "@/store/analysis-store";
import { getHistory, type AnalysisEntry } from "@/lib/history";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { motion } from "framer-motion";
import { GitCompareArrows, ArrowRight, ArrowLeft, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";

const COMPARE_METRICS = [
  { key: "overallScore", label: "Overall Score" },
  { key: "symmetry", label: "Symmetry" },
  { key: "goldenRatio", label: "Golden Ratio" },
  { key: "jawline", label: "Jawline" },
  { key: "proportions", label: "Proportions" },
  { key: "skinClarity", label: "Skin Clarity" },
  { key: "eyeSpacing", label: "Eye Spacing" },
  { key: "cheekboneDefinition", label: "Cheekbones" },
  { key: "lipFullness", label: "Lip Fullness" },
  { key: "noseProfile", label: "Nose Profile" },
  { key: "foreheadBalance", label: "Forehead" },
  { key: "facialHarmony", label: "Facial Harmony" },
] as const;

export default function FaceComparisonPage() {
  const { faceResult: currentResult, uploadedImage } = useAnalysisStore();
  const [history] = useState(() => getHistory());
  const [selectedHistory, setSelectedHistory] = useState<AnalysisEntry | null>(null);
  const [leftResult, setLeftResult] = useState<typeof currentResult>(null);
  const [rightResult, setRightResult] = useState<typeof currentResult>(null);
  const [leftLabel, setLeftLabel] = useState("Current Analysis");
  const [rightLabel, setRightLabel] = useState("Comparison");

  const setupComparison = useCallback(() => {
    if (currentResult && selectedHistory?.faceResult) {
      setLeftResult(currentResult);
      setRightResult(selectedHistory.faceResult);
      setRightLabel(selectedHistory.label || selectedHistory.date);
    } else if (currentResult) {
      setLeftResult(currentResult);
    }
  }, [currentResult, selectedHistory]);

  const hasData = leftResult && rightResult;

  return (
    <div className="space-y-8">
      <div>
        <span className="section-number">EST. MMXXIV // COMPARE</span>
        <div className="flex items-center gap-3 mt-3 mb-2">
          <GitCompareArrows className="w-7 h-7 text-amber" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
            FACE <span className="text-gradient-gold">COMPARISON.</span>
          </h1>
        </div>
        <p className="text-coffee font-body text-lg max-w-xl">
          Compare two face analyses side by side to track changes over time.
        </p>
      </div>

      {!currentResult ? (
        <div className="bg-cream p-12 border border-tan rounded-sm text-center vintage-border">
          <GitCompareArrows className="w-16 h-16 text-amber/30 mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold text-espresso mb-2">NO ANALYSIS YET</h2>
          <p className="text-coffee font-body mb-6">Complete a face analysis first to use the comparison tool.</p>
          <Link href="/dashboard/face-analysis" className="btn-gold inline-flex">
            START FACE ANALYSIS <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      ) : !hasData ? (
        <div className="space-y-6">
          {/* Current Analysis Available */}
          <div className="bg-cream p-6 border border-amber/25 rounded-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber/15 flex items-center justify-center rounded-full">
                <Star className="w-6 h-6 text-amber" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-espresso">Current Analysis Ready</h3>
                <p className="text-sm text-coffee font-body">Score: {currentResult.overallScore.toFixed(1)}/10</p>
              </div>
            </div>
          </div>

          {/* History Selection */}
          {history.length > 0 ? (
            <div>
              <h3 className="text-sm font-body text-coffee tracking-widest uppercase font-semibold mb-4">
                SELECT A PAST ANALYSIS TO COMPARE
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {history.filter((e) => e.faceResult).map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setSelectedHistory(entry);
                      setTimeout(setupComparison, 0);
                    }}
                    className="p-4 bg-cream border border-tan rounded-sm text-left hover:border-amber/40 transition-colors card-hover"
                  >
                    <div className="flex items-center gap-3">
                      {entry.thumbnailUrl ? (
                        <img src={entry.thumbnailUrl} alt="" className="w-12 h-12 object-cover rounded-sm border border-tan" />
                      ) : (
                        <div className="w-12 h-12 bg-parchment flex items-center justify-center rounded-sm border border-tan">
                          <Star className="w-5 h-5 text-amber/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body font-bold text-espresso truncate">{entry.label || "Analysis"}</p>
                        <p className="text-xs text-coffee font-body">{entry.date} | Score: {entry.faceResult?.overallScore.toFixed(1)}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-cream p-8 border border-tan rounded-sm text-center">
              <p className="text-coffee font-body">No past analyses found. Run another analysis later to compare.</p>
            </div>
          )}
        </div>
      ) : (
        /* Comparison View */
        <div className="space-y-6">
          {/* Labels */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cream p-4 border border-tan rounded-sm text-center">
              <p className="text-xs font-mono text-coffee tracking-widest mb-1">LEFT</p>
              <p className="text-sm font-display font-bold text-espresso">{leftLabel}</p>
            </div>
            <div className="bg-cream p-4 border border-tan rounded-sm text-center">
              <p className="text-xs font-mono text-coffee tracking-widest mb-1">RIGHT</p>
              <p className="text-sm font-display font-bold text-espresso">{rightLabel}</p>
            </div>
          </div>

          {/* Metric Comparison */}
          <div className="bg-cream border border-tan rounded-sm vintage-border overflow-hidden">
            <div className="p-5 border-b border-tan">
              <h3 className="text-sm font-display font-bold text-espresso tracking-widest">METRIC-BY-METRIC BREAKDOWN</h3>
            </div>
            <div className="divide-y divide-tan">
              {COMPARE_METRICS.map((metric) => {
                const leftVal = leftResult[metric.key as keyof typeof leftResult] as number;
                const rightVal = rightResult[metric.key as keyof typeof rightResult] as number;
                const diff = Math.round((rightVal - leftVal) * 10) / 10;
                const maxVal = Math.max(leftVal, rightVal, 1);

                return (
                  <div key={metric.key} className="p-4 flex items-center gap-4">
                    <div className="w-32 shrink-0">
                      <span className="text-xs font-body text-coffee">{metric.label}</span>
                    </div>

                    <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                      {/* Left bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-parchment rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber/60"
                            style={{ width: `${(leftVal / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono font-bold text-espresso w-8 text-right">{leftVal.toFixed(1)}</span>
                      </div>

                      {/* Diff indicator */}
                      <div className="w-16 flex justify-center">
                        {diff > 0 ? (
                          <span className="flex items-center gap-0.5 text-xs font-mono text-olive">
                            <TrendingUp className="w-3 h-3" />+{diff.toFixed(1)}
                          </span>
                        ) : diff < 0 ? (
                          <span className="flex items-center gap-0.5 text-xs font-mono text-burgundy">
                            <TrendingDown className="w-3 h-3" />{diff.toFixed(1)}
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-xs font-mono text-coffee">
                            <Minus className="w-3 h-3" />0
                          </span>
                        )}
                      </div>

                      {/* Right bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-espresso w-8">{rightVal.toFixed(1)}</span>
                        <div className="flex-1 h-3 bg-parchment rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-burgundy/60"
                            style={{ width: `${(rightVal / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-cream p-6 border border-tan rounded-sm vintage-border">
            <h3 className="text-sm font-display font-bold text-espresso tracking-widest mb-4">COMPARISON SUMMARY</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs font-mono text-coffee tracking-widest">LEFT SCORE</p>
                <p className="text-2xl font-display font-bold text-espresso">{leftResult.overallScore.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-coffee tracking-widest">DIFFERENCE</p>
                <p className={`text-2xl font-display font-bold ${rightResult.overallScore > leftResult.overallScore ? "text-olive" : rightResult.overallScore < leftResult.overallScore ? "text-burgundy" : "text-coffee"}`}>
                  {rightResult.overallScore > leftResult.overallScore ? "+" : ""}{(rightResult.overallScore - leftResult.overallScore).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-xs font-mono text-coffee tracking-widest">RIGHT SCORE</p>
                <p className="text-2xl font-display font-bold text-espresso">{rightResult.overallScore.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setLeftResult(null); setRightResult(null); setSelectedHistory(null); }}
            className="w-full py-4 bg-parchment hover:bg-tan/20 text-espresso font-body text-base tracking-wider uppercase transition-colors flex items-center justify-center gap-2 border border-tan rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            COMPARE DIFFERENT
          </button>
        </div>
      )}
    </div>
  );
}
