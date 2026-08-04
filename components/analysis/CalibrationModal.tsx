"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, Check, X, ScanLine, Ruler } from "lucide-react";
import type { AnalysisProfile } from "@/lib/ml/scoring";

export interface CalibrationProfile {
  lensDistanceCm: number;
  gender: AnalysisProfile;
  ageRange: string;
  symmetryExpected: boolean;
}

interface CalibrationModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (profile: CalibrationProfile) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const GENDERS: { value: AnalysisProfile; label: string; detail: string }[] = [
  { value: "masculine", label: "MASCULINE", detail: "Jaw & FWHR weighted" },
  { value: "feminine", label: "FEMININE", detail: "Lips, tilt & cheeks weighted" },
  { value: "neutral", label: "NEUTRAL", detail: "Balanced standards" },
];

const AGE_RANGES = ["18–24", "25–34", "35–44", "45+"];

const CHECKLIST = [
  { id: "frame", label: "FACE FILLS THE FRAME", detail: "Chin included, no crop at the forehead." },
  { id: "light", label: "SOFT, EVEN LIGHT", detail: "Window light from the front, no hard shadows." },
  { id: "eye", label: "CAMERA AT EYE LEVEL", detail: "Straight-on, head roll under 15°." },
];

const STEP_TITLES = ["CAPTURE DISTANCE", "CALIBRATION PROFILE", "VERIFY SETUP"];

export function CalibrationModal({ open, onClose, onComplete }: CalibrationModalProps) {
  const [step, setStep] = useState(0);
  const [lensDistanceCm, setLensDistanceCm] = useState(120);
  const [gender, setGender] = useState<AnalysisProfile>("neutral");
  const [ageRange, setAgeRange] = useState(AGE_RANGES[1]);
  const [symmetryExpected, setSymmetryExpected] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step === 0) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step, onClose]);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setChecked({});
    }
  }, [open]);

  const distanceLabel = useMemo(() => {
    if (lensDistanceCm < 60) return "SELFIE / CLOSE-UP";
    if (lensDistanceCm < 120) return "TIGHT PORTRAIT";
    if (lensDistanceCm < 200) return "STANDARD PORTRAIT";
    return "FULL BODY / AWAY";
  }, [lensDistanceCm]);

  const allChecked = CHECKLIST.every((item) => checked[item.id]);

  const finish = () => {
    onComplete({ lensDistanceCm, gender, ageRange, symmetryExpected });
    onClose();
  };

  const canContinue = step === 2 ? allChecked : true;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6"
        >
          <div
            className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-md"
            onClick={() => step === 0 && onClose()}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative w-full max-w-2xl glass-card overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurum-400/60 to-transparent" />
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

            <div className="relative z-10">
              {/* header */}
              <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-[var(--border-primary)]/60">
                <div>
                  <span className="section-number">PRE-SCAN CALIBRATION</span>
                  <h2 className="type-heading text-[var(--text-primary)] mt-1.5">
                    {STEP_TITLES[step]}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close calibration"
                  className="w-9 h-9 rounded-sm border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-aurum-500/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* progress */}
              <div className="flex items-center gap-2 px-8 pt-5">
                {STEP_TITLES.map((title, i) => (
                  <div key={title} className="flex-1">
                    <div
                      className={`h-1 rounded-full transition-colors duration-500 ${
                        i <= step
                          ? "bg-gradient-to-r from-aurum-500 to-aurum-300"
                          : "bg-[var(--border-primary)]/50"
                      }`}
                    />
                    <span
                      className={`type-mono text-[0.45rem] tracking-[0.2em] mt-1.5 block ${
                        i === step ? "text-[var(--accent-aurum)]" : "text-[var(--text-muted)]/60"
                      }`}
                    >
                      0{i + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* body */}
              <div className="px-8 py-7 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="space-y-7"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-gradient-aurum flex items-center justify-center shadow-aurum">
                          <Ruler className="w-4.5 h-4.5 text-white" />
                        </span>
                        <p className="text-sm text-[var(--text-secondary)] font-body leading-relaxed">
                          How far will the camera be from your face? This tunes iris-based
                          physical scaling for the scan.
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-[0.2em] uppercase">
                            LENS DISTANCE
                          </span>
                          <span className="type-mono text-[0.7rem] text-[var(--accent-aurum)] tracking-widest font-bold">
                            ~{lensDistanceCm} CM &middot; {distanceLabel}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={30}
                          max={300}
                          step={10}
                          value={lensDistanceCm}
                          onChange={(e) => setLensDistanceCm(Number(e.target.value))}
                          className="w-full accent-[var(--accent-caramel)]"
                          aria-label="Lens distance in centimetres"
                        />
                        <div className="flex justify-between type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest mt-1.5">
                          <span>30CM</span>
                          <span>150CM</span>
                          <span>300CM</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { cm: 50, label: "SELFIE" },
                          { cm: 120, label: "PORTRAIT" },
                          { cm: 220, label: "AWAY" },
                        ].map((preset) => (
                          <button
                            key={preset.cm}
                            type="button"
                            onClick={() => setLensDistanceCm(preset.cm)}
                            className={`border px-3 py-2.5 text-left transition-all ${
                              Math.abs(lensDistanceCm - preset.cm) <= 15
                                ? "border-aurum-500/70 bg-aurum-500/[0.07]"
                                : "border-[var(--border-primary)] hover:border-aurum-500/40"
                            }`}
                          >
                            <span
                              className={`block text-xs font-bold font-body uppercase tracking-wider ${
                                Math.abs(lensDistanceCm - preset.cm) <= 15
                                  ? "text-[var(--accent-aurum)]"
                                  : "text-[var(--text-primary)]"
                              }`}
                            >
                              {preset.label}
                            </span>
                            <span className="block text-[0.6rem] font-body text-[var(--text-muted)] mt-0.5">
                              ~{preset.cm}cm
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="space-y-7"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-gradient-aurum flex items-center justify-center shadow-aurum">
                          <Camera className="w-4.5 h-4.5 text-white" />
                        </span>
                        <p className="text-sm text-[var(--text-secondary)] font-body leading-relaxed">
                          A short profile sharpens the scoring weights. Adjust it only if the
                          defaults feel off.
                        </p>
                      </div>

                      <div>
                        <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-[0.2em] uppercase block mb-2.5">
                          GENDER PROFILE
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {GENDERS.map((g) => (
                            <button
                              key={g.value}
                              type="button"
                              onClick={() => setGender(g.value)}
                              className={`border px-3 py-2.5 text-left transition-all ${
                                gender === g.value
                                  ? "border-aurum-500/70 bg-aurum-500/[0.07]"
                                  : "border-[var(--border-primary)] hover:border-aurum-500/40"
                              }`}
                            >
                              <span
                                className={`block text-xs font-bold font-body uppercase tracking-wider ${
                                  gender === g.value
                                    ? "text-[var(--accent-aurum)]"
                                    : "text-[var(--text-primary)]"
                                }`}
                              >
                                {g.label}
                              </span>
                              <span className="block text-[0.6rem] font-body text-[var(--text-muted)] mt-0.5">
                                {g.detail}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="type-mono text-[0.55rem] text-[var(--text-muted)] tracking-[0.2em] uppercase block mb-2.5">
                          AGE RANGE
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {AGE_RANGES.map((age) => (
                            <button
                              key={age}
                              type="button"
                              onClick={() => setAgeRange(age)}
                              className={`px-4 py-2 border text-xs font-bold font-body uppercase tracking-wider transition-all ${
                                ageRange === age
                                  ? "border-aurum-500/70 bg-aurum-500/[0.07] text-[var(--accent-aurum)]"
                                  : "border-[var(--border-primary)] text-[var(--text-primary)] hover:border-aurum-500/40"
                              }`}
                            >
                              {age}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSymmetryExpected((v) => !v)}
                        className={`flex items-center justify-between w-full border px-4 py-3.5 transition-all ${
                          symmetryExpected
                            ? "border-aurum-500/70 bg-aurum-500/[0.07]"
                            : "border-[var(--border-primary)] hover:border-aurum-500/40"
                        }`}
                      >
                        <span className="text-left">
                          <span className="block text-xs font-bold font-body uppercase tracking-wider text-[var(--text-primary)]">
                            EXPECT SYMMETRIC FACE
                          </span>
                          <span className="block text-[0.65rem] font-body text-[var(--text-muted)] mt-0.5">
                            Relaxed, straight-on face for symmetry scoring
                          </span>
                        </span>
                        <span
                          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                            symmetryExpected
                              ? "bg-gradient-aurum border-transparent"
                              : "border-[var(--border-primary)]"
                          }`}
                        >
                          {symmetryExpected && <Check className="w-4 h-4 text-white" />}
                        </span>
                      </button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* wireframe preview */}
                        <div className="relative w-40 h-48 shrink-0 rounded-lg border border-dashed border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)] overflow-hidden bg-[var(--bg-secondary)]">
                          <svg viewBox="0 0 160 192" className="w-full h-full">
                            <ellipse
                              cx="80"
                              cy="92"
                              rx="44"
                              ry="58"
                              fill="none"
                              stroke="var(--accent-aurum)"
                              strokeWidth="1.5"
                              opacity="0.5"
                            />
                            {[
                              [80, 52],
                              [52, 82],
                              [108, 82],
                              [66, 128],
                              [94, 128],
                            ].map(([x, y], i) => (
                              <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="3"
                                fill="var(--accent-caramel)"
                              />
                            ))}
                            <circle cx="80" cy="82" r="4" fill="var(--accent-honey)" />
                          </svg>
                          <motion.div
                            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-aurum-400 to-transparent"
                            initial={{ top: "10%" }}
                            animate={{ top: ["10%", "90%", "10%"] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <ScanLine className="absolute bottom-2 left-2 w-3.5 h-3.5 text-[var(--accent-aurum)] opacity-70" />
                        </div>

                        <div>
                          <span className="section-number">SCAN PREVIEW</span>
                          <h3 className="type-subhead text-[var(--text-primary)] mt-1.5">
                            Your face will be measured across 200+ points.
                          </h3>
                          <p className="text-sm text-[var(--text-muted)] font-body mt-2 leading-relaxed">
                            Confirm each checklist item — the engine flags non-frontal or
                            poorly lit frames automatically.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {CHECKLIST.map((item) => {
                          const isChecked = checked[item.id];
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setChecked((c) => ({ ...c, [item.id]: !c[item.id] }))
                              }
                              className={`flex items-center justify-between w-full border px-4 py-3.5 text-left transition-all ${
                                isChecked
                                  ? "border-aurum-500/70 bg-aurum-500/[0.07]"
                                  : "border-[var(--border-primary)] hover:border-aurum-500/40"
                              }`}
                            >
                              <span>
                                <span className="block text-xs font-bold font-body uppercase tracking-wider text-[var(--text-primary)]">
                                  {item.label}
                                </span>
                                <span className="block text-[0.65rem] font-body text-[var(--text-muted)] mt-0.5">
                                  {item.detail}
                                </span>
                              </span>
                              <span
                                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? "bg-gradient-aurum border-transparent"
                                    : "border-[var(--border-primary)]"
                                }`}
                              >
                                {isChecked && <Check className="w-4 h-4 text-white" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* footer */}
              <div className="flex items-center justify-between px-8 pb-7 pt-1">
                <button
                  onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
                  className="flex items-center gap-1.5 text-xs type-mono tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  {step === 0 ? "Cancel" : "Back"}
                </button>

                {step < 2 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep((s) => s + 1)}
                    className="btn-nexus !py-2.5 !px-5"
                  >
                    CONTINUE
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={canContinue ? { scale: 1.02 } : undefined}
                    whileTap={canContinue ? { scale: 0.98 } : undefined}
                    onClick={canContinue ? finish : undefined}
                    disabled={!canContinue}
                    className={`btn-nexus !py-2.5 !px-5 ${
                      canContinue ? "" : "opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    BEGIN CAPTURE
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
