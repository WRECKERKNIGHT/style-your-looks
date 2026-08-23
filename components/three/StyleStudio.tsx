'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createStudioScene,
  disposeObject,
  renderStudio,
  canUseWebGL,
  type StudioScene,
} from '@/lib/three/studio';
import {
  loadMannequin,
  MANNEQUIN_CAMERA_PRESETS,
  type MannequinHandle,
} from '@/lib/three/mannequin';
import type { BodyParams } from '@/lib/three/avatar';
import type { GarmentOptions } from '@/lib/three/garments';
import type { GlassesOptions } from '@/lib/three/glasses';
import type { HairStyleId } from '@/lib/three/hair';
import type { BeardStyleId } from '@/lib/three/beard';
import { PersonStanding, Boxes } from 'lucide-react';
import StudioControls from './StudioControls';

type StudioMode = 'mannequin' | 'parametric';

const DEFAULT_BODY: BodyParams = {
  gender: 'male',
  height: 178,
  build: 0.5,
  mass: 0.3,
  shoulders: 0.5,
  waist: 0.5,
  hips: 0.5,
};

export default function StyleStudio() {
  const [mode, setMode] = useState<StudioMode>('mannequin');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setMode('mannequin')}
          aria-pressed={mode === 'mannequin'}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-body rounded-[var(--radius-pill)] transition-all ${
            mode === 'mannequin'
              ? 'btn-nexus'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_35%,transparent)]'
          }`}
        >
          <PersonStanding className="w-4 h-4" />
          REAL MANNEQUIN
        </button>
        <button
          onClick={() => setMode('parametric')}
          aria-pressed={mode === 'parametric'}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-body rounded-[var(--radius-pill)] transition-all ${
            mode === 'parametric'
              ? 'btn-nexus'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_35%,transparent)]'
          }`}
        >
          <Boxes className="w-4 h-4" />
          PARAMETRIC FIT FORM
        </button>
        <span className="text-xs font-body text-[var(--text-muted)] opacity-70 ml-1">
          {mode === 'mannequin'
            ? 'Fully rigged human model with real skeleton animation.'
            : 'Dial in exact body measurements to preview fit proportions.'}
        </span>
      </div>

      {mode === 'mannequin' ? <MannequinStage /> : <ParametricStage />}
    </div>
  );
}

/* ─────────────────────────── MANNEQUIN MODE ─────────────────────────── */

function MannequinStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<StudioScene | null>(null);
  const handleRef = useRef<MannequinHandle | null>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [playing, setPlaying] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activePreset, setActivePreset] = useState<string>('three-quarter');
  const [webglUnsupported, setWebglUnsupported] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!canUseWebGL()) {
      setWebglUnsupported(true);
      return;
    }

    let studio: StudioScene;
    let disposed = false;
    try {
      studio = createStudioScene(container);
    } catch {
      setWebglUnsupported(true);
      return;
    }
    studioRef.current = studio;

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      studio.renderer.setSize(w, h, false);
      studio.camera.aspect = w / h;
      studio.camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let handle: MannequinHandle | null = null;
    loadMannequin()
      .then((h) => {
        if (disposed) {
          h.dispose();
          return;
        }
        handle = h;
        handleRef.current = h;
        studio.scene.add(h.object);
        if (playing && h.animations.length > 0) h.playClip(0);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Mannequin load failed:', err);
        if (!disposed) setStatus('error');
      });

    lastFrameRef.current = performance.now();
    const loop = (now: number) => {
      // Clamp dt: requestAnimationFrame pauses in hidden tabs, so without a
      // cap the walk clip would fast-forward through every hidden second the
      // moment the user returns.
      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.1);
      lastFrameRef.current = now;
      handleRef.current?.update(playingRef.current ? dt : 0);
      studio.controls.update();
      studio.renderer.render(studio.scene, studio.camera);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      handle?.dispose();
      handleRef.current = null;
      disposeObject(studio.scene);
      studio.renderer.dispose();
      studio.renderer.domElement.remove();
      studioRef.current = null;
    };
    // Mount-only: playback state flows through playingRef below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the RAF loop reading fresh playback state without re-binding GL.
  const playingRef = useRef(true);
  useEffect(() => {
    playingRef.current = playing;
    const h = handleRef.current;
    if (!h) return;
    if (playing) h.playClip(0);
    else h.pause();
  }, [playing]);

  useEffect(() => {
    if (studioRef.current) {
      studioRef.current.controls.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  const applyPreset = useCallback((name: string) => {
    const s = studioRef.current;
    if (!s) return;
    const pos = MANNEQUIN_CAMERA_PRESETS[name];
    if (!pos) return;
    setActivePreset(name);
    s.camera.position.set(...pos);
    // Detail framing orbits the head; everything else frames the torso.
    s.controls.target.set(name === 'detail' ? 0 : 0, name === 'detail' ? 1.5 : 0.95, 0);
    s.controls.update();
  }, []);

  const capture = useCallback(() => {
    const s = studioRef.current;
    if (!s) return;
    const url = s.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'zervey-mannequin-preview.png';
    link.href = url;
    link.click();
  }, []);

  if (webglUnsupported) {
    return <WebglFallbackCard />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <div className="relative glass-card overflow-hidden" style={{ height: 640 }}>
          <div ref={containerRef} className="absolute inset-0" />
          {status !== 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)] backdrop-blur-sm">
              {status === 'loading' ? (
                <div className="text-center">
                  <div className="spinner mx-auto mb-3" />
                  <p className="text-sm font-body text-[var(--text-muted)]">LOADING RIGGED MANNEQUIN…</p>
                </div>
              ) : (
                <div className="px-8 text-center max-w-sm">
                  <p className="font-semibold text-aurum-300 mb-2">Mannequin failed to load</p>
                  <p className="text-sm text-[var(--text-muted)] opacity-80">
                    The model file could not be fetched or parsed. Reload the page to retry —
                    the Parametric Fit Form remains fully available meanwhile.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="glass-card p-6 space-y-6">
          <div>
            <h3 className="type-label text-[var(--text-primary)] mb-3">STAGE CONTROLS</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(MANNEQUIN_CAMERA_PRESETS).map((name) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  aria-pressed={activePreset === name}
                  className={`px-3 py-2 text-left text-xs font-body uppercase tracking-wider rounded-[var(--radius-md)] border transition-all ${
                    activePreset === name
                      ? 'btn-nexus'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_35%,transparent)]'
                  }`}
                >
                  {name.replace('-', ' ')}
                </button>
              ))}
              <button
                onClick={() => applyPreset(activePreset)}
                className="px-3 py-2 text-left text-xs font-body uppercase tracking-wider rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[color-mix(in_srgb,var(--accent-aurum)_35%,transparent)] transition-all"
              >
                recenter
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm font-body text-[var(--text-primary)]">Walk animation</span>
              <input
                type="checkbox"
                checked={playing}
                disabled={status !== 'ready'}
                onChange={(e) => setPlaying(e.target.checked)}
                className="accent-[var(--accent-aurum)] w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm font-body text-[var(--text-primary)]">Turntable</span>
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="accent-[var(--accent-aurum)] w-4 h-4"
              />
            </label>
          </div>

          <button
            onClick={capture}
            className="btn-outline w-full justify-center"
          >
            CAPTURE PNG
          </button>

          <p className="text-xs font-body text-[var(--text-muted)] opacity-70 leading-relaxed">
            Drag to orbit · scroll to zoom. The mannequin is a real rigged glTF model — pose it
            with the walk clip and frame garment ideas from any angle.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── PARAMETRIC MODE ────────────────────────── */

function ParametricStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<StudioScene | null>(null);
  const rafRef = useRef<number>(0);

  const [body, setBody] = useState<BodyParams>(DEFAULT_BODY);
  const [skinTone, setSkinTone] = useState('#C99B6E');
  const [garment, setGarment] = useState<GarmentOptions | null>({
    kind: 'tshirt',
    color: '#F2F0EB',
    pattern: 'solid',
    fit: 0.008,
  });
  const [glasses, setGlasses] = useState<GlassesOptions | null>(null);
  const [hairStyle, setHairStyle] = useState<HairStyleId>('textured');
  const [hairColor, setHairColor] = useState('#2E2118');
  const [beardStyle, setBeardStyle] = useState<BeardStyleId>('none');
  const [beardColor, setBeardColor] = useState('#2E2118');
  const [autoRotate, setAutoRotate] = useState(false);
  const [webglUnsupported, setWebglUnsupported] = useState(false);

  const patchBody = useCallback((patch: Partial<BodyParams>) => {
    setBody((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!canUseWebGL()) {
      setWebglUnsupported(true);
      return;
    }

    let studio: StudioScene;
    try {
      studio = createStudioScene(container);
    } catch {
      setWebglUnsupported(true);
      return;
    }
    studioRef.current = studio;

    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      studio.renderer.setSize(w, h, false);
      studio.camera.aspect = w / h;
      studio.camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const loop = () => {
      studio.controls.update();
      studio.renderer.render(studio.scene, studio.camera);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      disposeObject(studio.scene);
      studio.renderer.dispose();
      studio.renderer.domElement.remove();
      studioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const studio = studioRef.current;
    if (!studio) return;
    const timer = window.setTimeout(() => {
      renderStudio(studio, {
        body,
        skinTone,
        garment,
        glasses,
        hairStyle,
        hairColor,
        beardStyle,
        beardColor,
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [body, skinTone, garment, glasses, hairStyle, hairColor, beardStyle, beardColor]);

  useEffect(() => {
    if (studioRef.current) {
      studioRef.current.controls.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  const resetCamera = useCallback(() => {
    const s = studioRef.current;
    if (!s) return;
    s.controls.target.set(0, 0.95, 0);
    s.camera.position.set(1.75, 1.25, 2.35);
    s.controls.update();
  }, []);

  const capture = useCallback(() => {
    const s = studioRef.current;
    if (!s) return;
    const url = s.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'zervey-3d-preview.png';
    link.href = url;
    link.click();
  }, []);

  if (webglUnsupported) {
    return <WebglFallbackCard />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2">
        <div ref={containerRef} className="glass-card overflow-hidden" style={{ height: 640 }} />
      </div>
      <div className="lg:col-span-3">
        <StudioControls
          body={body}
          onBody={patchBody}
          skinTone={skinTone}
          onSkinTone={setSkinTone}
          garment={garment}
          onGarment={setGarment}
          glasses={glasses}
          onGlasses={setGlasses}
          hairStyle={hairStyle}
          onHairStyle={(id) => setHairStyle(id as HairStyleId)}
          hairColor={hairColor}
          onHairColor={setHairColor}
          beardStyle={beardStyle}
          onBeardStyle={(id) => setBeardStyle(id as BeardStyleId)}
          beardColor={beardColor}
          onBeardColor={setBeardColor}
          onCapture={capture}
          onResetCamera={resetCamera}
          autoRotate={autoRotate}
          onAutoRotate={setAutoRotate}
        />
      </div>
    </div>
  );
}

function WebglFallbackCard() {
  return (
    <div className="glass-card flex items-center justify-center" style={{ height: 480 }}>
      <div className="px-8 text-center max-w-sm">
        <p className="font-semibold text-aurum-300 mb-2">3D Studio unavailable</p>
        <p className="text-sm text-[var(--text-muted)] opacity-80">
          Your browser has WebGL disabled or blocked. Enable hardware acceleration (or WebGL)
          and reload to use the 3D preview.
        </p>
      </div>
    </div>
  );
}
