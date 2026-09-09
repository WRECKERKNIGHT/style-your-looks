'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Wrench, HeartPulse } from 'lucide-react';
import type { FaceIQReport, ReportMetric } from '@/lib/ml/report/faceiq-report';

/** Curated, plain-language metrics shown to the user (real scores underneath). */
const PLAIN: Record<string, { label: string; plain: string; blurb: string }> = {
  symmetry: {
    label: 'Facial Symmetry',
    plain: 'Face symmetry',
    blurb: 'how evenly the two sides of your face match.',
  },
  goldenRatio: {
    label: 'Golden Ratio',
    plain: 'Facial balance',
    blurb: 'how well your features sit in balanced proportions.',
  },
  faceRatio: {
    label: 'Face Length / Width',
    plain: 'Face proportions',
    blurb: 'the overall length-to-width balance of your face.',
  },
  fwhr: {
    label: 'FWHR (Width-to-Height)',
    plain: 'Face proportions',
    blurb: 'the width-to-height balance of your face.',
  },
  verticalBalance: {
    label: 'Facial Thirds Balance',
    plain: 'Facial thirds',
    blurb: 'how evenly your forehead, nose and jaw divide your face.',
  },
  horizontalFifths: {
    label: 'Horizontal Fifths',
    plain: 'Feature spacing',
    blurb: 'how evenly your features are spaced side to side.',
  },
  eyeSpacing: {
    label: 'Eye Spacing',
    plain: 'Eye spacing',
    blurb: 'the distance between your eyes.',
  },
  eyeNoseRatio: {
    label: 'Eye–Nose Ratio',
    plain: 'Nose size',
    blurb: 'how big your nose is compared with your eyes.',
  },
  noseChinRatio: {
    label: 'Nose–Chin Balance',
    plain: 'Nose & chin balance',
    blurb: 'how your nose and chin balance each other.',
  },
  lipWidthRatio: {
    label: 'Lip Width Ratio',
    plain: 'Lip width',
    blurb: 'how wide your mouth is compared with your face.',
  },
  jawRatio: {
    label: 'Jawline Definition',
    plain: 'Jawline',
    blurb: 'how defined and structured your jaw looks.',
  },
  gonialAngle: {
    label: 'Gonial Angle',
    plain: 'Jaw shape',
    blurb: 'the shape and angle of your jaw corners.',
  },
  mandibularTaper: {
    label: 'Mandibular Taper',
    plain: 'Jaw taper',
    blurb: 'how much your lower face narrows toward the chin.',
  },
  cheekboneDefinition: {
    label: 'Cheekbone Definition',
    plain: 'Cheekbones',
    blurb: 'how defined your cheekbones are.',
  },
  chinProjection: {
    label: 'Chin Projection',
    plain: 'Chin',
    blurb: 'how well your chin projects forward.',
  },
  browTilt: {
    label: 'Brow Tilt',
    plain: 'Eyebrow shape',
    blurb: 'the angle and arch of your eyebrows.',
  },
  upperLipRatio: {
    label: 'Upper Lip Ratio',
    plain: 'Upper lip',
    blurb: 'the balance between your upper and lower lips.',
  },
  lipFullness: { label: 'Lip Fullness', plain: 'Lip fullness', blurb: 'how full your lips are.' },
  canthalTilt: {
    label: 'Canthal Tilt',
    plain: 'Eye lift',
    blurb: 'the tilt of your eyes at the outer corners.',
  },
  eyeAspectRatio: {
    label: 'Eye Aspect Ratio',
    plain: 'Eye shape',
    blurb: 'the openness and shape of your eyes.',
  },
  eyeTilt: { label: 'Eye Tilt', plain: 'Eye tilt', blurb: 'the average tilt of both eyes.' },
  alarAngle: {
    label: 'Nose Base Angle',
    plain: 'Nose width',
    blurb: 'the width of the base of your nose.',
  },
  noseBridgeAngle: {
    label: 'Nose Bridge Straightness',
    plain: 'Nose bridge',
    blurb: 'how straight the bridge of your nose is.',
  },
  skinClarity: {
    label: 'Skin Clarity',
    plain: 'Skin clarity',
    blurb: 'how clear and even your skin looks.',
  },
};

const CURATED_ORDER = [
  'symmetry',
  'goldenRatio',
  'fwhr',
  'jawRatio',
  'eyeSpacing',
  'noseChinRatio',
  'canthalTilt',
  'lipFullness',
  'cheekboneDefinition',
  'upperLipRatio',
  'skinClarity',
];

function verdict(score: number): { tag: string; color: string } {
  if (score >= 7.5) return { tag: 'Strong', color: '#7FB77E' };
  if (score >= 5) return { tag: 'Average', color: '#C8963E' };
  return { tag: 'Needs attention', color: '#C05B5B' };
}

function heroWord(score: number): string {
  if (score >= 8.5) return 'Outstanding';
  if (score >= 7.5) return 'Very good';
  if (score >= 6) return 'Well balanced';
  if (score >= 4.5) return 'Average';
  return 'A work in progress';
}

function Bar({ metric }: { metric: ReportMetric }) {
  const info = PLAIN[metric.key] ?? { label: metric.label, plain: metric.label, blurb: '' };
  if (metric.score === null) {
    const badge =
      metric.status === 'unavailable'
        ? 'NOT MEASURED'
        : 'NOT RELIABLE FOR THIS PHOTO';
    return (
      <div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-28 sm:w-36 flex-shrink-0">
            <p className="text-xs sm:text-sm font-body font-semibold text-[var(--text-primary)]">
              {info.plain}
            </p>
          </div>
          <div className="flex-1 h-2.5 bg-white/[0.03] rounded-full overflow-hidden" />
          <span className="w-28 sm:w-32 text-right text-[0.55rem] sm:text-[0.6rem] type-mono tracking-widest flex-shrink-0 text-[var(--text-muted)]">
            {badge}
          </span>
        </div>
        {metric.reason && (
          <p className="mt-1.5 text-[0.6rem] sm:text-xs font-body text-[var(--text-muted)] leading-snug">
            {metric.reason}
          </p>
        )}
      </div>
    );
  }
  const v = verdict(metric.score);
  const w = Math.max(4, Math.min(100, metric.score * 10));
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="w-28 sm:w-36 flex-shrink-0">
        <p className="text-xs sm:text-sm font-body font-semibold text-[var(--text-primary)]">
          {info.plain}
        </p>
      </div>
      <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${w}%`,
            background: `linear-gradient(90deg, ${v.color}cc, ${v.color})`,
          }}
        />
      </div>
      <span
        className="w-28 sm:w-32 text-right text-[0.6rem] sm:text-xs type-mono tracking-widest flex-shrink-0"
        style={{ color: v.color }}
      >
        {v.tag.toUpperCase()}
      </span>
    </div>
  );
}

export function FaceSimpleResults({ report }: { report: FaceIQReport }) {
  const [selected, setSelected] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const all = report.pillars.flatMap((p) => p.metrics);
    const byKey = new Map<string, ReportMetric>();
    for (const m of all) byKey.set(m.key, m);
    const ordered = CURATED_ORDER.map((k) => byKey.get(k)).filter((m): m is ReportMetric =>
      Boolean(m),
    );
    const rest = Array.from(byKey.values()).filter((m) => !CURATED_ORDER.includes(m.key));
    return [...ordered, ...rest];
  }, [report]);

  const scoredMetrics = useMemo(
    () => [...metrics].filter((m): m is ReportMetric & { score: number } => m.score !== null),
    [metrics],
  );

  const top = useMemo(
    () => [...scoredMetrics].sort((a, b) => b.score - a.score).slice(0, 3),
    [scoredMetrics],
  );
  const bottom = useMemo(
    () =>
      [...scoredMetrics]
        .filter((m) => m.score < 7)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3),
    [scoredMetrics],
  );
  const tips = useMemo(() => {
    const list = [...bottom, ...top];
    const seen = new Set<string>();
    const out: { label: string; tip: string }[] = [];
    for (const m of list) {
      if (seen.has(m.key)) continue;
      seen.add(m.key);
      if (out.length >= 3) break;
      out.push({ label: PLAIN[m.key]?.plain ?? m.label, tip: m.tip });
    }
    return out;
  }, [bottom, top]);

  const active = metrics.find((m) => m.key === selected);

  return (
    <div className="space-y-6">
      {/* Big simple score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden border border-[var(--border-primary)] bg-[linear-gradient(135deg,rgba(232,200,138,0.10),transparent_55%)] p-6 sm:p-10 text-center"
      >
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(232,200,138,0.12),transparent_70%)]" />
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[var(--accent-aurum)]" />
          <span className="type-mono text-[0.5rem] text-[var(--accent-aurum)] tracking-[0.3em]">
            YOUR FACE SCORE
          </span>
        </div>
        <div className="font-display font-bold text-6xl sm:text-7xl text-[var(--text-primary)]">
          {report.hero.score !== null ? (
            <>
              {report.hero.score.toFixed(1)}
              <span className="text-2xl text-[var(--text-muted)] align-top ml-1">/10</span>
            </>
          ) : (
            <span className="text-3xl sm:text-4xl text-[var(--text-muted)]">—</span>
          )}
        </div>
        <p className="mt-2 font-display text-xl sm:text-2xl text-gradient-aurum">
          {report.hero.score !== null ? heroWord(report.hero.score) : 'Not enough data'}
        </p>
        <p className="text-sm text-[var(--text-muted)] font-body mt-3 max-w-lg mx-auto">
          Measured from your photo — a higher score means a more balanced face on average. It&apos;s
          about how your features sit together, not how much you&apos;re worth.
        </p>

        {report.signatureStrengths.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {report.signatureStrengths.slice(0, 3).map((m) => (
              <span
                key={m.key}
                className="flex items-center gap-1.5 text-xs font-body text-emerald-300 border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {PLAIN[m.key]?.plain ?? m.label}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Simple bars */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card p-5 sm:p-8"
      >
        <h3 className="type-heading text-[var(--text-primary)] tracking-tight mb-1">
          How your face measures up
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-body mb-5">
          Tap any bar to see what it means and how to work with it.
        </p>

        <div className="space-y-3.5">
          {metrics.map((m) => (
            <div
              key={m.key}
              className="cursor-pointer"
              onClick={() => setSelected((s) => (s === m.key ? null : m.key))}
            >
              <Bar metric={m} />
            </div>
          ))}
        </div>

        {active && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border border-[var(--border-primary)] bg-[var(--bg-tertiary)] p-4"
          >
            <p className="text-xs font-body text-[var(--text-primary)] leading-relaxed">
              <span className="font-semibold">{PLAIN[active.key]?.plain ?? active.label}: </span>
              {PLAIN[active.key]?.blurb ?? active.description}{' '}
              {active.score !== null
                ? `Your measurement was ${verdict(active.score).tag.toLowerCase()}.`
                : "This wasn't reliably measurable from your photo."}
            </p>
            <p className="text-xs font-body text-[var(--text-muted)] leading-relaxed mt-2 border-t border-[var(--border-primary)] pt-2">
              {active.tip}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* What stands out / what to improve */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-5 sm:p-6"
        >
          <h4 className="type-subhead text-[var(--text-primary)] tracking-wider mb-3">
            What stands out
          </h4>
          <ul className="space-y-2.5">
            {top.map((m) => (
              <li
                key={m.key}
                className="flex items-start gap-2 text-sm text-[var(--text-primary)] font-body"
              >
                <Check className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold">{PLAIN[m.key]?.plain ?? m.label}</span> —{' '}
                  {PLAIN[m.key]?.blurb ?? m.description}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-5 sm:p-6"
        >
          <h4 className="type-subhead text-[var(--text-primary)] tracking-wider mb-3">
            Could use a little attention
          </h4>
          {bottom.length > 0 ? (
            <ul className="space-y-2.5">
              {bottom.map((m) => (
                <li
                  key={m.key}
                  className="flex items-start gap-2 text-sm text-[var(--text-primary)] font-body"
                >
                  <Wrench className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold">{PLAIN[m.key]?.plain ?? m.label}</span> —{' '}
                    {PLAIN[m.key]?.blurb ?? m.description}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)] font-body">
              Hardly anything to work on — most of your features measured strongly.
            </p>
          )}
        </motion.div>
      </div>

      {/* Simple tips */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <HeartPulse className="w-5 h-5 text-[var(--accent-aurum)]" />
          <h4 className="type-subhead text-[var(--text-primary)] tracking-wider">Quick tips</h4>
        </div>
        <div className="space-y-3">
          {tips.map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="font-mono text-sm text-[var(--accent-aurum)] w-5 flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-[var(--text-muted)] font-body leading-relaxed">
                <span className="font-semibold text-[var(--text-primary)]">{t.label}:</span> {t.tip}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[0.6rem] text-[var(--text-muted)] font-body border-t border-[var(--border-primary)] pt-3">
          Every bar comes from a real measurement of your photo compared with typical faces.
          It&apos;s guidance, not a verdict.
        </p>
      </motion.div>
    </div>
  );
}
