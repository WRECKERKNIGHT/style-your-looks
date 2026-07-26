"use client";

import { useState, useEffect } from "react";
import { getHistory, deleteFromHistory, clearHistory, type AnalysisEntry } from "@/lib/history";
import { useAnalysisStore } from "@/store/analysis-store";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Clock, ScanFace, Layers, Palette, ChevronRight, X } from "lucide-react";

export default function HistoryPage() {
  const [entries, setEntries] = useState<AnalysisEntry[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const router = useRouter();
  const store = useAnalysisStore();

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setEntries(getHistory());
  };

  const handleClearAll = () => {
    clearHistory();
    setEntries([]);
    setShowClearConfirm(false);
  };

  const handleLoadEntry = (entry: AnalysisEntry) => {
    if (entry.faceResult) store.setFaceResult(entry.faceResult);
    if (entry.bodyResult) store.setBodyResult(entry.bodyResult);
    if (entry.colorAnalysis) store.setColorAnalysis(entry.colorAnalysis);
    if (entry.outfitRecommendations.length > 0) store.setOutfitRecommendations(entry.outfitRecommendations);
    if (entry.thumbnailUrl) store.setUploadedImage(entry.thumbnailUrl);
    router.push("/dashboard/face-analysis");
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-amber";
    if (score >= 6) return "text-olive";
    if (score >= 4) return "text-coffee";
    return "text-burgundy";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="section-number">EST. MMXXIV // HISTORY</span>
          <div className="flex items-center gap-3 mt-3 mb-2">
            <History className="w-7 h-7 text-amber" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso tracking-tight">
              ANALYSIS <span className="text-gradient-gold">HISTORY.</span>
            </h1>
          </div>
          <p className="text-coffee font-body text-lg max-w-xl leading-relaxed">
            Your past analyses, saved locally. Click any entry to reload results.
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-body text-burgundy hover:bg-burgundy/10 transition-colors rounded-sm border border-burgundy/20"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="bg-cream border border-tan p-16 text-center vintage-border rounded-sm">
          <Clock className="w-12 h-12 text-tan/40 mx-auto mb-4" />
          <h3 className="text-lg font-display font-bold text-espresso tracking-wider mb-2">NO HISTORY YET</h3>
          <p className="text-coffee font-body text-base max-w-sm mx-auto">
            Complete a face analysis and click &quot;Save Analysis&quot; to store your results here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-cream border border-tan hover:border-amber/40 transition-all vintage-border rounded-sm card-hover"
            >
              <div className="flex items-center gap-6 p-6">
                {/* Thumbnail */}
                {entry.thumbnailUrl ? (
                  <div className="w-20 h-20 flex-shrink-0 bg-parchment border border-tan rounded-sm overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.thumbnailUrl}
                      alt="Analysis thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 flex-shrink-0 bg-parchment border border-tan rounded-sm flex items-center justify-center">
                    <ScanFace className="w-8 h-8 text-tan/40" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-display font-bold text-espresso tracking-wider truncate">
                      {entry.label}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-coffee font-body">
                    <span>{entry.date}</span>
                    {entry.faceResult && (
                      <>
                        <span className="text-tan">|</span>
                        <span>Shape: {entry.faceResult.facialShape}</span>
                        <span className="text-tan">|</span>
                        <span className={`font-bold ${getScoreColor(entry.faceResult.overallScore)}`}>
                          Score: {entry.faceResult.overallScore.toFixed(1)}/10
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {entry.faceResult && (
                      <span className="text-xs font-mono text-amber bg-amber/10 px-2 py-0.5 rounded-full">
                        FACE
                      </span>
                    )}
                    {entry.bodyResult && (
                      <span className="text-xs font-mono text-olive bg-olive/10 px-2 py-0.5 rounded-full">
                        BODY
                      </span>
                    )}
                    {entry.colorAnalysis && (
                      <span className="text-xs font-mono text-burgundy bg-burgundy/10 px-2 py-0.5 rounded-full">
                        COLOR
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleLoadEntry(entry)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber text-cream text-sm font-body tracking-wider uppercase hover:bg-amber-light transition-colors rounded-sm shadow-gold"
                  >
                    Load
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2.5 text-coffee hover:text-burgundy hover:bg-burgundy/10 transition-colors rounded-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Clear Confirm Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-espresso/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cream p-8 w-full max-w-sm border border-tan rounded-sm shadow-elegant-lg text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-10 h-10 text-burgundy mx-auto mb-4" />
              <h2 className="text-lg font-display font-bold text-espresso tracking-wider mb-3">
                CLEAR ALL HISTORY?
              </h2>
              <p className="text-sm text-coffee font-body mb-6">
                This will permanently delete all {entries.length} saved analyses.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 bg-parchment text-espresso font-body text-base tracking-wider uppercase border border-tan rounded-sm hover:bg-tan/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-3 bg-burgundy text-cream font-body text-base tracking-wider uppercase rounded-sm hover:bg-burgundy-light transition-colors"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
