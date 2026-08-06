"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createStudioScene,
  disposeObject,
  renderStudio,
  type StudioScene,
} from "@/lib/three/studio";
import type { BodyParams } from "@/lib/three/avatar";
import type { GarmentOptions } from "@/lib/three/garments";
import type { GlassesOptions } from "@/lib/three/glasses";
import type { HairStyleId } from "@/lib/three/hair";
import StudioControls from "./StudioControls";

const DEFAULT_BODY: BodyParams = {
  gender: "male",
  height: 178,
  build: 0.5,
  mass: 0.3,
  shoulders: 0.5,
  waist: 0.5,
  hips: 0.5,
};

export default function StyleStudio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<StudioScene | null>(null);
  const rafRef = useRef<number>(0);

  const [body, setBody] = useState<BodyParams>(DEFAULT_BODY);
  const [skinTone, setSkinTone] = useState("#C99B6E");
  const [garment, setGarment] = useState<GarmentOptions | null>({
    kind: "tshirt",
    color: "#F2F0EB",
    pattern: "solid",
    fit: 0.008,
  });
  const [glasses, setGlasses] = useState<GlassesOptions | null>(null);
  const [hairStyle, setHairStyle] = useState<HairStyleId>("textured");
  const [hairColor, setHairColor] = useState("#2E2118");
  const [autoRotate, setAutoRotate] = useState(false);

  const patchBody = useCallback((patch: Partial<BodyParams>) => {
    setBody((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const studio = createStudioScene(container);
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
    renderStudio(studio, { body, skinTone, garment, glasses, hairStyle, hairColor });
  }, [body, skinTone, garment, glasses, hairStyle, hairColor]);

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
    const url = s.renderer.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "zervey-3d-preview.png";
    link.href = url;
    link.click();
  }, []);

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
          onCapture={capture}
          onResetCamera={resetCamera}
          autoRotate={autoRotate}
          onAutoRotate={setAutoRotate}
        />
      </div>
    </div>
  );
}
