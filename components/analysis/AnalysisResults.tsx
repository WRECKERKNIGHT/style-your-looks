"use client";

import { useAnalysisStore } from "@/store/analysis-store";
import { ScoreGauge } from "./ScoreGauge";
import { MetricBar } from "./MetricBar";
import { SCORE_METRICS } from "@/lib/constants";
import { motion } from "framer-motion";
import {
  Sparkles,
  Scissors,
  Heart,
  ScanFace,
} from "lucide-react";

export function AnalysisResults() {
  const { faceResult } = useAnalysisStore();

  if (!faceResult) return null;

  const metrics = SCORE_METRICS.face;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Overall Score */}
      <div className="bg-white rounded-3xl p-8 border border-[#E8E0D8] shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreGauge score={faceResult.overallScore} size="lg" label="Overall FaceIQ" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-[#C89D7C]" />
              <h3 className="font-semibold text-[#3C2A21]">Facial Analysis</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[#FDFBF7] rounded-xl p-3">
                <span className="text-[#8B7D6B] text-xs">Face Shape</span>
                <p className="font-medium text-[#3C2A21]">{faceResult.facialShape}</p>
              </div>
              <div className="bg-[#FDFBF7] rounded-xl p-3">
                <span className="text-[#8B7D6B] text-xs">Skin Tone</span>
                <p className="font-medium text-[#3C2A21]">{faceResult.skinTone}</p>
              </div>
              <div className="bg-[#FDFBF7] rounded-xl p-3">
                <span className="text-[#8B7D6B] text-xs">Undertone</span>
                <p className="font-medium text-[#3C2A21]">{faceResult.undertone}</p>
              </div>
              <div className="bg-[#FDFBF7] rounded-xl p-3">
                <span className="text-[#8B7D6B] text-xs">Emotion</span>
                <p className="font-medium text-[#3C2A21]">{faceResult.emotionDetected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-white rounded-3xl p-8 border border-[#E8E0D8] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#C89D7C]" />
          <h3 className="font-semibold text-[#3C2A21]">Detailed Metrics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => {
            const scoreMap: Record<string, number> = {
              symmetry: faceResult.symmetry,
              proportions: faceResult.proportions,
              jawline: faceResult.jawline,
              eyeSpacing: faceResult.eyeSpacing,
              skinClarity: faceResult.skinClarity,
              facialShape: faceResult.overallScore,
            };
            return (
              <MetricBar
                key={metric.key}
                label={metric.label}
                score={scoreMap[metric.key] || 0}
                description={metric.description}
              />
            );
          })}
        </div>
      </div>

      {/* Score Gauges Row */}
      <div className="bg-white rounded-3xl p-8 border border-[#E8E0D8] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-5 h-5 text-[#C89D7C]" />
          <h3 className="font-semibold text-[#3C2A21]">Score Breakdown</h3>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <ScoreGauge score={faceResult.symmetry} size="sm" label="Symmetry" />
          <ScoreGauge score={faceResult.proportions} size="sm" label="Proportions" />
          <ScoreGauge score={faceResult.jawline} size="sm" label="Jawline" />
          <ScoreGauge score={faceResult.eyeSpacing} size="sm" label="Eye Spacing" />
          <ScoreGauge score={faceResult.skinClarity} size="sm" label="Skin" />
        </div>
      </div>

      {/* Grooming Suggestions */}
      <div className="bg-white rounded-3xl p-8 border border-[#E8E0D8] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Scissors className="w-5 h-5 text-[#C89D7C]" />
          <h3 className="font-semibold text-[#3C2A21]">Grooming Suggestions</h3>
        </div>
        <div className="space-y-3">
          {faceResult.groomingSuggestions.map((suggestion, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-[#FDFBF7] rounded-xl p-4"
            >
              <div className="w-6 h-6 rounded-full bg-[#C89D7C]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#C89D7C]">{i + 1}</span>
              </div>
              <p className="text-sm text-[#3C2A21]">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
