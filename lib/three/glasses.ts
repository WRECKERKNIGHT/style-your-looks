import * as THREE from "three";

export type GlassesStyle = "round" | "square" | "rectangle" | "wayfarer" | "aviator" | "cat-eye" | "sport";
export type LensType = "clear" | "tint" | "dark";

export interface GlassesOptions {
  style: GlassesStyle;
  frameColor: string;
  lensColor?: string;
  lensType?: LensType;
  metal?: boolean;
}

export interface GlassesSpec {
  id: string;
  name: string;
  style: GlassesStyle;
  colors: string[];
  lensType: LensType;
  metal: boolean;
}

export const GLASSES_CATALOG: GlassesSpec[] = [
  { id: "round-gold", name: "Gold Round", style: "round", colors: ["#CCA066", "#8A5F3D"], lensType: "clear", metal: true },
  { id: "round-black", name: "Classic Round", style: "round", colors: ["#1E1B18", "#2A2622"], lensType: "clear", metal: false },
  { id: "wayfarer-black", name: "Wayfarer", style: "wayfarer", colors: ["#1E1B18", "#3A3026"], lensType: "dark", metal: false },
  { id: "wayfarer-tort", name: "Tortoise Wayfarer", style: "wayfarer", colors: ["#6B4A2E", "#8A5F3D"], lensType: "dark", metal: false },
  { id: "aviator-gold", name: "Aviator", style: "aviator", colors: ["#CCA066", "#B98B56"], lensType: "dark", metal: true },
  { id: "square-amber", name: "Amber Square", style: "square", colors: ["#C8963E", "#8A5F3D"], lensType: "clear", metal: false },
  { id: "rectangle-silver", name: "Silver Rect", style: "rectangle", colors: ["#B9C0C8", "#8A93A0"], lensType: "clear", metal: true },
  { id: "cat-eye", name: "Cat Eye", style: "cat-eye", colors: ["#2A2622", "#4A2E1E"], lensType: "tint", metal: false },
  { id: "sport", name: "Sport Wrap", style: "sport", colors: ["#1E3A5F", "#2A3A5A"], lensType: "dark", metal: false },
];

/** Build a rounded polygon path (CCW) with radius r at each corner. */
function roundedPoly(points: [number, number][], r: number): THREE.Shape {
  const s = new THREE.Shape();
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const v1 = new THREE.Vector2(p1[0] - p0[0], p1[1] - p0[1]).normalize();
    const v2 = new THREE.Vector2(p2[0] - p1[0], p2[1] - p1[1]).normalize();
    const a = new THREE.Vector2(p1[0] - v1.x * r, p1[1] - v1.y * r);
    const b = new THREE.Vector2(p1[0] + v2.x * r, p1[1] + v2.y * r);
    if (i === 0) s.moveTo(a.x, a.y);
    else s.lineTo(a.x, a.y);
    s.quadraticCurveTo(p1[0], p1[1], b.x, b.y);
  }
  s.closePath();
  return s;
}

/** Rounded rectangle outline + inner hole. */
function rectLens(w: number, h: number, thickness: number, r: number): { outer: THREE.Shape; inner: THREE.Shape } {
  const pts: [number, number][] = [
    [-w, h], [w, h], [w, -h], [-w, -h],
  ];
  const outer = roundedPoly(pts, r);
  const innerPts: [number, number][] = [
    [-w + thickness, h - thickness], [w - thickness, h - thickness], [w - thickness, -h + thickness], [-w + thickness, -h + thickness],
  ];
  const inner = roundedPoly(innerPts, r - thickness * 0.6);
  return { outer, inner };
}

function lensContours(style: GlassesStyle, w: number, h: number, thickness: number) {
  switch (style) {
    case "round": {
      const outer = new THREE.Shape();
      outer.absarc(0, 0, w, 0, Math.PI * 2, false);
      const innerPath = new THREE.Path();
      innerPath.absarc(0, 0, Math.max(w - thickness, 0.004), 0, Math.PI * 2, false);
      outer.holes.push(innerPath);
      const inner = new THREE.Shape();
      inner.absarc(0, 0, Math.max(w - thickness, 0.004), 0, Math.PI * 2, false);
      return { outer, inner };
    }
    case "square":
      return rectLens(w, h, thickness, h * 0.35);
    case "rectangle":
      return rectLens(w, h, thickness, h * 0.3);
    case "sport":
      return rectLens(w * 1.05, h * 0.9, thickness, h * 0.42);
    case "wayfarer": {
      const pts: [number, number][] = [
        [-w * 0.94, h * 0.95], [w * 0.94, h * 0.95], [w, -h * 0.8], [-w, -h * 0.8],
      ];
      const outer = roundedPoly(pts, h * 0.55);
      const iw = thickness;
      const innerPts: [number, number][] = [
        [-w * 0.94 + iw, h * 0.95 - iw], [w * 0.94 - iw, h * 0.95 - iw], [w - iw, -h * 0.8 + iw], [-w + iw, -h * 0.8 + iw],
      ];
      const inner = roundedPoly(innerPts, h * 0.45);
      return { outer, inner };
    }
    case "aviator": {
      const outer = new THREE.Shape();
      outer.moveTo(0, -h);
      outer.quadraticCurveTo(-w * 1.02, 0, -w * 0.92, h * 0.85);
      outer.quadraticCurveTo(0, h * 1.12, w * 0.92, h * 0.85);
      outer.quadraticCurveTo(w * 1.02, 0, 0, -h);
      const inner = new THREE.Path();
      const s2 = 1 - thickness / Math.min(w, h);
      inner.moveTo(0, -h * s2);
      inner.quadraticCurveTo(-w * 1.0 * s2, 0, -w * 0.9 * s2, h * 0.84 * s2);
      inner.quadraticCurveTo(0, h * 1.08 * s2, w * 0.9 * s2, h * 0.84 * s2);
      inner.quadraticCurveTo(w * 1.0 * s2, 0, 0, -h * s2);
      outer.holes.push(inner);
      const lens = new THREE.Shape();
      lens.moveTo(0, -h * s2);
      lens.quadraticCurveTo(-w * 1.0 * s2, 0, -w * 0.9 * s2, h * 0.84 * s2);
      lens.quadraticCurveTo(0, h * 1.08 * s2, w * 0.9 * s2, h * 0.84 * s2);
      lens.quadraticCurveTo(w * 1.0 * s2, 0, 0, -h * s2);
      return { outer, inner: lens };
    }
    case "cat-eye": {
      const pts: [number, number][] = [
        [-w * 0.72, h * 0.1], [w * 0.6, h * 0.18], [w, h * 0.85], [w * 0.8, -h * 0.7], [-w * 0.9, -h * 0.45],
      ];
      const outer = roundedPoly(pts, h * 0.3);
      const inner = roundedPoly(
        pts.map(([x, y]): [number, number] => [x * (1 - thickness / Math.max(w, 1)), y * (1 - thickness / Math.max(h, 1))]),
        h * 0.22
      );
      return { outer, inner };
    }
  }
}

/** Build a parametric 3D glasses frame group. Origin = between the lenses. */
export function buildGlasses(options: GlassesOptions): THREE.Group {
  const root = new THREE.Group();
  const style = options.style;
  const w = style === "round" ? 0.024 : style === "rectangle" || style === "sport" ? 0.028 : 0.026;
  const h = style === "sport" ? 0.016 : 0.02;
  const thickness = 0.005;
  const bridge = style === "sport" ? 0.014 : 0.018;
  const lensX = w + bridge / 2;

  const frameMat = new THREE.MeshStandardMaterial({
    color: options.frameColor,
    roughness: options.metal ? 0.22 : 0.5,
    metalness: options.metal ? 0.55 : 0.05,
  });

  const lensType = options.lensType ?? "clear";
  const lensColor = options.lensColor ?? "#1A1A1A";
  let lensMat: THREE.Material;
  if (lensType === "clear") {
    lensMat = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      thickness: 0.0012,
      roughness: 0.06,
      ior: 1.5,
      color: 0xffffff,
    });
  } else if (lensType === "tint") {
    lensMat = new THREE.MeshPhysicalMaterial({
      transmission: 0.88,
      thickness: 0.0012,
      roughness: 0.1,
      ior: 1.5,
      color: lensColor,
    });
  } else {
    lensMat = new THREE.MeshStandardMaterial({ color: lensColor, roughness: 0.08, metalness: 0.0 });
  }

  for (const s of [-1, 1]) {
    const { outer, inner } = lensContours(style, w, h, thickness);
    const frameGeo = new THREE.ExtrudeGeometry(outer, {
      depth: 0.0035,
      bevelEnabled: true,
      bevelThickness: 0.0006,
      bevelSize: 0.0007,
      bevelSegments: 3,
      curveSegments: 24,
    });
    frameGeo.translate(0, 0, -0.00175);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.x = s * lensX;
    root.add(frame);

    const lensGeo = new THREE.ShapeGeometry(inner);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(s * lensX, 0, -0.0017);
    root.add(lens);
  }

  // Bridge
  const bridgeMat = frameMat;
  const bridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(bridge, h * 0.16, 0.0025), bridgeMat);
  bridgeMesh.position.set(0, h * 0.45, -0.001);
  root.add(bridgeMesh);

  // Nose pads
  const padMat = new THREE.MeshStandardMaterial({ color: "#6B4A2E", roughness: 0.6 });
  for (const s of [-1, 1]) {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 10, 8), padMat);
    pad.position.set(s * (w - 0.006), -h * 0.35, -0.006);
    root.add(pad);
  }

  // Temples
  const templeLen = 0.13;
  const templeH = 0.0045;
  for (const s of [-1, 1]) {
    const outerX = s * (lensX + w);
    const temple = new THREE.Mesh(new THREE.BoxGeometry(0.0035, templeH, templeLen), frameMat);
    temple.position.set(outerX - s * 0.001, 0, -0.003 - templeLen / 2);
    temple.rotation.z = s * 0.02;
    root.add(temple);
  }

  return root;
}
