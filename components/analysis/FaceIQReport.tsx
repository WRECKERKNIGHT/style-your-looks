'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Target,
  TrendingUp,
  ChevronDown,
  Shuffle,
  Droplet,
  Bone,
  CheckCircle2,
  Circle,
  Compass,
  Layers,
} from 'lucide-react';
import type { FaceIQReport, ReportMetric, Pillar, ActionItem } from '@/lib/ml/report/faceiq-report';

const PILLAR_ACCENT: Record<string, string> = {
  harmony: '#E8C88A',
  angularity: '#C8963E',
  dimorphism: '#B98B56',
  features: '#8A5F3D',
};

function barColor(score: number): string {
  if (score >= 7.5) return '#7FB77E';
  if (score >= 6) return '#C8963E';
  if (score >= 4.5) return '#B98B56';
  return '#C05B5B';
}

function scoreWord(score: number): { word: string; tone: string } {
  if (score >= 8.5) return { word: 'Outstanding', tone: 'text-emerald-300' };
  if (score >= 7.5) return { word: 'Strong', tone: 'text-emerald-300' };
  if (score >= 6) return { word: 'Solid', tone: 'text-[var(--accent-aurum)]' };
  if (score >= 4.5) return { word: 'Average', tone: 'text-amber-300' };
  return { word: 'Below par', tone: 'text-red-300' };
}

function MetricBar({ metric, accent }: { metric: ReportMetric; accent: string }) {
  const [open, setOpen] = useState(false);
  const w = Math.max(0, Math.min(100, metric.score * 10));
  const lbl = scoreWord(metric.score);

  return (
    <div className="border border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-body font-semibold text-[var(--text-primary)] truncate">
              {metric.label}
            </span>
            {metric.genderSensitive && (
              <span className="type-mono text-[0.45rem] text-[var(--accent-aurum)] border border-aurum-500/30 px-1 py-0.5 tracking-widest">
                GENDER
              </span>
            )}
            {metric.changeable && (
              <span className="type-mono text-[0.45rem] text-emerald-300/70 border border-emerald-500/30 px-1 py-0.5 tracking-widest">
                MOVEABLE
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${w}%`,
                background: `linear-gradient(90deg, ${accent}, ${barColor(metric.score)})`,
              }}
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <span className={`font-display font-bold text-lg ${lbl.tone}`}>
            {metric.score.toFixed(1)}
          </span>
          <span className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">
            {lbl.word}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-4 pb-4 pt-1 space-y-3">
              <p className="text-xs text-[var(--text-muted)] font-body leading-relaxed">
                {metric.description}
              </p>

              <div className="grid grid-cols-3 gap-2 border-t border-[var(--border-primary)] pt-3">
                <div>
                  <p className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">
                    YOUR VALUE
                  </p>
                  <p className="text-sm font-body font-semibold text-[var(--text-primary)] mt-0.5">
                    {metric.raw !== null
                      ? `${metric.unit === '°' ? Math.round(metric.raw) : metric.raw.toFixed(2)}${metric.unit === '°' ? '°' : ''}`
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">
                    REFERENCE (±1σ)
                  </p>
                  <p className="text-sm font-body font-semibold text-[var(--text-primary)] mt-0.5">
                    {metric.refRange}
                  </p>
                </div>
                <div>
                  <p className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">
                    DEVIATION
                  </p>
                  <p className="text-sm font-body font-semibold text-[var(--text-primary)] mt-0.5">
                    {metric.z !== null ? `${metric.z >= 0 ? '+' : ''}${metric.z.toFixed(1)}σ` : '—'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[var(--text-primary)] font-body leading-relaxed bg-white/[0.02] border border-[var(--border-primary)] px-3 py-2.5">
                <span className="type-mono text-[0.45rem] tracking-widest text-[var(--accent-aurum)] block mb-1">
                  IMPROVEMENT
                </span>
                {metric.tip}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  const accent = PILLAR_ACCENT[pillar.id] ?? '#C8963E';
  const w = Math.max(0, Math.min(100, pillar.score * 10));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span
            className="type-mono text-[0.5rem] tracking-[0.25em] px-2 py-1 border"
            style={{ color: accent, borderColor: `${accent}55`, background: `${accent}11` }}
          >
            {pillar.short}
          </span>
          <h3 className="type-heading text-base text-[var(--text-primary)] tracking-tight">
            {pillar.label}
          </h3>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-bold text-2xl text-[var(--text-primary)]">
            {pillar.score.toFixed(1)}
          </span>
          <span className="type-mono text-[0.45rem] text-[var(--text-muted)]">
            /10 · p{pillar.percentile.toFixed(0)}
          </span>
        </div>
      </div>
      <p className="text-xs text-[var(--text-muted)] font-body leading-relaxed mb-4">
        {pillar.description}
      </p>

      <div className="h-1.5 bg-white/5 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${w}%`,
            background: `linear-gradient(90deg, ${accent}, ${barColor(pillar.score)})`,
          }}
        />
      </div>

      {pillar.metrics.length > 0 ? (
        <div className="space-y-2">
          {pillar.metrics.map((m) => (
            <MetricBar key={m.key} metric={m} accent={accent} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)] font-body">
          No measurements available for this view.
        </p>
      )}
    </motion.div>
  );
}

export function FaceIQReportView({ report }: { report: FaceIQReport }) {
  const [showAll, setShowAll] = useState(false);
  const hero = report.hero;
  const heroW = Math.max(2, Math.min(100, hero.score * 10));
  const word = scoreWord(hero.score);

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden border border-[var(--border-primary)] bg-[linear-gradient(135deg,rgba(232,200,138,0.08),transparent_55%)] p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(232,200,138,0.12),transparent_70%)]" />

        <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="7"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#C8963E"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - heroW / 100)}
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(200,150,62,0.5))',
                    transition: 'stroke-dashoffset 0.8s ease-out',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-display font-bold text-4xl sm:text-5xl ${word.tone}`}>
                  {hero.score.toFixed(1)}
                </span>
                <span className="type-mono text-[0.5rem] text-[var(--text-muted)] tracking-[0.25em] mt-1">
                  {hero.gradeLabel.toUpperCase()}
                </span>
              </div>
            </div>
            <span className="mt-3 type-mono text-[0.5rem] text-[var(--accent-aurum)] tracking-[0.3em]">
              {hero.grade} · FACEIQ
            </span>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[var(--accent-aurum)]" />
              <span className="type-mono text-[0.5rem] text-[var(--accent-aurum)] tracking-[0.3em]">
                FACE IQ · {report.profile.toUpperCase()} PROFILE · {report.view.toUpperCase()} VIEW
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)] tracking-tight mt-1">
              {word.word} <span className="text-gradient-aurum">facial harmony</span>
            </h2>
            <p className="text-sm text-[var(--text-muted)] font-body mt-2 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Better than ~{hero.percentile}% of faces analysed. {hero.comparison}.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-5 max-w-md mx-auto lg:mx-0">
              <div className="border border-[var(--border-primary)] bg-[var(--bg-tertiary)] p-3 text-center">
                <p className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">
                  BEAUTY INDEX
                </p>
                <p className="font-display font-bold text-lg text-[var(--text-primary)] mt-0.5">
                  {hero.beautyIndex}
                </p>
              </div>
              <div className="border border-[var(--border-primary)] bg-[var(--bg-tertiary)] p-3 text-center">
                <p className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">
                  STRUCTURE
                </p>
                <p className="font-display font-bold text-lg text-[var(--text-primary)] mt-0.5">
                  {report.structuralScore.toFixed(1)}
                </p>
              </div>
              <div className="border border-[var(--border-primary)] bg-[var(--bg-tertiary)] p-3 text-center">
                <p className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">
                  CONDITION
                </p>
                <p className="font-display font-bold text-lg text-[var(--text-primary)] mt-0.5">
                  {report.softScore.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence + availability */}
        <div className="mt-6 pt-4 border-t border-[var(--border-primary)] flex flex-wrap items-center gap-3">
          <span className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">
            {report.metricsAvailable}/{report.metricsTotal} METRICS MEASURED
          </span>
          <div className="flex-1 h-px bg-[var(--border-primary)]" />
          <span className="type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">
            CONFIDENCE {report.confidence}%
          </span>
        </div>
      </motion.div>

      {/* ── Action plan ── */}
      {report.actions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-5 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <Target className="w-5 h-5 text-[var(--accent-aurum)]" />
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight">FOCUS PLAN</h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-body mb-5">
            Ranked by impact — the biggest, most changeable gaps first. Structure (bone) ranks lower
            because it&apos;s harder to move.
          </p>

          <div className="space-y-2.5">
            {(showAll ? report.actions : report.actions.slice(0, 3)).map((a, i) => (
              <div
                key={a.metricKey}
                className="flex items-center gap-3 sm:gap-4 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] px-3 sm:px-4 py-3"
              >
                <span className="font-mono text-sm text-[var(--accent-aurum)] w-5 flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-body font-semibold text-[var(--text-primary)]">
                      {a.label}
                    </p>
                    {a.changeable ? (
                      <span className="flex items-center gap-1 type-mono text-[0.45rem] text-emerald-300/80 tracking-widest">
                        <Droplet className="w-2.5 h-2.5" /> CHANGEABLE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 type-mono text-[0.45rem] text-[var(--text-muted)] tracking-widest">
                        <Bone className="w-2.5 h-2.5" /> STRUCTURAL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-body mt-0.5 truncate">
                    {a.tip}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-sm text-emerald-300">
                    +{a.potential.toFixed(1)}
                  </p>
                  <p className="type-mono text-[0.4rem] text-[var(--text-muted)] tracking-widest">
                    POTENTIAL
                  </p>
                </div>
              </div>
            ))}
          </div>

          {report.actions.length > 3 && (
            <button
              onClick={() => setShowAll((s) => !s)}
              className="mt-4 flex items-center gap-2 text-xs type-mono tracking-widest text-[var(--accent-aurum)] hover:underline"
            >
              {showAll ? 'SHOW FEWER' : `SHOW ALL ${report.actions.length}`}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </motion.div>
      )}

      {/* ── Signature strengths ── */}
      {report.signatureStrengths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-5 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-300" />
            <h3 className="type-heading text-[var(--text-primary)] tracking-tight">
              SIGNATURE STRENGTHS
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {report.signatureStrengths.map((m) => (
              <div
                key={m.key}
                className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <div>
                  <p className="text-xs font-body font-semibold text-[var(--text-primary)]">
                    {m.label}
                  </p>
                  <p className="text-[0.6rem] type-mono text-emerald-300/80">
                    {m.score.toFixed(1)}/10
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Pillars ── */}
      {report.pillars.map((p, i) => (
        <PillarCard key={p.id} pillar={p} index={i} />
      ))}

      {/* ── View/legend note ── */}
      <div className="flex items-start gap-3 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] p-4">
        <Compass className="w-5 h-5 text-[var(--accent-aurum)] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-[var(--text-muted)] font-body leading-relaxed">
            <span className="font-bold text-[var(--text-primary)]">How to read this: </span>
            each metric is benchmarked against a population reference (±1σ range). Your value&apos;s
            deviation from that band drives its score — it&apos;s a real measurement, not a beauty
            ideal.{' '}
            {report.view === 'frontal'
              ? 'This scan used front-facing geometry.'
              : 'This scan detected profile geometry.'}{' '}
            3D/profile-only metrics are only scored when a side view supplies them.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] p-4">
        <Layers className="w-5 h-5 text-[var(--accent-aurum)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-muted)] font-body leading-relaxed">
          <span className="font-bold text-[var(--text-primary)]">Structure vs. Condition: </span>
          Structural score reflects bone geometry you largely inherit; Condition score reflects
          skin, grooming and body-composition levers you control. Both are genuinely measured from
          the same scan.
        </p>
      </div>
    </div>
  );
}
