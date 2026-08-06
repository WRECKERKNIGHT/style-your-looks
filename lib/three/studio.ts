import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildAvatar, computeMeasurements, type BodyParams } from "./avatar";
import { buildGarment, type GarmentOptions } from "./garments";
import { buildGlasses, type GlassesOptions } from "./glasses";
import { buildHair, type HairStyleId } from "./hair";

export interface StudioScene {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  avatarGroup: THREE.Group;
  garmentGroup: THREE.Group;
  glassesGroup: THREE.Group;
  hairGroup: THREE.Group;
}

export const SKIN_TONES: { id: string; name: string; color: string }[] = [
  { id: "ivory", name: "Ivory", color: "#F6E3D0" },
  { id: "fair", name: "Fair", color: "#EDD3B5" },
  { id: "light", name: "Light", color: "#E4BC98" },
  { id: "medium", name: "Medium", color: "#C99B6E" },
  { id: "tan", name: "Tan", color: "#A9794F" },
  { id: "brown", name: "Brown", color: "#8A5A3B" },
  { id: "deep", name: "Deep", color: "#6E4226" },
  { id: "dark", name: "Dark", color: "#52301C" },
];

export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((mm) => disposeMaterial(mm));
    else if (mat) disposeMaterial(mat);
  });
}

function disposeMaterial(mat: THREE.Material) {
  const m = mat as THREE.MeshStandardMaterial;
  if (m.map) m.map.dispose();
  mat.dispose();
}

/** Create the full 3D studio: renderer, camera, lights, ground and layer groups. */
export function createStudioScene(container: HTMLElement): StudioScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#161210");
  scene.fog = new THREE.Fog("#161210", 5.5, 9);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 30);
  camera.position.set(1.7, 1.05, 2.35);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.9, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.8;
  controls.maxDistance = 5;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.update();

  // Lights
  scene.add(new THREE.AmbientLight("#f5e6d0", 0.55));
  const key = new THREE.DirectionalLight("#ffe6c4", 2.2);
  key.position.set(2.4, 3.4, 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 10;
  key.shadow.camera.left = -2;
  key.shadow.camera.right = 2;
  key.shadow.camera.top = 3.5;
  key.shadow.camera.bottom = -1;
  scene.add(key);

  const rim = new THREE.DirectionalLight("#8fb4ff", 1.1);
  rim.position.set(-2.6, 1.6, -2.4);
  scene.add(rim);

  const bounce = new THREE.HemisphereLight("#c9b18a", "#2a2018", 0.5);
  scene.add(bounce);

  // Turntable pedestal — top surface sits at y=0, where the avatar's feet land
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.95, 0.06, 64),
    new THREE.MeshStandardMaterial({ color: "#241d18", roughness: 0.5, metalness: 0.25 })
  );
  pedestal.position.y = -0.03;
  pedestal.receiveShadow = true;
  scene.add(pedestal);

  const groundRing = new THREE.Mesh(
    new THREE.RingGeometry(0.95, 1.05, 64),
    new THREE.MeshBasicMaterial({ color: "#C8963E", side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
  );
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.y = -0.005;
  scene.add(groundRing);

  const avatarGroup = new THREE.Group();
  const garmentGroup = new THREE.Group();
  const glassesGroup = new THREE.Group();
  const hairGroup = new THREE.Group();
  scene.add(avatarGroup, garmentGroup, glassesGroup, hairGroup);

  return { renderer, scene, camera, controls, avatarGroup, garmentGroup, glassesGroup, hairGroup };
}

export function renderStudio(
  studio: StudioScene,
  state: {
    body: BodyParams;
    skinTone: string;
    garment: GarmentOptions | null;
    glasses: GlassesOptions | null;
    hairStyle: HairStyleId;
    hairColor: string;
  }
) {
  const { avatarGroup, garmentGroup, glassesGroup, hairGroup } = studio;

  disposeObject(avatarGroup);
  disposeObject(garmentGroup);
  disposeObject(glassesGroup);
  disposeObject(hairGroup);
  avatarGroup.clear();
  garmentGroup.clear();
  glassesGroup.clear();
  hairGroup.clear();

  const skinMat = new THREE.MeshStandardMaterial({
    color: state.skinTone,
    roughness: 0.62,
    metalness: 0.0,
  });

  const m = computeMeasurements(state.body);

  const avatar = buildAvatar(state.body, skinMat);
  avatar.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
  avatarGroup.add(avatar);
  avatarGroup.position.y = -m.soleY;

  if (state.garment) {
    const g = buildGarment(state.body, state.garment);
    g.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    garmentGroup.add(g);
    garmentGroup.position.y = -m.soleY;
  }

  if (state.glasses) {
    const g = buildGlasses(state.glasses);
    g.position.set(0, m.chinY + m.headHeight * 0.78, m.headRadius * 0.88);
    glassesGroup.add(g);
    glassesGroup.position.y = -m.soleY;
  }

  if (state.hairStyle !== "none") {
    const h = buildHair(state.body, state.hairStyle, state.hairColor);
    h.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.castShadow = true;
    });
    hairGroup.add(h);
    hairGroup.position.y = -m.soleY;
  }
}
