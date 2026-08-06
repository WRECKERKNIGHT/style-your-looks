"use client";

import {
  GARMENT_CATALOG,
  type GarmentLayer,
  type GarmentOptions,
  type GarmentSpec,
} from "@/lib/three/garments";
import { GLASSES_CATALOG, type GlassesOptions } from "@/lib/three/glasses";
import { HAIR_STYLES, HAIR_COLORS } from "@/lib/three/hair";
import { SKIN_TONES } from "@/lib/three/studio";
import type { BodyParams } from "@/lib/three/avatar";
import { Shirt, Glasses, Scissors, Users } from "lucide-react";

export interface StudioControlsProps {
  body: BodyParams;
  onBody: (patch: Partial<BodyParams>) => void;
  skinTone: string;
  onSkinTone: (color: string) => void;
  garment: GarmentOptions | null;
  onGarment: (g: GarmentOptions | null) => void;
  glasses: GlassesOptions | null;
  onGlasses: (g: GlassesOptions | null) => void;
  hairStyle: string;
  onHairStyle: (id: string) => void;
  hairColor: string;
  onHairColor: (color: string) => void;
  onCapture: () => void;
  onResetCamera: () => void;
  autoRotate: boolean;
  onAutoRotate: (v: boolean) => void;
}

const LAYERS: GarmentLayer[] = ["top", "outerwear", "bottom", "dress"];

function Panel({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-[var(--accent-aurum)]" />
        <h3 className="type-label text-[var(--text-primary)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  return (
    <label className="block mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase">{label}</span>
        <span className="text-[10px] font-mono text-[var(--accent-aurum)]">{display ?? value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--accent-aurum)]"
      />
    </label>
  );
}

function SwatchRow({ colors, value, onPick }: { colors: string[]; value: string | null; onPick: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onPick(c)}
          className={`w-7 h-7 rounded-full border-2 transition-all ${
            value === c ? "border-[var(--accent-aurum)] scale-110" : "border-[var(--border-primary)] hover:scale-110"
          }`}
          style={{ background: c }}
          aria-label={c}
        />
      ))}
    </div>
  );
}

export default function StudioControls({
  body,
  onBody,
  skinTone,
  onSkinTone,
  garment,
  onGarment,
  glasses,
  onGlasses,
  hairStyle,
  onHairStyle,
  hairColor,
  onHairColor,
  onCapture,
  onResetCamera,
  autoRotate,
  onAutoRotate,
}: StudioControlsProps) {
  const activeGarmentSpec: GarmentSpec | undefined = garment
    ? GARMENT_CATALOG.find((s) => s.kind === garment.kind)
    : undefined;
  const activeGlassesSpec = glasses
    ? GLASSES_CATALOG.find((s) => s.style === glasses.style)
    : undefined;

  const pickGarment = (spec: GarmentSpec) => {
    onGarment({ kind: spec.kind, color: spec.colors[0], pattern: spec.pattern, fit: 0.008 });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="AVATAR" icon={Users}>
          <div className="flex gap-2 mb-4">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => onBody({ gender: g })}
                className={`flex-1 py-2 text-xs border transition-all uppercase tracking-widest ${
                  body.gender === g
                    ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)]"
                    : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <Slider label="Height" value={body.height} min={150} max={200} step={1} onChange={(v) => onBody({ height: v })} display={`${body.height}cm`} />
          <Slider label="Build" value={body.build} min={0} max={1} step={0.01} onChange={(v) => onBody({ build: v })} />
          <Slider label="Mass" value={body.mass} min={0} max={1} step={0.01} onChange={(v) => onBody({ mass: v })} />
          <Slider label="Shoulders" value={body.shoulders} min={0} max={1} step={0.01} onChange={(v) => onBody({ shoulders: v })} />
          <Slider label="Waist Slimness" value={body.waist} min={0} max={1} step={0.01} onChange={(v) => onBody({ waist: v })} />
          <Slider label="Hips" value={body.hips} min={0} max={1} step={0.01} onChange={(v) => onBody({ hips: v })} />
          <div className="pt-2 border-t border-[var(--border-primary)]">
            <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-2">Skin Tone</p>
            <SwatchRow colors={SKIN_TONES.map((s) => s.color)} value={skinTone} onPick={onSkinTone} />
          </div>
        </Panel>

        <Panel title="HAIR" icon={Scissors}>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {HAIR_STYLES.map((h) => (
              <button
                key={h.id}
                onClick={() => onHairStyle(h.id)}
                className={`px-2.5 py-1.5 text-[10px] border transition-all tracking-wider ${
                  hairStyle === h.id
                    ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)]"
                    : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
                }`}
              >
                {h.name.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-2">Hair Color</p>
          <SwatchRow colors={HAIR_COLORS.map((c) => c.color)} value={hairColor} onPick={onHairColor} />
        </Panel>

        <Panel title="GARMENTS" icon={Shirt}>
          {LAYERS.map((layer) => (
            <details key={layer} className="mb-2">
              <summary className="type-mono text-[var(--text-muted)] cursor-pointer hover:text-[var(--accent-aurum)]">{layer.toUpperCase()}</summary>
              <div className="mt-2 space-y-1 pl-2">
                {GARMENT_CATALOG.filter((g) => g.layer === layer).map((spec) => {
                  const active = garment?.kind === spec.kind;
                  return (
                    <div key={spec.id} className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => (active ? onGarment(null) : pickGarment(spec))}
                        className={`flex-1 text-left text-xs px-2 py-1.5 border transition-all flex items-center gap-2 ${
                          active
                            ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)]"
                            : "border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
                        }`}
                      >
                        <div className="w-4 h-4 rounded" style={{ background: spec.colors[0] }} />
                        {spec.name}
                      </button>
                      {active && (
                        <SwatchRow colors={spec.colors} value={garment?.color ?? null} onPick={(c) => onGarment({ ...garment!, color: c })} />
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          ))}
          {garment && (
            <button onClick={() => onGarment(null)} className="w-full mt-2 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-aurum)] tracking-widest uppercase border border-[var(--border-primary)] py-1.5">
              Remove Garment
            </button>
          )}
        </Panel>

        <Panel title="GLASSES" icon={Glasses}>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {GLASSES_CATALOG.map((g) => {
              const active = glasses?.style === g.style;
              return (
                <button
                  key={g.id}
                  onClick={() => (active ? onGlasses(null) : onGlasses({ style: g.style, frameColor: g.colors[0], lensType: g.lensType, metal: g.metal }))}
                  className={`px-2.5 py-1.5 text-[10px] border transition-all tracking-wider ${
                    active
                      ? "border-[var(--accent-aurum)] text-[var(--accent-aurum)]"
                      : "border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_40%,transparent)]"
                  }`}
                >
                  {g.name.toUpperCase()}
                </button>
              );
            })}
          </div>
          {activeGlassesSpec && glasses && (
            <>
              <p className="text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase mb-2">Frame Color</p>
              <SwatchRow colors={activeGlassesSpec.colors} value={glasses.frameColor} onPick={(c) => onGlasses({ ...glasses, frameColor: c })} />
            </>
          )}
        </Panel>
      </div>

      <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)] tracking-widest uppercase cursor-pointer">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => onAutoRotate(e.target.checked)}
              className="accent-[var(--accent-aurum)]"
            />
            Auto Rotate
          </label>
          <button onClick={onResetCamera} className="text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--accent-aurum)] tracking-widest uppercase border border-[var(--border-primary)] px-3 py-1.5">
            Reset View
          </button>
        </div>
        <button onClick={onCapture} className="btn-nexus">
          SAVE 3D PREVIEW
        </button>
      </div>
    </div>
  );
}
